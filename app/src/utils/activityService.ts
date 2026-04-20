import { ACTIVITIES, Activity, ActivityCategory, ACTIVITY_CATEGORIES } from '../data/activities';
import { MoodType, LocationType, TimePeriodType } from '../data/features';
import { getCurrentTimePeriod } from './recommendationEngine';

interface ActivityContext {
    mood: MoodType;
    location: LocationType;
    timePeriod?: TimePeriodType;
    allergies?: string[];
}

interface ScoredActivity extends Activity {
    score: number;
}

/**
 * Score an activity based on how well it matches the user's current context.
 * Higher score = better match.
 */
function scoreActivity(activity: Activity, context: ActivityContext): number {
    let score = 0;

    // Mood match: +3 points if activity is suitable for the user's current mood
    if (activity.suitableMoods.includes(context.mood)) {
        score += 3;
    }

    // Location match: +2 points if activity can be done at the user's location
    if (activity.suitableLocations.includes(context.location)) {
        score += 2;
    } else {
        // Heavy penalty if not suitable for this location (e.g., HIIT in meeting room)
        score -= 10;
    }

    // Time period bonus: +1 if activity has time constraints and fits
    const timePeriod = context.timePeriod || getCurrentTimePeriod();
    if (activity.suitableTimePeriods) {
        if (activity.suitableTimePeriods.includes(timePeriod)) {
            score += 1;
        } else {
            score -= 2;
        }
    }

    // Allergy filtering: large penalty if activity description contains allergen
    if (context.allergies && context.allergies.length > 0) {
        const lowerDesc = (activity.title + ' ' + activity.description).toLowerCase();
        for (const allergy of context.allergies) {
            if (allergy && lowerDesc.includes(allergy.toLowerCase())) {
                score -= 100;
                break;
            }
        }
    }

    return score;
}

/**
 * Get the best-matching activities for the current user context.
 * Returns activities grouped by category, picking the top 1-2 per category.
 */
export function getSuggestedActivities(
    context: ActivityContext,
    maxPerCategory: number = 2,
    maxTotal: number = 6
): Activity[] {
    // Score all activities
    const scored: ScoredActivity[] = ACTIVITIES.map(activity => ({
        ...activity,
        score: scoreActivity(activity, context),
    }));

    // Only include activities with a positive score (location-compatible + relevant)
    const eligible = scored.filter(a => a.score > 0);

    // Group by category and pick top from each
    const result: Activity[] = [];

    for (const cat of ACTIVITY_CATEGORIES) {
        const categoryActivities = eligible
            .filter(a => a.category === cat.id)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxPerCategory);

        result.push(...categoryActivities);
    }

    // Sort final result by score and limit total
    result.sort((a, b) => {
        const aScore = eligible.find(e => e.id === a.id)?.score || 0;
        const bScore = eligible.find(e => e.id === b.id)?.score || 0;
        return bScore - aScore;
    });

    return result.slice(0, maxTotal);
}

/**
 * Get activities filtered by a specific category.
 */
export function getActivitiesByCategory(
    context: ActivityContext,
    category: ActivityCategory
): Activity[] {
    const all = getSuggestedActivities(context, 4, 20);
    return all.filter(a => a.category === category);
}

/**
 * Get a count of suggested activities per category for badge display.
 */
export function getActivityCategoryCounts(
    context: ActivityContext
): Record<ActivityCategory, number> {
    const all = getSuggestedActivities(context, 4, 20);
    const counts: Record<ActivityCategory, number> = {
        exercise: 0,
        relaxation: 0,
        games: 0,
        outdoor: 0,
    };

    for (const activity of all) {
        counts[activity.category]++;
    }

    return counts;
}
