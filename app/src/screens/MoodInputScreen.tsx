import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import {
    MOODS,
    LOCATIONS,
    MoodType,
    LocationType
} from '../data/features';

export default function MoodInputScreen({ navigation }: any) {
    const { addMoodEntry } = useApp();
    const {
        currentLocation,
        isLocationLoading,
        hasPermission,
        savedLocations,
        manualOverride,
        isManualOverride,
        clearManualOverride,
    } = useLocation();

    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [step, setStep] = useState(1);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Reset manual override when entering screen
    useEffect(() => {
        clearManualOverride();
    }, []);

    const handleMoodSelect = (mood: MoodType) => {
        setSelectedMood(mood);
        setStep(2);
    };

    const handleSubmit = async () => {
        if (selectedMood && currentLocation) {
            await addMoodEntry(selectedMood, currentLocation);
            navigation.navigate('Recommendation', {
                mood: selectedMood,
                location: currentLocation,
            });
        }
    };

    const handleManualOverride = (location: LocationType) => {
        manualOverride(location);
        setShowLocationPicker(false);
    };

    const selectedMoodData = MOODS.find(m => m.id === selectedMood);
    const currentLocationData = LOCATIONS.find(l => l.id === currentLocation);
    const hasSavedLocations = Object.values(savedLocations).some(v => v !== null);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {step === 1 ? "How are you feeling?" : "Your Location"}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 1
                        ? "Select the mood that best describes you right now"
                        : "Location detected automatically"}
                </Text>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>

            {step === 1 ? (
                /* Mood Selection */
                <View style={styles.optionsGrid}>
                    {MOODS.map((mood) => (
                        <TouchableOpacity
                            key={mood.id}
                            style={[
                                styles.moodCard,
                                selectedMood === mood.id && { borderColor: mood.color, borderWidth: 3 }
                            ]}
                            onPress={() => handleMoodSelect(mood.id)}
                        >
                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                            <Text style={styles.moodLabel}>{mood.label}</Text>
                            <View style={[styles.moodColorDot, { backgroundColor: mood.color }]} />
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                /* Auto-Detected Location Display */
                <>
                    {/* Selected Mood Display */}
                    {selectedMoodData && (
                        <View style={styles.selectedMoodBanner}>
                            <Text style={styles.selectedMoodEmoji}>{selectedMoodData.emoji}</Text>
                            <Text style={styles.selectedMoodText}>
                                Feeling {selectedMoodData.label}
                            </Text>
                            <TouchableOpacity onPress={() => setStep(1)}>
                                <Text style={styles.changeButton}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Location Display */}
                    {!hasSavedLocations ? (
                        /* No saved locations prompt */
                        <View style={styles.noLocationCard}>
                            <Text style={styles.noLocationIcon}>📍</Text>
                            <Text style={styles.noLocationTitle}>No Locations Saved</Text>
                            <Text style={styles.noLocationText}>
                                Go to Settings → My Locations to save your Home, Office, and Meeting Room coordinates.
                            </Text>
                            <TouchableOpacity
                                style={styles.goToSettingsButton}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                            >
                                <Text style={styles.goToSettingsText}>⚙️ Go to Settings</Text>
                            </TouchableOpacity>
                        </View>
                    ) : isLocationLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#8B5CF6" />
                            <Text style={styles.loadingText}>Detecting location...</Text>
                        </View>
                    ) : (
                        <View style={styles.detectedLocationCard}>
                            <View style={styles.detectedLocationHeader}>
                                <Text style={styles.detectedLabel}>📍 Detected Location</Text>
                                {isManualOverride && (
                                    <View style={styles.overrideBadge}>
                                        <Text style={styles.overrideBadgeText}>Manual</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.detectedLocationContent}>
                                <Text style={styles.detectedIcon}>
                                    {currentLocationData?.icon}
                                </Text>
                                <View style={styles.detectedInfo}>
                                    <Text style={styles.detectedName}>
                                        {currentLocationData?.label}
                                    </Text>
                                    <Text style={styles.detectedStatus}>
                                        {isManualOverride
                                            ? 'Manually selected'
                                            : 'Auto-detected via GPS'}
                                    </Text>
                                </View>
                            </View>

                            {/* Manual Override Button */}
                            <TouchableOpacity
                                style={styles.overrideButton}
                                onPress={() => setShowLocationPicker(true)}
                            >
                                <Text style={styles.overrideButtonText}>
                                    📍 Change Location
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!hasSavedLocations || isLocationLoading) && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!hasSavedLocations || isLocationLoading}
                    >
                        <Text style={styles.submitButtonText}>
                            Get Recommendation →
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Manual Override Modal */}
            <Modal
                visible={showLocationPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowLocationPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Location</Text>
                        <Text style={styles.modalSubtitle}>
                            Choose your current location manually
                        </Text>

                        {LOCATIONS.map((location) => (
                            <TouchableOpacity
                                key={location.id}
                                style={[
                                    styles.modalLocationCard,
                                    currentLocation === location.id && styles.modalLocationCardSelected
                                ]}
                                onPress={() => handleManualOverride(location.id)}
                            >
                                <Text style={styles.modalLocationIcon}>{location.icon}</Text>
                                <Text style={styles.modalLocationLabel}>{location.label}</Text>
                                {currentLocation === location.id && (
                                    <Text style={styles.modalCheckmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowLocationPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        marginTop: 8,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 80,
        marginBottom: 24,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#334155',
    },
    stepDotActive: {
        backgroundColor: '#8B5CF6',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#334155',
        marginHorizontal: 8,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
        justifyContent: 'center',
    },
    moodCard: {
        width: '45%',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodEmoji: {
        fontSize: 48,
    },
    moodLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 8,
    },
    moodColorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    selectedMoodBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    selectedMoodEmoji: {
        fontSize: 32,
    },
    selectedMoodText: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        marginLeft: 12,
    },
    changeButton: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '600',
    },
    // No saved locations
    noLocationCard: {
        margin: 16,
        padding: 24,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    noLocationIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    noLocationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    noLocationText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    goToSettingsButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    goToSettingsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Loading state
    loadingContainer: {
        margin: 16,
        padding: 40,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#94A3B8',
        marginTop: 16,
    },
    // Detected location card
    detectedLocationCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    detectedLocationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detectedLabel: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    overrideBadge: {
        backgroundColor: '#FB923C',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    overrideBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    detectedLocationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detectedIcon: {
        fontSize: 48,
    },
    detectedInfo: {
        marginLeft: 16,
        flex: 1,
    },
    detectedName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    detectedStatus: {
        fontSize: 13,
        color: '#8B5CF6',
        marginTop: 4,
    },
    overrideButton: {
        backgroundColor: '#2D3A52',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#475569',
    },
    overrideButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },
    submitButton: {
        margin: 16,
        marginTop: 24,
        backgroundColor: '#8B5CF6',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#4B5563',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    modalLocationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 18,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    modalLocationCardSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#2D3A52',
    },
    modalLocationIcon: {
        fontSize: 32,
    },
    modalLocationLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        marginLeft: 16,
        flex: 1,
    },
    modalCheckmark: {
        fontSize: 20,
        color: '#8B5CF6',
        fontWeight: 'bold',
    },
    modalCancelButton: {
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#475569',
    },
    modalCancelText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '500',
    },
});
