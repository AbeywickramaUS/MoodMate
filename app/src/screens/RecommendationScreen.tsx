import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { useApp } from '../context/AppContext';
import {
    getRecommendation,
    getAlternativeRecommendation,
    getCurrentTimePeriod
} from '../utils/recommendationEngine';
import { MOODS, LOCATIONS, MoodType, LocationType } from '../data/features';

export default function RecommendationScreen({ route, navigation }: any) {
    const { mood, location } = route.params as { mood: MoodType; location: LocationType };
    const { userProfile, currentRiskLevel } = useApp();
    const [recommendation, setRecommendation] = useState('');
    const [rejectedRecommendations, setRejectedRecommendations] = useState<string[]>([]);
    const [accepted, setAccepted] = useState(false);

    const moodData = MOODS.find(m => m.id === mood);
    const locationData = LOCATIONS.find(l => l.id === location);

    useEffect(() => {
        generateRecommendation();
    }, []);

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
    };

    const handleReject = () => {
        setRejectedRecommendations([...rejectedRecommendations, recommendation]);
        generateRecommendation();
    };

    const handleAccept = () => {
        setAccepted(true);
    };

    const getRiskBadge = () => {
        if (currentRiskLevel === 'high') {
            return (
                <View style={[styles.riskBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.riskBadgeText, { color: '#DC2626' }]}>
                        ⚠️ High Risk Week - Special Recommendation
                    </Text>
                </View>
            );
        }
        return null;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Recommendation</Text>
                <Text style={styles.subtitle}>Based on your current state</Text>
            </View>

            {/* Context Summary */}
            <View style={styles.contextCard}>
                <View style={styles.contextRow}>
                    <View style={styles.contextItem}>
                        <Text style={styles.contextEmoji}>{moodData?.emoji}</Text>
                        <Text style={styles.contextLabel}>{moodData?.label}</Text>
                    </View>
                    <View style={styles.contextDivider} />
                    <View style={styles.contextItem}>
                        <Text style={styles.contextEmoji}>{locationData?.icon}</Text>
                        <Text style={styles.contextLabel}>{locationData?.label}</Text>
                    </View>
                </View>
            </View>

            {getRiskBadge()}

            {/* Recommendation Card */}
            <View style={styles.recommendationCard}>
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

            {/* Alternatives tried */}
            {rejectedRecommendations.length > 0 && (
                <Text style={styles.alternativesCount}>
                    {rejectedRecommendations.length} alternative{rejectedRecommendations.length > 1 ? 's' : ''} tried
                </Text>
            )}

            {/* Navigation */}
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.homeButtonText}>← Back to Home</Text>
            </TouchableOpacity>
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
    contextCard: {
        marginHorizontal: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    contextItem: {
        alignItems: 'center',
    },
    contextEmoji: {
        fontSize: 36,
    },
    contextLabel: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
    },
    contextDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#334155',
    },
    riskBadge: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
    },
    riskBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    recommendationCard: {
        margin: 16,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    recommendationIcon: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 16,
    },
    recommendationText: {
        fontSize: 18,
        color: '#FFFFFF',
        lineHeight: 28,
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
        borderRadius: 10,
        alignItems: 'center',
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
        borderRadius: 10,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    acceptedBadge: {
        marginTop: 20,
        backgroundColor: '#166534',
        padding: 16,
        borderRadius: 10,
    },
    acceptedText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
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
        borderWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#94A3B8',
        fontSize: 16,
    },
});
