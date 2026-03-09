import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import { MOODS, LOCATIONS } from '../data/features';

const { width } = Dimensions.get('window');

// Semi-circular gauge component
function GaugeChart({ value, maxValue, label, size = 80 }: {
    value: number;
    maxValue: number;
    label: string;
    size?: number;
}) {
    const radius = size / 2 - 8;
    const circumference = Math.PI * radius;
    const percentage = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
    const strokeDashoffset = circumference * (1 - percentage);
    const centerX = size / 2;
    const centerY = size / 2 + 4;

    return (
        <View style={{ alignItems: 'center' }}>
            <Svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
                {/* Background arc */}
                <Path
                    d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={6}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <Path
                    d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                    fill="none"
                    stroke="#A78BFA"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                />
                {/* End dots */}
                <Circle cx={centerX - radius} cy={centerY} r={3} fill="#334155" />
                <Circle cx={centerX + radius} cy={centerY} r={3} fill="#A78BFA" />
            </Svg>
            <Text style={styles.gaugeValue}>{value}</Text>
            <Text style={styles.gaugeLabel}>{label}</Text>
        </View>
    );
}

export default function HomeScreen({ navigation }: any) {
    const { moodHistory, currentRiskLevel } = useApp();
    const { currentLocation, isManualOverride, savedLocations, leaveMeetingRoom } = useLocation();

    const currentLocationData = LOCATIONS.find(l => l.id === currentLocation);
    const hasSavedLocations = Object.values(savedLocations).some(v => v !== null);

    const getRiskColor = () => {
        switch (currentRiskLevel) {
            case 'high': return '#EF4444';
            case 'improving': return '#22C55E';
            default: return '#3B82F6';
        }
    };

    const getRiskText = () => {
        switch (currentRiskLevel) {
            case 'high': return 'High Risk';
            case 'improving': return 'Improving';
            default: return 'Stable';
        }
    };

    const getRiskDescription = () => {
        switch (currentRiskLevel) {
            case 'high': return 'Learn more about managing this status.';
            case 'improving': return 'Great progress on your wellness journey!';
            default: return 'Your mood is looking stable.';
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
            {/* Ambient glow effects */}
            <View style={styles.ambientGlow1} />
            <View style={styles.ambientGlow2} />
            <View style={styles.ambientGlow3} />

            <View style={styles.header}>
                <Text style={styles.greeting}>Hello! 👋</Text>
                <Text style={styles.subtitle}>How are you feeling today?</Text>
            </View>

            {/* Health & Mood Dashboard Card */}
            <View style={styles.dashboardCard}>
                <Text style={styles.dashboardTitle}>Health & Mood Dashboard</Text>

                {/* Risk Status */}
                <View style={[styles.riskCard, { borderColor: getRiskColor() }]}>
                    <View style={styles.riskLeft}>
                        <Text style={styles.riskIcon}>⚠️</Text>
                        <View>
                            <Text style={styles.riskStatusLabel}>Current Status:</Text>
                            <Text style={[styles.riskStatusValue, { color: getRiskColor() }]}>
                                {getRiskText()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.riskDescription}>{getRiskDescription()}</Text>
                </View>

                {/* Current Location */}
                <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>
                        {hasSavedLocations ? currentLocationData?.icon : '📍'}
                    </Text>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>Currently at</Text>
                        <Text style={styles.locationName}>
                            {hasSavedLocations
                                ? currentLocationData?.label || 'Unknown'
                                : 'Location not set'}
                        </Text>
                    </View>
                    {isManualOverride && (
                        <View style={styles.manualBadge}>
                            <Text style={styles.manualBadgeText}>Manual</Text>
                        </View>
                    )}
                </View>

                {/* Leave Meeting Room Button */}
                {currentLocation === 'meeting_room' && (
                    <TouchableOpacity
                        style={styles.leaveMeetingButton}
                        onPress={leaveMeetingRoom}
                    >
                        <Text style={styles.leaveMeetingButtonText}>
                            🚪 Leave Meeting Room
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Dashboard Stats */}
                <View style={styles.statsSection}>
                    <Text style={styles.statsTitle}>Dashboard Stats</Text>
                    <View style={styles.statsRow}>
                        <GaugeChart
                            value={todayEntries.length}
                            maxValue={Math.max(todayEntries.length, 10)}
                            label="Logs Today"
                            size={100}
                        />
                        <GaugeChart
                            value={moodHistory.length}
                            maxValue={Math.max(moodHistory.length, 20)}
                            label="Total Logs"
                            size={100}
                        />
                    </View>
                </View>
            </View>

            {/* Last Mood */}
            {lastMood && (
                <View style={styles.lastMoodCard}>
                    <Text style={styles.lastMoodEmoji}>{lastMood.emoji}</Text>
                    <View style={styles.lastMoodInfo}>
                        <Text style={styles.lastMoodLabel}>Last Recorded Mood</Text>
                        <Text style={styles.lastMoodName}>{lastMood.label}</Text>
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
    // Ambient glow effects
    ambientGlow1: {
        position: 'absolute',
        top: -60,
        left: -40,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
    },
    ambientGlow2: {
        position: 'absolute',
        top: -30,
        right: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    ambientGlow3: {
        position: 'absolute',
        top: 40,
        left: width / 3,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
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
        fontSize: 16,
        color: '#94A3B8',
        marginTop: 4,
    },
    // Dashboard card
    dashboardCard: {
        margin: 16,
        marginTop: 8,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    dashboardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    // Risk card inside dashboard
    riskCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1.5,
        marginBottom: 16,
    },
    riskLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    riskIcon: {
        fontSize: 24,
    },
    riskStatusLabel: {
        fontSize: 13,
        color: '#94A3B8',
    },
    riskStatusValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    riskDescription: {
        fontSize: 13,
        color: '#94A3B8',
        lineHeight: 18,
    },
    // Location row
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3A52',
        marginBottom: 12,
    },
    locationIcon: {
        fontSize: 36,
    },
    locationInfo: {
        marginLeft: 12,
        flex: 1,
    },
    locationLabel: {
        fontSize: 13,
        color: '#94A3B8',
    },
    locationName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 2,
    },
    manualBadge: {
        backgroundColor: '#FB923C',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    manualBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    leaveMeetingButton: {
        backgroundColor: '#DC2626',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    leaveMeetingButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Stats section
    statsSection: {
        paddingTop: 4,
    },
    statsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
    },
    gaugeValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: -8,
    },
    gaugeLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    // Last mood card
    lastMoodCard: {
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    lastMoodEmoji: {
        fontSize: 40,
    },
    lastMoodInfo: {
        marginLeft: 14,
    },
    lastMoodLabel: {
        fontSize: 13,
        color: '#94A3B8',
    },
    lastMoodName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 2,
    },
    // Primary button
    primaryButton: {
        margin: 16,
        marginTop: 20,
        backgroundColor: '#8B5CF6',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    // Secondary buttons
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
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
