// Feature options for MoodMate app

class MoodOption {
  final String id;
  final String label;
  final String emoji;
  final String color; // hex color string

  const MoodOption({
    required this.id,
    required this.label,
    required this.emoji,
    required this.color,
  });
}

class LocationOption {
  final String id;
  final String label;
  final String icon;

  const LocationOption({
    required this.id,
    required this.label,
    required this.icon,
  });
}

class TimePeriod {
  final String id;
  final String label;
  final String range;

  const TimePeriod({
    required this.id,
    required this.label,
    required this.range,
  });
}

class UserGoalOption {
  final String id;
  final String label;
  final String icon;

  const UserGoalOption({
    required this.id,
    required this.label,
    required this.icon,
  });
}

const List<MoodOption> MOODS = [
  MoodOption(id: 'happy', label: 'Happy', emoji: '😊', color: '#4ADE80'),
  MoodOption(id: 'relaxed', label: 'Relaxed', emoji: '☺️', color: '#60A5FA'),
  MoodOption(id: 'stress', label: 'Stress', emoji: '😰', color: '#F87171'),
  MoodOption(id: 'worry', label: 'Worry', emoji: '😟', color: '#FBBF24'),
  MoodOption(id: 'frustration', label: 'Frustration', emoji: '😤', color: '#FB923C'),
  MoodOption(id: 'disappointment', label: 'Disappointment', emoji: '😔', color: '#A78BFA'),
];

const List<LocationOption> LOCATIONS = [
  LocationOption(id: 'home', label: 'Home', icon: '🏠'),
  LocationOption(id: 'office', label: 'Office', icon: '🏢'),
  LocationOption(id: 'meeting_room', label: 'Meeting Room', icon: '👥'),
];

const List<TimePeriod> TIME_PERIODS = [
  TimePeriod(id: 'morning', label: 'Morning', range: '6AM - 12PM'),
  TimePeriod(id: 'afternoon', label: 'Afternoon', range: '12PM - 6PM'),
  TimePeriod(id: 'evening', label: 'Evening', range: '6PM - 10PM'),
  TimePeriod(id: 'night', label: 'Night', range: '10PM - 6AM'),
];

const List<String> DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const List<UserGoalOption> USER_GOALS = [
  UserGoalOption(id: 'relaxation', label: 'Relaxation', icon: '🧘'),
  UserGoalOption(id: 'productivity', label: 'Productivity', icon: '💪'),
  UserGoalOption(id: 'social', label: 'Social Connection', icon: '👥'),
  UserGoalOption(id: 'learning', label: 'Learning', icon: '📚'),
  UserGoalOption(id: 'exercise', label: 'Exercise', icon: '🏃'),
];

/// Helper to parse hex color string to int
int hexToColor(String hex) {
  hex = hex.replaceAll('#', '');
  if (hex.length == 6) {
    hex = 'FF$hex';
  }
  return int.parse(hex, radix: 16);
}
