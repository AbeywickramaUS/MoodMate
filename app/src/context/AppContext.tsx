import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodType, LocationType, UserGoalType } from '../data/features';
import { calculateRiskLevel } from '../utils/recommendationEngine';

interface MoodEntry {
    id: string;
    mood: MoodType;
    timestamp: number;
    location: LocationType;
    riskLevel: 'low' | 'medium' | 'high';
}

interface UserProfile {
    allergies: string[];
    preferredGoal: UserGoalType;
}

interface AppContextType {
    moodHistory: MoodEntry[];
    userProfile: UserProfile;
    currentRiskLevel: 'high' | 'stable' | 'improving';
    addMoodEntry: (mood: MoodType, location: LocationType) => Promise<void>;
    updateAllergies: (allergies: string[]) => Promise<void>;
    updatePreferredGoal: (goal: UserGoalType) => Promise<void>;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
    MOOD_HISTORY: '@moodmate_mood_history',
    USER_PROFILE: '@moodmate_user_profile',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        allergies: [],
        preferredGoal: 'relaxation',
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load data from storage on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [historyData, profileData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.MOOD_HISTORY),
                AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
            ]);

            if (historyData) {
                setMoodHistory(JSON.parse(historyData));
            }
            if (profileData) {
                setUserProfile(JSON.parse(profileData));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addMoodEntry = async (mood: MoodType, location: LocationType) => {
        const newEntry: MoodEntry = {
            id: Date.now().toString(),
            mood,
            timestamp: Date.now(),
            location,
            riskLevel: 'low',
        };

        const updatedHistory = [...moodHistory, newEntry];
        setMoodHistory(updatedHistory);

        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.MOOD_HISTORY,
                JSON.stringify(updatedHistory)
            );
        } catch (error) {
            console.error('Error saving mood entry:', error);
        }
    };

    const updateAllergies = async (allergies: string[]) => {
        const updatedProfile = { ...userProfile, allergies };
        setUserProfile(updatedProfile);

        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.USER_PROFILE,
                JSON.stringify(updatedProfile)
            );
        } catch (error) {
            console.error('Error saving allergies:', error);
        }
    };

    const updatePreferredGoal = async (goal: UserGoalType) => {
        const updatedProfile = { ...userProfile, preferredGoal: goal };
        setUserProfile(updatedProfile);

        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.USER_PROFILE,
                JSON.stringify(updatedProfile)
            );
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const currentRiskLevel = calculateRiskLevel(moodHistory);

    return (
        <AppContext.Provider
            value={{
                moodHistory,
                userProfile,
                currentRiskLevel,
                addMoodEntry,
                updateAllergies,
                updatePreferredGoal,
                isLoading,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
