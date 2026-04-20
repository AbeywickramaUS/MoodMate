import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useApp } from '../context/AppContext';
import {
    getRecommendation,
    getAlternativeRecommendation,
    getCurrentTimePeriod
} from '../utils/recommendationEngine';
import { MOODS, LOCATIONS, MoodType, LocationType } from '../data/features';
import { isMusicRecommendation, getSongsForMood } from '../utils/songService';
import { getSuggestedActivities } from '../utils/activityService';
import { Activity, ActivityCategory, ACTIVITY_CATEGORIES } from '../data/activities';

const { width } = Dimensions.get('window');

export default function RecommendationScreen({ route, navigation }: any) {
    const { mood, location } = route.params as { mood: MoodType; location: LocationType };
    const { userProfile, currentRiskLevel } = useApp();
    const [recommendation, setRecommendation] = useState('');
    const [rejectedRecommendations, setRejectedRecommendations] = useState<string[]>([]);
    const [accepted, setAccepted] = useState(false);
    const [suggestedSongs, setSuggestedSongs] = useState<{title: string; artist: string; genre: string}[]>([]);
    const [showSongs, setShowSongs] = useState(false);
    const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');

    const moodData = MOODS.find(m => m.id === mood);
    const locationData = LOCATIONS.find(l => l.id === location);

    useEffect(() => {
        generateRecommendation();
        generateActivities();
    }, []);

    const generateActivities = () => {
        const activities = getSuggestedActivities({
            mood,
            location,
            timePeriod: getCurrentTimePeriod(),
            allergies: userProfile.allergies,
        }, 3, 12);
        setSuggestedActivities(activities);
    };

    const generateRecommendation = () => {
        const context = {
            mood,
            time: getCurrentTimePeriod(),
            dayOfWeek: new Date().getDay(),
            location,
            allergies: userProfile.allergies,
            userGoal: userProfile.preferredGoal,
        };

        const rec = rejectedRecommendations.length > 0
            ? getAlternativeRecommendation(context, rejectedRecommendations)
            : getRecommendation(context);

        setRecommendation(rec);

        // Check if recommendation mentions music
        if (isMusicRecommendation(rec)) {
            setShowSongs(true);
            setSuggestedSongs(getSongsForMood(mood, 3));
        } else {
            setShowSongs(false);
            setSuggestedSongs([]);
        }
    };

    const handleReject = () => {
        setRejectedRecommendations([...rejectedRecommendations, recommendation]);
        generateRecommendation();
    };

    const handleAccept = () => {
        setAccepted(true);
    };

    const getMoodDisplayLabel = () => {
        if (!moodData) return '';
        // Map to match screenshot styling (e.g., "Content (Happ)")
        return `${moodData.label}`;
    };

    return (
        <ScrollView style={styles.container}>
            {/* Ambient glow */}
            <View style={styles.ambientGlow1} />
            <View style={styles.ambientGlow2} />

            <View style={styles.header}>
                <Text style={styles.title}>Your Recommendations</Text>
                <Text style={styles.subtitle}>Based on your current state</Text>
            </View>

            {/* Context Summary - Two cards side by side */}
            <View style={styles.contextRow}>
                <View style={styles.contextCard}>
                    <Text style={styles.contextEmoji}>{moodData?.emoji}</Text>
                    <Text style={styles.contextLabel}>
                        {moodData?.label}
                    </Text>
                </View>
                <View style={styles.contextCard}>
                    <Text style={styles.contextEmoji}>{locationData?.icon}</Text>
                    <Text style={styles.contextLabel}>
                        At {locationData?.label} ({locationData?.label})
                    </Text>
                </View>
            </View>

            {/* Risk Badge */}
            {currentRiskLevel === 'high' && (
                <View style={styles.riskBadge}>
                    <Text style={styles.riskBadgeText}>
                        ⚠️ Special Recommendation - High-Risk Week
                    </Text>
                </View>
            )}

            {/* Recommendation Card */}
            <View style={styles.recommendationCard}>
                <View style={styles.recommendationGlow} />
                <Text style={styles.recommendationIcon}>💡</Text>
                <Text style={styles.recommendationText}>{recommendation}</Text>

                {!accepted ? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={handleReject}
                        >
                            <Text style={styles.rejectButtonText}>🔄 Try Another</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAccept}
                        >
                            <Text style={styles.acceptButtonText}>✅ Accept</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.acceptedBadge}>
                        <Text style={styles.acceptedText}>✨ Great choice! Enjoy your activity!</Text>
                    </View>
                )}
            </View>

            {/* Song Recommendations */}
            {showSongs && suggestedSongs.length > 0 && (
                <View style={styles.songsSection}>
                    <Text style={styles.songsSectionTitle}>🎵 Suggested Songs</Text>
                    <Text style={styles.songsSectionSubtitle}>Based on your {moodData?.label?.toLowerCase()} mood</Text>
                    {suggestedSongs.map((song, index) => (
                        <View key={index} style={styles.songCard}>
                            <View style={styles.songIconContainer}>
                                <Text style={styles.songIcon}>🎵</Text>
                            </View>
                            <View style={styles.songInfo}>
                                <Text style={styles.songTitle}>{song.title}</Text>
                                <Text style={styles.songArtist}>{song.artist}</Text>
                            </View>
                            <View style={styles.genrePill}>
                                <Text style={styles.genreText}>{song.genre}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Alternatives tried */}
            {rejectedRecommendations.length > 0 && (
                <Text style={styles.alternativesCount}>
                    {rejectedRecommendations.length} alternative{rejectedRecommendations.length > 1 ? 's' : ''} tried
                </Text>
            )}

            {/* Suggested Activities Section */}
            {suggestedActivities.length > 0 && (
                <View style={styles.activitiesSection}>
                    <Text style={styles.activitiesSectionTitle}>🎯 Suggested Activities</Text>
                    <Text style={styles.activitiesSectionSubtitle}>
                        Based on your {moodData?.label?.toLowerCase()} mood at {locationData?.label?.toLowerCase()}
                    </Text>

                    {/* Category Filter Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryTabs}
                        contentContainerStyle={styles.categoryTabsContent}
                    >
                        <TouchableOpacity
                            style={[
                                styles.categoryPill,
                                selectedCategory === 'all' && styles.categoryPillActive,
                            ]}
                            onPress={() => setSelectedCategory('all')}
                        >
                            <Text style={[
                                styles.categoryPillText,
                                selectedCategory === 'all' && styles.categoryPillTextActive,
                            ]}>All</Text>
                        </TouchableOpacity>
                        {ACTIVITY_CATEGORIES.map(cat => {
                            const count = suggestedActivities.filter(a => a.category === cat.id).length;
                            if (count === 0) return null;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryPill,
                                        selectedCategory === cat.id && [
                                            styles.categoryPillActive,
                                            { backgroundColor: cat.color + '25', borderColor: cat.color + '60' },
                                        ],
                                    ]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                >
                                    <Text style={[
                                        styles.categoryPillText,
                                        selectedCategory === cat.id && { color: cat.color },
                                    ]}>{cat.icon} {cat.label}</Text>
                                    <View style={[styles.countBadge, { backgroundColor: cat.color + '30' }]}>
                                        <Text style={[styles.countBadgeText, { color: cat.color }]}>{count}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Activity Cards */}
                    {suggestedActivities
                        .filter(a => selectedCategory === 'all' || a.category === selectedCategory)
                        .map(activity => {
                            const catData = ACTIVITY_CATEGORIES.find(c => c.id === activity.category);
                            return (
                                <View key={activity.id} style={styles.activityCard}>
                                    <View style={[
                                        styles.activityIconContainer,
                                        { backgroundColor: (catData?.color || '#A855F7') + '18' },
                                    ]}>
                                        <Text style={styles.activityIcon}>{activity.icon}</Text>
                                    </View>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{activity.title}</Text>
                                        <Text style={styles.activityDescription} numberOfLines={2}>
                                            {activity.description}
                                        </Text>
                                        <View style={styles.activityMeta}>
                                            <View style={styles.durationBadge}>
                                                <Text style={styles.durationText}>⏱ {activity.duration}</Text>
                                            </View>
                                            <View style={[
                                                styles.categoryTag,
                                                { backgroundColor: (catData?.color || '#A855F7') + '18' },
                                            ]}>
                                                <Text style={[
                                                    styles.categoryTagText,
                                                    { color: catData?.color || '#A855F7' },
                                                ]}>{catData?.label}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                </View>
            )}

            {/* Navigation */}
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('MainTabs')}
            >
                <Text style={styles.homeButtonText}>← Return Home</Text>
            </TouchableOpacity>


        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    // Ambient glow effects
    ambientGlow1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
    },
    ambientGlow2: {
        position: 'absolute',
        top: 100,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 15,
        color: '#94A3B8',
        marginTop: 6,
    },
    // Context cards
    contextRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    contextCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    contextEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    contextLabel: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        fontWeight: '500',
    },
    // Risk badge
    riskBadge: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    riskBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        color: '#FCA5A5',
    },
    // Recommendation card with glow
    recommendationCard: {
        margin: 16,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: '#A855F7',
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    recommendationGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(168, 85, 247, 0.2)',
    },
    recommendationIcon: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 16,
    },
    recommendationText: {
        fontSize: 16,
        color: '#E2E8F0',
        lineHeight: 26,
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#334155',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#475569',
    },
    rejectButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#22C55E',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    acceptedBadge: {
        marginTop: 20,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    acceptedText: {
        color: '#4ADE80',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    alternativesCount: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: 14,
        marginTop: 8,
    },
    homeButton: {
        margin: 16,
        marginTop: 24,
        marginBottom: 40,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '500',
    },
    // Song recommendation styles
    songsSection: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    songsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    songsSectionSubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 14,
    },
    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    songIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    songIcon: {
        fontSize: 22,
    },
    songInfo: {
        flex: 1,
        marginLeft: 12,
    },
    songTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    songArtist: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 2,
    },
    genrePill: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    genreText: {
        fontSize: 11,
        color: '#A78BFA',
        fontWeight: '600',
    },
    // Activity suggestion styles
    activitiesSection: {
        marginHorizontal: 16,
        marginTop: 20,
    },
    activitiesSectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    activitiesSectionSubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 16,
    },
    categoryTabs: {
        marginBottom: 16,
    },
    categoryTabsContent: {
        gap: 8,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2D3A52',
        gap: 6,
    },
    categoryPillActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: 'rgba(168, 85, 247, 0.4)',
    },
    categoryPillText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
    },
    categoryPillTextActive: {
        color: '#A855F7',
    },
    countBadge: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#A855F7',
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    activityIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityIcon: {
        fontSize: 24,
    },
    activityInfo: {
        flex: 1,
        marginLeft: 12,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    activityDescription: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 17,
        marginBottom: 8,
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    durationBadge: {
        backgroundColor: 'rgba(148, 163, 184, 0.12)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    durationText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    categoryTagText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
