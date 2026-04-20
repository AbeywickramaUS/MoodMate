class Activity {
  final String id;
  final String title;
  final String description;
  final String category; // 'exercise', 'relaxation', 'games', 'outdoor'
  final String icon;
  final String duration;
  final List<String> suitableMoods;
  final List<String> suitableLocations;
  final List<String>? suitableTimePeriods;

  const Activity({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.icon,
    required this.duration,
    required this.suitableMoods,
    required this.suitableLocations,
    this.suitableTimePeriods,
  });
}

class ActivityCategoryInfo {
  final String id;
  final String label;
  final String icon;
  final String color;
  const ActivityCategoryInfo({required this.id, required this.label, required this.icon, required this.color});
}

const List<ActivityCategoryInfo> ACTIVITY_CATEGORIES = [
  ActivityCategoryInfo(id: 'exercise', label: 'Exercise', icon: '🏋️', color: '#F87171'),
  ActivityCategoryInfo(id: 'relaxation', label: 'Relaxation', icon: '🧘', color: '#60A5FA'),
  ActivityCategoryInfo(id: 'games', label: 'Games & Fun', icon: '🎮', color: '#FBBF24'),
  ActivityCategoryInfo(id: 'outdoor', label: 'Outdoor', icon: '🌿', color: '#4ADE80'),
];

const List<Activity> ACTIVITIES = [
  // Exercise
  Activity(id: 'yoga_flow', title: 'Gentle Yoga Flow', description: 'A calming sequence of poses to release tension and restore balance', category: 'exercise', icon: '🧘‍♀️', duration: '15-20 min', suitableMoods: ['stress', 'worry', 'disappointment', 'relaxed'], suitableLocations: ['home']),
  Activity(id: 'desk_stretches', title: 'Desk Stretches', description: 'Quick stretches you can do right at your desk to relieve built-up tension', category: 'exercise', icon: '🙆', duration: '5-10 min', suitableMoods: ['stress', 'frustration', 'worry'], suitableLocations: ['office', 'meeting_room']),
  Activity(id: 'hiit_workout', title: 'HIIT Workout', description: 'High-intensity interval training to channel energy and boost endorphins', category: 'exercise', icon: '🔥', duration: '20-30 min', suitableMoods: ['frustration', 'stress', 'happy'], suitableLocations: ['home']),
  Activity(id: 'dance_workout', title: 'Dance Workout', description: 'Fun dance cardio session to lift your spirits with upbeat music', category: 'exercise', icon: '💃', duration: '15-20 min', suitableMoods: ['happy', 'relaxed', 'frustration'], suitableLocations: ['home']),
  Activity(id: 'walking_routine', title: 'Power Walking', description: 'A brisk walking routine to clear your mind and get moving', category: 'exercise', icon: '🚶', duration: '15-30 min', suitableMoods: ['stress', 'worry', 'frustration', 'disappointment'], suitableLocations: ['home', 'office']),
  Activity(id: 'office_chair_yoga', title: 'Chair Yoga', description: 'Seated yoga poses perfect for a quick reset during work hours', category: 'exercise', icon: '💺', duration: '5-10 min', suitableMoods: ['stress', 'worry', 'frustration'], suitableLocations: ['office', 'meeting_room']),
  // Relaxation
  Activity(id: 'guided_meditation', title: 'Guided Meditation', description: 'A soothing guided meditation to calm your mind and restore inner peace', category: 'relaxation', icon: '🕯️', duration: '10-15 min', suitableMoods: ['stress', 'worry', 'frustration', 'disappointment'], suitableLocations: ['home', 'office', 'meeting_room']),
  Activity(id: 'breathing_exercise', title: 'Deep Breathing', description: 'Box breathing and 4-7-8 techniques to quickly reduce anxiety', category: 'relaxation', icon: '🌬️', duration: '3-5 min', suitableMoods: ['stress', 'worry', 'frustration'], suitableLocations: ['home', 'office', 'meeting_room']),
  Activity(id: 'nature_sounds', title: 'Nature Sounds', description: 'Listen to calming rain, ocean waves, or forest sounds to unwind', category: 'relaxation', icon: '🌊', duration: '10-30 min', suitableMoods: ['stress', 'worry', 'disappointment', 'relaxed'], suitableLocations: ['home', 'office']),
  Activity(id: 'muscle_relaxation', title: 'Body Scan Relaxation', description: 'Progressive muscle relaxation from head to toe for full-body relief', category: 'relaxation', icon: '🫧', duration: '10-15 min', suitableMoods: ['stress', 'frustration', 'worry'], suitableLocations: ['home']),
  Activity(id: 'journaling', title: 'Gratitude Journaling', description: 'Write down things you are grateful for to shift perspective positively', category: 'relaxation', icon: '📝', duration: '5-10 min', suitableMoods: ['disappointment', 'worry', 'stress', 'happy'], suitableLocations: ['home', 'office', 'meeting_room']),
  Activity(id: 'visualization', title: 'Positive Visualization', description: 'Close your eyes and imagine a peaceful, happy place in vivid detail', category: 'relaxation', icon: '🌅', duration: '5-10 min', suitableMoods: ['worry', 'disappointment', 'stress'], suitableLocations: ['home', 'office', 'meeting_room']),
  // Games
  Activity(id: 'puzzle_games', title: 'Puzzle Games', description: 'Engage your brain with Sudoku, crosswords, or logic puzzles', category: 'games', icon: '🧩', duration: '10-20 min', suitableMoods: ['stress', 'worry', 'happy', 'relaxed'], suitableLocations: ['home', 'office', 'meeting_room']),
  Activity(id: 'trivia_quiz', title: 'Trivia Quiz', description: 'Test your knowledge with fun quizzes on various topics', category: 'games', icon: '❓', duration: '5-15 min', suitableMoods: ['happy', 'relaxed', 'disappointment'], suitableLocations: ['home', 'office', 'meeting_room']),
  Activity(id: 'word_games', title: 'Word Games', description: 'Play relaxing word search, anagram, or spelling challenges', category: 'games', icon: '🔤', duration: '10-15 min', suitableMoods: ['stress', 'worry', 'relaxed', 'happy'], suitableLocations: ['home', 'office', 'meeting_room']),
  Activity(id: 'drawing_coloring', title: 'Digital Coloring', description: 'Relax with digital coloring books and creative doodling', category: 'games', icon: '🎨', duration: '10-20 min', suitableMoods: ['stress', 'frustration', 'disappointment', 'relaxed'], suitableLocations: ['home', 'office']),
  Activity(id: 'casual_gaming', title: 'Casual Mobile Games', description: 'Play light, fun mobile games to take your mind off things', category: 'games', icon: '📱', duration: '10-15 min', suitableMoods: ['frustration', 'disappointment', 'happy', 'relaxed'], suitableLocations: ['home', 'office']),
  Activity(id: 'brain_training', title: 'Brain Training', description: 'Sharpen your memory and focus with quick cognitive exercises', category: 'games', icon: '🧠', duration: '5-10 min', suitableMoods: ['happy', 'relaxed', 'worry'], suitableLocations: ['home', 'office', 'meeting_room']),
  // Outdoor
  Activity(id: 'nature_walk', title: 'Nature Walk', description: 'Take a peaceful walk in a park or garden to reconnect with nature', category: 'outdoor', icon: '🌳', duration: '20-30 min', suitableMoods: ['stress', 'worry', 'frustration', 'disappointment'], suitableLocations: ['home', 'office']),
  Activity(id: 'park_visit', title: 'Park Visit', description: 'Spend time in a nearby park — sit on a bench, watch people, and relax', category: 'outdoor', icon: '🏞️', duration: '30-60 min', suitableMoods: ['stress', 'disappointment', 'relaxed', 'happy'], suitableLocations: ['home', 'office']),
  Activity(id: 'outdoor_photography', title: 'Outdoor Photography', description: 'Capture beautiful moments around you with your phone camera', category: 'outdoor', icon: '📸', duration: '15-30 min', suitableMoods: ['happy', 'relaxed', 'disappointment'], suitableLocations: ['home', 'office']),
  Activity(id: 'garden_time', title: 'Garden Time', description: 'Tend to plants, water the garden, or simply enjoy the greenery', category: 'outdoor', icon: '🌱', duration: '15-30 min', suitableMoods: ['stress', 'frustration', 'relaxed', 'happy'], suitableLocations: ['home']),
  Activity(id: 'outdoor_jog', title: 'Light Jog', description: 'A gentle jog around your neighborhood to boost mood and energy', category: 'outdoor', icon: '🏃', duration: '15-20 min', suitableMoods: ['frustration', 'stress', 'happy'], suitableLocations: ['home'], suitableTimePeriods: ['morning', 'afternoon', 'evening']),
  Activity(id: 'sunshine_break', title: 'Sunshine Break', description: 'Step outside for fresh air and sunlight — a quick mood booster', category: 'outdoor', icon: '☀️', duration: '5-10 min', suitableMoods: ['stress', 'worry', 'frustration', 'disappointment'], suitableLocations: ['office', 'home'], suitableTimePeriods: ['morning', 'afternoon']),
];
