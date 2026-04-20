import 'package:flutter/foundation.dart';
import '../models/mood_entry.dart';

class AppState extends ChangeNotifier {
  List<MoodEntry> moodHistory = [];
  String currentRiskLevel = 'stable';

  void addMoodEntry(String mood, String location) {
    moodHistory.add(MoodEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      mood: mood,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      location: location,
      riskLevel: 'low',
    ));
    notifyListeners();
  }
}
