import '../data/activities.dart';
import 'recommendation_engine.dart';

/// Score an activity based on how well it matches the user's current context
int _scoreActivity(Activity activity, String mood, String location, String timePeriod, List<String> allergies) {
  int score = 0;

  if (activity.suitableMoods.contains(mood)) score += 3;
  if (activity.suitableLocations.contains(location)) {
    score += 2;
  } else {
    score -= 10;
  }

  if (activity.suitableTimePeriods != null) {
    if (activity.suitableTimePeriods!.contains(timePeriod)) {
      score += 1;
    } else {
      score -= 2;
    }
  }

  if (allergies.isNotEmpty) {
    final lowerDesc = '${activity.title} ${activity.description}'.toLowerCase();
    for (final allergy in allergies) {
      if (allergy.isNotEmpty && lowerDesc.contains(allergy.toLowerCase())) {
        score -= 100;
        break;
      }
    }
  }

  return score;
}

/// Get the best-matching activities for the current user context
List<Activity> getSuggestedActivities({
  required String mood,
  required String location,
  String? timePeriod,
  List<String> allergies = const [],
  int maxPerCategory = 2,
  int maxTotal = 6,
}) {
  final tp = timePeriod ?? getCurrentTimePeriod();

  final scored = ACTIVITIES.map((activity) {
    final s = _scoreActivity(activity, mood, location, tp, allergies);
    return MapEntry(activity, s);
  }).toList();

  final eligible = scored.where((e) => e.value > 0).toList();

  final result = <Activity>[];
  for (final cat in ACTIVITY_CATEGORIES) {
    final categoryActivities = eligible
        .where((e) => e.key.category == cat.id)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    result.addAll(categoryActivities.take(maxPerCategory).map((e) => e.key));
  }

  result.sort((a, b) {
    final aScore = eligible.firstWhere((e) => e.key.id == a.id, orElse: () => MapEntry(a, 0)).value;
    final bScore = eligible.firstWhere((e) => e.key.id == b.id, orElse: () => MapEntry(b, 0)).value;
    return bScore.compareTo(aScore);
  });

  return result.take(maxTotal).toList();
}
