import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext';
import { MOODS } from '../data/features';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
    const { moodHistory, currentRiskLevel } = useApp();

    const getRiskColor = () => {
        switch (currentRiskLevel) {
            case 'high': return '#EF4444';
            case 'improving': return '#22C55E';
            default: return '#3B82F6';
        }
    };

    const getRiskEmoji = () => {
        switch (currentRiskLevel) {
            case 'high': return '⚠️';
            case 'improving': return '📈';
            default: return '✨';
        }
    };

    const getLastMood = () => {
        if (moodHistory.length === 0) return null;
        const last = moodHistory[moodHistory.length - 1];
        return MOODS.find(m => m.id === last.mood);
    };

    const lastMood = getLastMood();
    const todayEntries = moodHistory.filter(
        m => new Date(m.timestamp).toDateString() === new Date().toDateString()
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello! 👋</Text>
                <Text style={styles.subtitle}>How are you feeling today?</Text>
            </View>

            {/* Risk Level Card */}
            <View style={[styles.riskCard, { borderColor: getRiskColor() }]}>
                <Text style={styles.riskEmoji}>{getRiskEmoji()}</Text>
                <View style={styles.riskInfo}>
                    <Text style={styles.riskLabel}>Current Status</Text>
                    <Text style={[styles.riskLevel, { color: getRiskColor() }]}>
                        {currentRiskLevel === 'high' ? 'High Risk' :
                            currentRiskLevel === 'improving' ? 'Improving' : 'Stable'}
                    </Text>
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{todayEntries.length}</Text>
                    <Text style={styles.statLabel}>Today's Logs</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{moodHistory.length}</Text>
                    <Text style={styles.statLabel}>Total Entries</Text>
                </View>
            </View>

            {/* Last Mood */}
            {lastMood && (
                <View style={styles.lastMoodCard}>
                    <Text style={styles.sectionTitle}>Last Recorded Mood</Text>
                    <View style={styles.moodDisplay}>
                        <Text style={styles.moodEmoji}>{lastMood.emoji}</Text>
                        <Text style={styles.moodLabel}>{lastMood.label}</Text>
                    </View>
                </View>
            )}

            {/* Quick Action Button */}
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('MoodInput')}
            >
                <Text style={styles.primaryButtonText}>📊 Log Your Mood</Text>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Trends')}
                >
                    <Text style={styles.secondaryButtonText}>📈 View Trends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
                </TouchableOpacity>
            </View>
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
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 18,
        color: '#94A3B8',
        marginTop: 4,
    },
    riskCard: {
        margin: 16,
        marginTop: 8,
        padding: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    riskEmoji: {
        fontSize: 40,
    },
    riskInfo: {
        marginLeft: 16,
    },
    riskLabel: {
        fontSize: 14,
        color: '#94A3B8',
    },
    riskLevel: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    lastMoodCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 12,
    },
    moodDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moodEmoji: {
        fontSize: 40,
    },
    moodLabel: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    primaryButton: {
        margin: 16,
        backgroundColor: '#8B5CF6',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 32,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});
