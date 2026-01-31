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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Trends</Text>
                <Text style={styles.subtitle}>Weekly mood analysis</Text>
            </View>

            {/* Risk Status Card */}
            <View style={[styles.riskCard, { borderColor: getRiskColor() }]}>
                <View style={[styles.riskIndicator, { backgroundColor: getRiskColor() }]} />
                <View style={styles.riskContent}>
                    <Text style={styles.riskTitle}>
                        {currentRiskLevel === 'high' ? '⚠️ High Risk' :
                            currentRiskLevel === 'improving' ? '📈 Improving' : '✨ Stable'}
                    </Text>
                    <Text style={styles.riskDescription}>{getRiskDescription()}</Text>
                </View>
            </View>

            {/* Weekly Summary */}
            <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Past 7 Days</Text>
                <View style={styles.summaryStats}>
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryNumber}>{weeklyStats.total}</Text>
                        <Text style={styles.summaryLabel}>Total Logs</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryNumber}>
                            {weeklyStats.total > 0
                                ? Math.round((weeklyStats.moodCounts.happy / weeklyStats.total) * 100)
                                : 0}%
                        </Text>
                        <Text style={styles.summaryLabel}>Happy Moments</Text>
                    </View>
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
                                <View
                                    style={[
                                        styles.bar,
                                        { width: `${percentage}%`, backgroundColor: mood.color }
                                    ]}
                                />
                            </View>
                            <Text style={styles.barCount}>{count}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Daily Pattern - Simple View */}
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
        fontSize: 16,
        color: '#94A3B8',
        marginTop: 4,
    },
    riskCard: {
        marginHorizontal: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        borderWidth: 2,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    riskIndicator: {
        width: 6,
    },
    riskContent: {
        flex: 1,
        padding: 20,
    },
    riskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    riskDescription: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
        lineHeight: 20,
    },
    summaryCard: {
        margin: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    summaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryStat: {
        flex: 1,
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#334155',
    },
    chartCard: {
        marginHorizontal: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    barEmoji: {
        fontSize: 20,
        width: 30,
    },
    barLabel: {
        width: 100,
        fontSize: 14,
        color: '#94A3B8',
    },
    barContainer: {
        flex: 1,
        height: 12,
        backgroundColor: '#334155',
        borderRadius: 6,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 6,
    },
    barCount: {
        width: 30,
        textAlign: 'right',
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    patternCard: {
        margin: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    recentEntries: {
        gap: 12,
    },
    entryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 12,
        borderRadius: 10,
    },
    entryEmoji: {
        fontSize: 28,
    },
    entryInfo: {
        marginLeft: 12,
    },
    entryMood: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    entryDate: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    bottomPadding: {
        height: 40,
    },
});
