class MoodEntry {
  final String id;
  final String mood; // 'happy', 'stress', 'worry', 'frustration', 'disappointment'
  final int timestamp;
  final String location; // 'home', 'office', 'meeting_room'
  final String riskLevel; // 'low', 'medium', 'high'

  MoodEntry({
    required this.id,
    required this.mood,
    required this.timestamp,
    required this.location,
    required this.riskLevel,
  });

  factory MoodEntry.fromJson(Map<String, dynamic> json) {
    return MoodEntry(
      id: json['id'],
      mood: json['mood'],
      timestamp: json['timestamp'],
      location: json['location'],
      riskLevel: json['riskLevel'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mood': mood,
      'timestamp': timestamp,
      'location': location,
      'riskLevel': riskLevel,
    };
  }
}
