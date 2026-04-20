import 'dart:math';
import '../data/songs.dart';

const List<String> _musicKeywords = [
  'music', 'listen', 'song', 'playlist', 'tune', 'melody', 'audio',
];

/// Check if a recommendation text mentions music-related activities
bool isMusicRecommendation(String text) {
  final lowerText = text.toLowerCase();
  return _musicKeywords.any((keyword) => lowerText.contains(keyword));
}

/// Get random songs matching the user's current mood
List<Song> getSongsForMood(String mood, {int count = 3}) {
  final moodSongs = songsData[mood] ?? [];
  if (moodSongs.isEmpty) return [];

  final shuffled = List<Song>.from(moodSongs)..shuffle(Random());
  return shuffled.take(count).toList();
}
