import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import { USER_GOALS, LOCATIONS, UserGoalType, LocationType } from '../data/features';
import { getCurrentPosition } from '../utils/LocationService';

export default function ProfileScreen() {
    const { userProfile, updateAllergies, updatePreferredGoal } = useApp();
    const { savedLocations, saveLocation, clearLocation } = useLocation();
    const [newAllergy, setNewAllergy] = useState('');
    const [savingLocation, setSavingLocation] = useState<LocationType | null>(null);

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

    const handleSaveCurrentLocation = async (type: LocationType) => {
        setSavingLocation(type);
        try {
            const coords = await getCurrentPosition();
            if (coords) {
                await saveLocation(type, coords);
                const locationLabel = LOCATIONS.find(l => l.id === type)?.label || type;
                Alert.alert(
                    '✅ Location Saved',
                    `${locationLabel} has been saved at:\nLat: ${coords.latitude.toFixed(6)}\nLon: ${coords.longitude.toFixed(6)}`,
                );
            } else {
                Alert.alert('Error', 'Could not get your current position. Please ensure location services are enabled.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save location. Please try again.');
        } finally {
            setSavingLocation(null);
        }
    };

    const handleClearLocation = (type: LocationType) => {
        const locationLabel = LOCATIONS.find(l => l.id === type)?.label || type;
        Alert.alert(
            'Clear Location',
            `Remove saved coordinates for "${locationLabel}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => clearLocation(type),
                },
            ]
        );
    };

    const handleGoalSelect = (goal: UserGoalType) => {
        updatePreferredGoal(goal);
    };

    const formatCoords = (coords: { latitude: number; longitude: number } | null): string => {
        if (!coords) return 'Not set';
        return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
    };

    // Split goals into rows for the layout from screenshot
    const topGoals = USER_GOALS.slice(0, 2);
    const bottomGoals = USER_GOALS.slice(2);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Customize your experience</Text>
            </View>

            {/* Saved Locations Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 My Locations</Text>
                <Text style={styles.sectionDescription}>
                    Save your locations so the app can auto-detect where you are.
                </Text>

                {LOCATIONS.map((location) => {
                    const coords = savedLocations[location.id];
                    const isSaving = savingLocation === location.id;
                    const isSaved = coords !== null;

                    return (
                        <View key={location.id} style={styles.locationCard}>
                            <View style={styles.locationCardLeft}>
                                <Text style={styles.locationCardIcon}>{location.icon}</Text>
                                <View style={styles.locationCardInfo}>
                                    <Text style={styles.locationCardName}>{location.label}</Text>
                                    <Text style={[
                                        styles.locationCardStatus,
                                        isSaved && styles.locationCardStatusSaved
                                    ]}>
                                        {isSaved ? `✓ ${formatCoords(coords)}` : 'Not set'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.locationCardActions}>
                                <TouchableOpacity
                                    style={[
                                        styles.saveLocationButton,
                                        isSaving && styles.saveLocationButtonDisabled,
                                    ]}
                                    onPress={() => handleSaveCurrentLocation(location.id)}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveLocationButtonText}>
                                            {isSaved ? '🔄 Update' : '📌 Save Current'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                {isSaved && (
                                    <TouchableOpacity
                                        style={styles.clearLocationButton}
                                        onPress={() => handleClearLocation(location.id)}
                                    >
                                        <Text style={styles.clearLocationButtonText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Allergies Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚫 Allergies & Restrictions</Text>
                <Text style={styles.sectionDescription}>
                    Define any allergies or restrictions so recommendations avoid conflicts.
                </Text>

                {/* Add Allergy Input */}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter an allergy or restriction..."
                        placeholderTextColor="#64748B"
                        value={newAllergy}
                        onChangeText={setNewAllergy}
                        onSubmitEditing={handleAddAllergy}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddAllergy}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
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

                {/* Top row - 2 goals */}
                <View style={styles.goalsRow}>
                    {topGoals.map((goal) => (
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
                                <View style={styles.selectedCheckmark}>
                                    <Text style={styles.selectedCheckmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom row - 3 goals */}
                <View style={styles.goalsRow}>
                    {bottomGoals.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.goalCardSmall,
                                userProfile.preferredGoal === goal.id && styles.goalCardSelected
                            ]}
                            onPress={() => handleGoalSelect(goal.id)}
                        >
                            <Text style={styles.goalIconSmall}>{goal.icon}</Text>
                            <Text style={styles.goalLabelSmall}>{goal.label}</Text>
                            {userProfile.preferredGoal === goal.id && (
                                <View style={styles.selectedCheckmarkSmall}>
                                    <Text style={styles.selectedCheckmarkText}>✓</Text>
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
        fontSize: 15,
        color: '#94A3B8',
        marginTop: 4,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2D3A52',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    sectionDescription: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 16,
        lineHeight: 18,
    },
    // Location cards
    locationCard: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    locationCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    locationCardIcon: {
        fontSize: 32,
    },
    locationCardInfo: {
        marginLeft: 12,
        flex: 1,
    },
    locationCardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    locationCardStatus: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    locationCardStatusSaved: {
        color: '#4ADE80',
    },
    locationCardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    saveLocationButton: {
        flex: 1,
        backgroundColor: '#8B5CF6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    saveLocationButtonDisabled: {
        backgroundColor: '#6D28D9',
    },
    saveLocationButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    clearLocationButton: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearLocationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Allergies
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#334155',
    },
    addButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    allergiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 14,
    },
    allergyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    allergyText: {
        color: '#4ADE80',
        fontSize: 14,
        fontWeight: '500',
    },
    removeIcon: {
        color: '#4ADE80',
        fontSize: 12,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        fontStyle: 'italic',
    },
    // Goals - row layout
    goalsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    goalCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    goalCardSmall: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    goalCardSelected: {
        borderColor: '#A855F7',
        backgroundColor: '#2D3A52',
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    goalIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    goalIconSmall: {
        fontSize: 28,
        marginBottom: 6,
    },
    goalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    goalLabelSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    selectedCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCheckmarkSmall: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCheckmarkText: {
        color: '#FFFFFF',
        fontSize: 12,
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
