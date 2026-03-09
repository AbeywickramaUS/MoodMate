import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext';
import { MOODS } from '../data/features';
import { getWeeklyStats } from '../utils/recommendationEngine';

const { width } = Dimensions.get('window');

export default function TrendsScreen() {
    const { moodHistory, currentRiskLevel } = useApp();
    const weeklyStats = getWeeklyStats(moodHistory);

    const getRiskColor = () => {
        switch (currentRiskLevel) {
            case 'high': return '#EF4444';
            case 'improving': return '#22C55E';
            default: return '#3B82F6';
        }
    };

    const getRiskTitle = () => {
        switch (currentRiskLevel) {
            case 'high': return '⚠ High Risk';
            case 'improving': return '📈 Improving';
            default: return '✨ Stable';
        }
    };

    const getRiskDescription = () => {
        switch (currentRiskLevel) {
            case 'high':
                return 'Your mood patterns indicate elevated stress. We recommend focusing on calming activities this week.';
            case 'improving':
                return 'Great progress! Your mood has been improving over the past few days. Keep up the positive momentum!';
            default:
                return 'Your mood patterns are stable. Continue your current wellness practices.';
        }
    };

    const maxMoodCount = Math.max(...Object.values(weeklyStats.moodCounts), 1);

    // Calculate happy percentage
    const happyPercentage = weeklyStats.total > 0
        ? Math.round((weeklyStats.moodCounts.happy / weeklyStats.total) * 100)
        : 0;

    // Find dominant happy mood emoji
    const happyMood = MOODS.find(m => m.id === 'happy');

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Trends</Text>
                <Text style={styles.subtitle}>Weekly mood analysis</Text>
            </View>

            {/* Risk Status Card with red glow */}
            <View style={[
                styles.riskCard,
                {
                    borderColor: getRiskColor(),
                    backgroundColor: currentRiskLevel === 'high'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : currentRiskLevel === 'improving'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : 'rgba(59, 130, 246, 0.12)',
                }
            ]}>
                {/* Red glow effect for high risk */}
                {currentRiskLevel === 'high' && (
                    <View style={styles.riskGlow} />
                )}
                <Text style={[styles.riskTitle, { color: getRiskColor() }]}>
                    {getRiskTitle()}
                </Text>
                <Text style={styles.riskDescription}>{getRiskDescription()}</Text>
            </View>

            {/* Weekly Summary - Two stat cards */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <Text style={styles.summaryCardTitle}>Past 7 Days</Text>
                        <Text style={styles.summaryCardIcon}>📊</Text>
                    </View>
                    <Text style={styles.summaryNumber}>{weeklyStats.total}</Text>
                    <Text style={styles.summaryLabel}>Total Logs</Text>
                </View>
                <View style={[styles.summaryCard, styles.summaryCardPurple]}>
                    <View style={styles.summaryCardHeader}>
                        <Text style={styles.summaryCardTitle}>
                            {happyPercentage}%
                        </Text>
                        <Text style={styles.summaryCardIcon}>{happyMood?.emoji || '😊'}</Text>
                    </View>
                    <Text style={styles.summaryNumber}></Text>
                    <Text style={styles.summaryLabel}>Happy</Text>
                </View>
            </View>

            {/* Mood Distribution */}
            <View style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Mood Distribution</Text>

                {MOODS.map((mood) => {
                    const count = weeklyStats.moodCounts[mood.id] || 0;
                    const percentage = maxMoodCount > 0 ? (count / maxMoodCount) * 100 : 0;

                    return (
                        <View key={mood.id} style={styles.barRow}>
                            <Text style={styles.barEmoji}>{mood.emoji}</Text>
                            <Text style={styles.barLabel}>{mood.label}</Text>
                            <View style={styles.barContainer}>
                                {/* Segmented bar */}
                                <View style={styles.barSegments}>
                                    {Array.from({ length: Math.max(count, 0) }).map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.barSegment,
                                                { backgroundColor: mood.color }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.barCount}>{count}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Recent Activity */}
            <View style={styles.patternCard}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>

                {moodHistory.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No mood entries yet. Start logging to see your patterns!
                    </Text>
                ) : (
                    <View style={styles.recentEntries}>
                        {moodHistory.slice(-7).reverse().map((entry) => {
                            const moodData = MOODS.find(m => m.id === entry.mood);
                            const date = new Date(entry.timestamp);

                            return (
                                <View key={entry.id} style={styles.entryRow}>
                                    <Text style={styles.entryEmoji}>{moodData?.emoji}</Text>
                                    <View style={styles.entryInfo}>
                                        <Text style={styles.entryMood}>{moodData?.label}</Text>
                                        <Text style={styles.entryDate}>
                                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            <View style={styles.bottomPadding} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 15,
        color: '#94A3B8',
        marginTop: 4,
    },
    // Risk card
    riskCard: {
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 20,
        overflow: 'hidden',
    },
    riskGlow: {
        position: 'absolute',
        top: -40,
        left: -20,
        right: -20,
        height: 100,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 50,
    },
    riskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    riskDescription: {
        fontSize: 14,
        color: '#CBD5E1',
        lineHeight: 20,
    },
    // Summary row
    summaryRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    summaryCardPurple: {
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    summaryCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    summaryCardIcon: {
        fontSize: 20,
    },
    summaryNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 4,
    },
    // Chart card
    chartCard: {
        margin: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 18,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    barEmoji: {
        fontSize: 20,
        width: 30,
    },
    barLabel: {
        width: 100,
        fontSize: 14,
        color: '#CBD5E1',
        fontWeight: '500',
    },
    barContainer: {
        flex: 1,
        height: 14,
        backgroundColor: '#0F172A',
        borderRadius: 7,
        overflow: 'hidden',
    },
    barSegments: {
        flexDirection: 'row',
        height: '100%',
        gap: 2,
        paddingHorizontal: 2,
        alignItems: 'center',
    },
    barSegment: {
        width: 18,
        height: 10,
        borderRadius: 3,
    },
    barCount: {
        width: 30,
        textAlign: 'right',
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    // Recent activity
    patternCard: {
        marginHorizontal: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    recentEntries: {
        gap: 10,
    },
    entryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 14,
        borderRadius: 12,
    },
    entryEmoji: {
        fontSize: 28,
    },
    entryInfo: {
        marginLeft: 14,
    },
    entryMood: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    entryDate: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 3,
    },
    bottomPadding: {
        height: 40,
    },
});
