import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useApp } from '../context/AppContext';
import { USER_GOALS, UserGoalType } from '../data/features';

export default function ProfileScreen() {
    const { userProfile, updateAllergies, updatePreferredGoal } = useApp();
    const [newAllergy, setNewAllergy] = useState('');

    const handleAddAllergy = () => {
        const trimmed = newAllergy.trim();
        if (trimmed && !userProfile.allergies.includes(trimmed)) {
            updateAllergies([...userProfile.allergies, trimmed]);
            setNewAllergy('');
        }
    };

    const handleRemoveAllergy = (allergy: string) => {
        Alert.alert(
            'Remove Allergy',
            `Remove "${allergy}" from your allergies?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        updateAllergies(userProfile.allergies.filter(a => a !== allergy));
                    }
                },
            ]
        );
    };

    const handleGoalSelect = (goal: UserGoalType) => {
        updatePreferredGoal(goal);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Customize your experience</Text>
            </View>

            {/* Allergies Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚫 Allergies & Restrictions</Text>
                <Text style={styles.sectionDescription}>
                    Recommendations will avoid activities that may conflict with these
                </Text>

                {/* Add Allergy Input */}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter allergy or restriction..."
                        placeholderTextColor="#64748B"
                        value={newAllergy}
                        onChangeText={setNewAllergy}
                        onSubmitEditing={handleAddAllergy}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddAllergy}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Allergies List */}
                <View style={styles.allergiesList}>
                    {userProfile.allergies.length === 0 ? (
                        <Text style={styles.emptyText}>No allergies added</Text>
                    ) : (
                        userProfile.allergies.map((allergy, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.allergyTag}
                                onPress={() => handleRemoveAllergy(allergy)}
                            >
                                <Text style={styles.allergyText}>{allergy}</Text>
                                <Text style={styles.removeIcon}>✕</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </View>

            {/* Goals Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Preferred Goal</Text>
                <Text style={styles.sectionDescription}>
                    Recommendations will be tailored towards this goal
                </Text>

                <View style={styles.goalsGrid}>
                    {USER_GOALS.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.goalCard,
                                userProfile.preferredGoal === goal.id && styles.goalCardSelected
                            ]}
                            onPress={() => handleGoalSelect(goal.id)}
                        >
                            <Text style={styles.goalIcon}>{goal.icon}</Text>
                            <Text style={styles.goalLabel}>{goal.label}</Text>
                            {userProfile.preferredGoal === goal.id && (
                                <View style={styles.selectedBadge}>
                                    <Text style={styles.selectedBadgeText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ About MoodMate</Text>
                <View style={styles.aboutCard}>
                    <Text style={styles.aboutText}>
                        MoodMate is your personal well-being companion. It monitors your emotional
                        state and provides adaptive recommendations to help you feel better.
                    </Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
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
    section: {
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#334155',
    },
    addButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 20,
        borderRadius: 10,
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    allergiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    allergyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 8,
    },
    allergyText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    removeIcon: {
        color: '#DC2626',
        fontSize: 14,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        fontStyle: 'italic',
    },
    goalsGrid: {
        gap: 12,
    },
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    goalCardSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#1E293B',
    },
    goalIcon: {
        fontSize: 28,
    },
    goalLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    selectedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    aboutCard: {
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 12,
    },
    aboutText: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 22,
    },
    versionText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 12,
        textAlign: 'center',
    },
    bottomPadding: {
        height: 40,
    },
});
