import 'dart:math';
import '../data/recommendations.dart';
import '../models/mood_entry.dart';

class UserContext {
  final String mood;
  final String time;
  final int dayOfWeek;
  final String location;
  final List<String> allergies;
  final String userGoal;

  UserContext({
    required this.mood,
    required this.time,
    required this.dayOfWeek,
    required this.location,
    required this.allergies,
    required this.userGoal,
  });
}

/// Get recommendation based on user context
String getRecommendation(UserContext context) {
  final locationKeywords = <String, List<String>>{
    'home': ['home', 'flexible', 'comfortable', 'cook', 'workout', 'meditation'],
    'office': ['office', 'work break', 'desk', 'stretches'],
    'meeting_room': ['meeting', 'break', 'focus'],
  };

  final moodKeywords = <String, List<String>>{
    'happy': ['enjoy', 'energizing', 'fun', 'dance', 'social'],
    'relaxed': ['relax', 'calm', 'peaceful', 'gentle', 'mindful', 'meditation'],
    'stress': ['calming', 'grounding', 'meditation', 'relax', 'soothing'],
    'worry': ['calming', 'grounding', 'reassure', 'gentle'],
    'frustration': ['release', 'exercise', 'workout', 'channel'],
    'disappointment': ['uplifting', 'comfort', 'gentle', 'kind'],
  };

  final locationWords = locationKeywords[context.location] ?? [];
  final moodWords = moodKeywords[context.mood] ?? [];

  String bestMatch = recommendations[0];
  int bestScore = 0;

  for (final rec in recommendations) {
    final lowerRec = rec.toLowerCase();
    int score = 0;

    for (final word in locationWords) {
      if (lowerRec.contains(word.toLowerCase())) score += 2;
    }
    for (final word in moodWords) {
      if (lowerRec.contains(word.toLowerCase())) score += 3;
    }

    bool hasAllergen = false;
    for (final allergy in context.allergies) {
      if (allergy.isNotEmpty && lowerRec.contains(allergy.toLowerCase())) {
        hasAllergen = true;
        break;
      }
    }
    if (hasAllergen) score = -100;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rec;
    }
  }

  return bestMatch;
}

/// Get an alternative recommendation if user rejects current one
String getAlternativeRecommendation(UserContext context, List<String> excludedRecommendations) {
  final available = recommendations.where((r) => !excludedRecommendations.contains(r)).toList();

  if (available.isEmpty) {
    return "Take a moment to breathe and do what feels right for you.";
  }

  final randomIndex = Random().nextInt(available.length);
  return available[randomIndex];
}

/// Calculate risk level based on mood history
String calculateRiskLevel(List<MoodEntry> moodHistory) {
  if (moodHistory.isEmpty) return 'stable';

  final weekAgo = DateTime.now().millisecondsSinceEpoch - 7 * 24 * 60 * 60 * 1000;
  final recentMoods = moodHistory.where((m) => m.timestamp >= weekAgo).toList();

  if (recentMoods.isEmpty) return 'stable';

  final negativeMoods = ['stress', 'worry', 'frustration', 'disappointment'];
  final negativeCount = recentMoods.where((m) => negativeMoods.contains(m.mood)).length;
  final negativeRatio = negativeCount / recentMoods.length;

  final midpoint = recentMoods.length ~/ 2;
  final firstHalf = recentMoods.sublist(0, midpoint);
  final secondHalf = recentMoods.sublist(midpoint);

  final firstNegativeRatio = firstHalf.where((m) => negativeMoods.contains(m.mood)).length / max(firstHalf.length, 1);
  final secondNegativeRatio = secondHalf.where((m) => negativeMoods.contains(m.mood)).length / max(secondHalf.length, 1);

  if (negativeRatio >= 0.6) return 'high';
  if (secondNegativeRatio < firstNegativeRatio - 0.1) return 'improving';
  return 'stable';
}

/// Get current time period
String getCurrentTimePeriod() {
  final hour = DateTime.now().hour;
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/// Get weekly mood stats for visualization
Map<String, dynamic> getWeeklyStats(List<MoodEntry> moodHistory) {
  final weekAgo = DateTime.now().millisecondsSinceEpoch - 7 * 24 * 60 * 60 * 1000;
  final recentMoods = moodHistory.where((m) => m.timestamp >= weekAgo).toList();

  final moodCounts = <String, int>{
    'happy': 0, 'relaxed': 0, 'stress': 0,
    'worry': 0, 'frustration': 0, 'disappointment': 0,
  };

  for (final entry in recentMoods) {
    if (moodCounts.containsKey(entry.mood)) {
      moodCounts[entry.mood] = moodCounts[entry.mood]! + 1;
    }
  }

  return {
    'total': recentMoods.length,
    'moodCounts': moodCounts,
    'riskLevel': calculateRiskLevel(moodHistory),
  };
}
