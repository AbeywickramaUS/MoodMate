import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { useApp } from '../context/AppContext';
import {
    MOODS,
    LOCATIONS,
    MoodType,
    LocationType
} from '../data/features';

export default function MoodInputScreen({ navigation }: any) {
    const { addMoodEntry } = useApp();
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
    const [step, setStep] = useState(1);

    const handleMoodSelect = (mood: MoodType) => {
        setSelectedMood(mood);
        setStep(2);
    };

    const handleLocationSelect = (location: LocationType) => {
        setSelectedLocation(location);
    };

    const handleSubmit = async () => {
        if (selectedMood && selectedLocation) {
            await addMoodEntry(selectedMood, selectedLocation);
            navigation.navigate('Recommendation', {
                mood: selectedMood,
                location: selectedLocation,
            });
        }
    };

    const selectedMoodData = MOODS.find(m => m.id === selectedMood);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {step === 1 ? "How are you feeling?" : "Where are you?"}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 1
                        ? "Select the mood that best describes you right now"
                        : "This helps us give better recommendations"}
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
                /* Location Selection */
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

                    <View style={styles.locationGrid}>
                        {LOCATIONS.map((location) => (
                            <TouchableOpacity
                                key={location.id}
                                style={[
                                    styles.locationCard,
                                    selectedLocation === location.id && styles.locationCardSelected
                                ]}
                                onPress={() => handleLocationSelect(location.id)}
                            >
                                <Text style={styles.locationIcon}>{location.icon}</Text>
                                <Text style={styles.locationLabel}>{location.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            !selectedLocation && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedLocation}
                    >
                        <Text style={styles.submitButtonText}>
                            Get Recommendation →
                        </Text>
                    </TouchableOpacity>
                </>
            )}
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
    locationGrid: {
        padding: 16,
        gap: 12,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    locationCardSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#2D3A52',
    },
    locationIcon: {
        fontSize: 32,
    },
    locationLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        marginLeft: 16,
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
});
