import songsData from '../data/songs.json';
import { MoodType } from '../data/features';

interface Song {
    title: string;
    artist: string;
    genre: string;
}

const MUSIC_KEYWORDS = [
    'music',
    'listen',
    'song',
    'playlist',
    'tune',
    'melody',
    'audio',
];

/**
 * Check if a recommendation text mentions music-related activities
 */
export function isMusicRecommendation(text: string): boolean {
    const lowerText = text.toLowerCase();
    return MUSIC_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Get random songs matching the user's current mood
 * Returns 3 songs from the mood category
 */
export function getSongsForMood(mood: MoodType, count: number = 3): Song[] {
    const moodSongs: Song[] = (songsData.songs as Record<string, Song[]>)[mood] || [];

    if (moodSongs.length === 0) {
        return [];
    }

    // Shuffle and pick `count` songs
    const shuffled = [...moodSongs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
