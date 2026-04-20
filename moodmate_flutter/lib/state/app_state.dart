import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/mood_entry.dart';
import '../utils/recommendation_engine.dart';
import 'package:geolocator/geolocator.dart';

class UserProfile {
  List<String> allergies;
  String preferredGoal;
  Map<String, Map<String, double>> savedLocations;

  UserProfile({
    this.allergies = const [],
    this.preferredGoal = 'relaxation',
    this.savedLocations = const {},
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    Map<String, Map<String, double>> parsedLocations = {};
    if (json['savedLocations'] != null) {
      final locs = json['savedLocations'] as Map<String, dynamic>;
      locs.forEach((key, value) {
        if (value is Map<String, dynamic>) {
          parsedLocations[key] = {
            'lat': (value['lat'] as num).toDouble(),
            'lng': (value['lng'] as num).toDouble(),
          };
        }
      });
    }

    return UserProfile(
      allergies: List<String>.from(json['allergies'] ?? []),
      preferredGoal: json['preferredGoal'] ?? 'relaxation',
      savedLocations: parsedLocations,
    );
  }

  Map<String, dynamic> toJson() => {
    'allergies': allergies,
    'preferredGoal': preferredGoal,
    'savedLocations': savedLocations,
  };
}

class AppState extends ChangeNotifier {
  static const String _moodHistoryKey = '@moodmate_mood_history';
  static const String _userProfileKey = '@moodmate_user_profile';

  List<MoodEntry> moodHistory = [];
  UserProfile userProfile = UserProfile();
  bool isLoading = true;

  // Location tracking state
  String currentLocation = 'home';
  bool isLocationLoading = false;
  bool isManualOverride = false;
  bool hasLocationPermission = false;
  bool isLocationServiceEnabled = true;
  bool needsMeetingRoomConfirmation = false;

  String get currentRiskLevel => calculateRiskLevel(moodHistory);

  AppState() {
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final historyData = prefs.getString(_moodHistoryKey);
      if (historyData != null) {
        final List<dynamic> decoded = jsonDecode(historyData);
        moodHistory = decoded.map((e) => MoodEntry.fromJson(e)).toList();
      }

      final profileData = prefs.getString(_userProfileKey);
      if (profileData != null) {
        userProfile = UserProfile.fromJson(jsonDecode(profileData));
      }
    } catch (e) {
      debugPrint('Error loading data: $e');
    } finally {
      isLoading = false;
      notifyListeners();
      _initLocationTracking();
    }
  }

  Future<void> _initLocationTracking() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      isLocationServiceEnabled = await Geolocator.isLocationServiceEnabled();
      
      permission = await Geolocator.checkPermission();
      hasLocationPermission = (permission == LocationPermission.always || permission == LocationPermission.whileInUse);
      
      notifyListeners();
      
      if (hasLocationPermission && isLocationServiceEnabled) {
        refreshLocation();
      }
    } catch (e) {
      debugPrint('Error in _initLocationTracking: $e');
    }
  }

  Future<void> openAppSettings() async {
    await Geolocator.openAppSettings();
  }

  Future<void> openLocationSettings() async {
    await Geolocator.openLocationSettings();
  }

  Future<void> requestPermission() async {
    LocationPermission permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
      hasLocationPermission = true;
      notifyListeners();
      refreshLocation();
    }
  }

  Future<void> refreshLocation() async {
    if (isManualOverride) {
      debugPrint('Manual override is active, skipping auto-refresh');
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      debugPrint('No permission to refresh location: $permission');
      hasLocationPermission = false;
      notifyListeners();
      return;
    }

    hasLocationPermission = true;
    isLocationLoading = true;
    notifyListeners();

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      _matchLocation(position.latitude, position.longitude);
    } catch (e) {
      debugPrint('Error getting location: $e');
    } finally {
      isLocationLoading = false;
      notifyListeners();
    }
  }

  void _matchLocation(double lat, double lng) {
    if (userProfile.savedLocations.isEmpty) {
      currentLocation = 'home';
      return;
    }

    final Map<String, double> distances = {};
    userProfile.savedLocations.forEach((key, coords) {
      distances[key] = Geolocator.distanceBetween(
        lat, lng, coords['lat']!, coords['lng']!
      );
    });

    // Check meeting room (radius 20m)
    if (distances.containsKey('meeting_room') && distances['meeting_room']! <= 20) {
      currentLocation = 'meeting_room';
      needsMeetingRoomConfirmation = false;
      return;
    }

    // Check office (radius 100m)
    if (distances.containsKey('office') && distances['office']! <= 100) {
      currentLocation = 'office';
      needsMeetingRoomConfirmation = true; // Ask if in meeting room
      return;
    }

    // Check home (radius 100m)
    if (distances.containsKey('home') && distances['home']! <= 100) {
      currentLocation = 'home';
      needsMeetingRoomConfirmation = false;
      return;
    }

    currentLocation = 'home'; // default
    needsMeetingRoomConfirmation = false;
  }

  Future<void> saveCurrentLocation(String locationId) async {
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      final updatedLocations = Map<String, Map<String, double>>.from(userProfile.savedLocations);
      updatedLocations[locationId] = {
        'lat': position.latitude,
        'lng': position.longitude,
      };

      userProfile = UserProfile(
        allergies: userProfile.allergies,
        preferredGoal: userProfile.preferredGoal,
        savedLocations: updatedLocations,
      );
      
      notifyListeners();
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userProfileKey, jsonEncode(userProfile.toJson()));
      
      refreshLocation();
    } catch (e) {
      debugPrint('Error saving location coordinates: $e');
    }
  }

  Future<void> deleteSavedLocation(String locationId) async {
    try {
      final updatedLocations = Map<String, Map<String, double>>.from(userProfile.savedLocations);
      updatedLocations.remove(locationId);

      userProfile = UserProfile(
        allergies: userProfile.allergies,
        preferredGoal: userProfile.preferredGoal,
        savedLocations: updatedLocations,
      );
      
      notifyListeners();
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userProfileKey, jsonEncode(userProfile.toJson()));
      
      refreshLocation();
    } catch (e) {
      debugPrint('Error deleting location: $e');
    }
  }

  void manualOverrideLocation(String locationId) {
    isManualOverride = true;
    currentLocation = locationId;
    needsMeetingRoomConfirmation = false;
    notifyListeners();
  }

  void clearManualOverride() {
    isManualOverride = false;
    refreshLocation();
  }

  void confirmMeetingRoom(bool isMeetingRoom) {
    needsMeetingRoomConfirmation = false;
    if (isMeetingRoom) {
      currentLocation = 'meeting_room';
    } else {
      currentLocation = 'office';
    }
    notifyListeners();
  }

  Future<void> addMoodEntry(String mood, String location) async {
    final newEntry = MoodEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      mood: mood,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      location: location,
      riskLevel: 'low',
    );

    moodHistory.add(newEntry);
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _moodHistoryKey,
        jsonEncode(moodHistory.map((e) => e.toJson()).toList()),
      );
    } catch (e) {
      debugPrint('Error saving mood entry: $e');
    }
  }

  Future<void> updateAllergies(List<String> allergies) async {
    userProfile = UserProfile(
      allergies: allergies,
      preferredGoal: userProfile.preferredGoal,
      savedLocations: userProfile.savedLocations,
    );
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userProfileKey, jsonEncode(userProfile.toJson()));
    } catch (e) {
      debugPrint('Error saving allergies: $e');
    }
  }

  Future<void> updatePreferredGoal(String goal) async {
    userProfile = UserProfile(
      allergies: userProfile.allergies,
      preferredGoal: goal,
      savedLocations: userProfile.savedLocations,
    );
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userProfileKey, jsonEncode(userProfile.toJson()));
    } catch (e) {
      debugPrint('Error saving goal: $e');
    }
  }
}
