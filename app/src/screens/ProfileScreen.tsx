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
                    Save your locations so the app can auto-detect where you are
                </Text>

                {LOCATIONS.map((location) => {
                    const coords = savedLocations[location.id];
                    const isSaving = savingLocation === location.id;
                    const isSaved = coords !== null;

                    return (
                        <View key={location.id} style={styles.locationCard}>
                            <View style={styles.locationCardHeader}>
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
    // Location cards
    locationCard: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    locationCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
        borderRadius: 8,
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
        borderRadius: 8,
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
    // Goals
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
