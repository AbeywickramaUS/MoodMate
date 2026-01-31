import recommendationsData from '../data/recommendations.json';
import { MoodType, LocationType, TimePeriodType, UserGoalType } from '../data/features';

const recommendations: string[] = recommendationsData.recommendations;

interface UserContext {
    mood: MoodType;
    time: TimePeriodType;
    dayOfWeek: number;
    location: LocationType;
    allergies: string[];
    userGoal: UserGoalType;
}

interface MoodEntry {
    id: string;
    mood: MoodType;
    timestamp: number;
    location: LocationType;
    riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Get recommendation based on user context
 * Uses a simple matching algorithm based on location and mood keywords
 */
export function getRecommendation(context: UserContext): string {
    // Filter recommendations based on location
    const locationKeywords: Record<LocationType, string[]> = {
        home: ['home', 'flexible', 'comfortable', 'cook', 'workout', 'meditation'],
        office: ['office', 'work break', 'desk', 'stretches'],
        meeting_room: ['meeting', 'break', 'focus'],
    };

    // Filter recommendations based on mood
    const moodKeywords: Record<MoodType, string[]> = {
        happy: ['enjoy', 'energizing', 'fun', 'dance', 'social'],
        stress: ['calming', 'grounding', 'meditation', 'relax', 'soothing'],
        worry: ['calming', 'grounding', 'reassure', 'gentle'],
        frustration: ['release', 'exercise', 'workout', 'channel'],
        disappointment: ['uplifting', 'comfort', 'gentle', 'kind'],
    };

    const locationWords = locationKeywords[context.location] || [];
    const moodWords = moodKeywords[context.mood] || [];

    // Score each recommendation
    let bestMatch = recommendations[0];
    let bestScore = 0;

    for (const rec of recommendations) {
        const lowerRec = rec.toLowerCase();
        let score = 0;

        // Location matching
        for (const word of locationWords) {
            if (lowerRec.includes(word.toLowerCase())) {
                score += 2;
            }
        }

        // Mood matching
        for (const word of moodWords) {
            if (lowerRec.includes(word.toLowerCase())) {
                score += 3;
            }
        }

        // Allergy filtering - exclude if contains allergen
        let hasAllergen = false;
        for (const allergy of context.allergies) {
            if (allergy && lowerRec.includes(allergy.toLowerCase())) {
                hasAllergen = true;
                break;
            }
        }
        if (hasAllergen) {
            score = -100;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = rec;
        }
    }

    return bestMatch;
}

/**
 * Get an alternative recommendation if user rejects current one
 */
export function getAlternativeRecommendation(
    context: UserContext,
    excludedRecommendations: string[]
): string {
    const available = recommendations.filter(r => !excludedRecommendations.includes(r));

    if (available.length === 0) {
        return "Take a moment to breathe and do what feels right for you.";
    }

    // Get random from remaining
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}

/**
 * Calculate risk level based on mood history
 */
export function calculateRiskLevel(moodHistory: MoodEntry[]): 'high' | 'stable' | 'improving' {
    if (moodHistory.length === 0) {
        return 'stable';
    }

    // Get mood entries from last 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentMoods = moodHistory.filter(m => m.timestamp >= weekAgo);

    if (recentMoods.length === 0) {
        return 'stable';
    }

    // Count negative moods
    const negativeMoods: MoodType[] = ['stress', 'worry', 'frustration', 'disappointment'];
    const negativeCount = recentMoods.filter(m => negativeMoods.includes(m.mood)).length;
    const negativeRatio = negativeCount / recentMoods.length;

    // Check trend (compare first half vs second half)
    const midpoint = Math.floor(recentMoods.length / 2);
    const firstHalf = recentMoods.slice(0, midpoint);
    const secondHalf = recentMoods.slice(midpoint);

    const firstNegativeRatio = firstHalf.filter(m => negativeMoods.includes(m.mood)).length / Math.max(firstHalf.length, 1);
    const secondNegativeRatio = secondHalf.filter(m => negativeMoods.includes(m.mood)).length / Math.max(secondHalf.length, 1);

    if (negativeRatio >= 0.6) {
        return 'high';
    } else if (secondNegativeRatio < firstNegativeRatio - 0.1) {
        return 'improving';
    }

    return 'stable';
}

/**
 * Get current time period
 */
export function getCurrentTimePeriod(): TimePeriodType {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

/**
 * Get weekly mood stats for visualization
 */
export function getWeeklyStats(moodHistory: MoodEntry[]) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentMoods = moodHistory.filter(m => m.timestamp >= weekAgo);

    const moodCounts: Record<string, number> = {
        happy: 0,
        stress: 0,
        worry: 0,
        frustration: 0,
        disappointment: 0,
    };

    for (const entry of recentMoods) {
        if (moodCounts[entry.mood] !== undefined) {
            moodCounts[entry.mood]++;
        }
    }

    return {
        total: recentMoods.length,
        moodCounts,
        riskLevel: calculateRiskLevel(moodHistory),
    };
}
