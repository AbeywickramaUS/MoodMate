import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { LocationType, LOCATIONS } from '../data/features';
import {
    Coordinates,
    SavedLocations,
    requestLocationPermission,
    getCurrentPosition,
    matchLocation,
} from '../utils/LocationService';

interface LocationContextType {
    currentLocation: LocationType;
    savedLocations: SavedLocations;
    isLocationLoading: boolean;
    locationError: string | null;
    hasPermission: boolean;
    saveLocation: (type: LocationType, coords: Coordinates) => Promise<void>;
    clearLocation: (type: LocationType) => Promise<void>;
    manualOverride: (type: LocationType) => void;
    isManualOverride: boolean;
    clearManualOverride: () => void;
    refreshLocation: () => Promise<void>;
    leaveMeetingRoom: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = '@moodmate_saved_locations';

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [currentLocation, setCurrentLocation] = useState<LocationType>('home');
    const [savedLocations, setSavedLocations] = useState<SavedLocations>({
        home: null,
        office: null,
        meeting_room: null,
    });
    const [isLocationLoading, setIsLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isManualOverride, setIsManualOverride] = useState(false);
    const watchSubscription = useRef<Location.LocationSubscription | null>(null);
    const lastMeetingRoomPrompt = useRef<number>(0);

    // Load saved locations from storage
    useEffect(() => {
        loadSavedLocations();
    }, []);

    // Start location watching when permission is granted and locations are saved
    useEffect(() => {
        if (hasPermission && !isManualOverride) {
            startWatching();
        }
        return () => {
            stopWatching();
        };
    }, [hasPermission, savedLocations, isManualOverride]);

    const loadSavedLocations = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                setSavedLocations(JSON.parse(data));
            }
            // Request permission
            const granted = await requestLocationPermission();
            setHasPermission(granted);
            if (!granted) {
                setLocationError('Location permission denied');
            }
        } catch (error) {
            console.error('Error loading saved locations:', error);
        } finally {
            setIsLocationLoading(false);
        }
    };

    const startWatching = async () => {
        // Stop any existing watcher
        stopWatching();

        // Check if any locations are saved
        const hasSaved = Object.values(savedLocations).some(v => v !== null);
        if (!hasSaved) return;

        try {
            watchSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 10000, // Check every 10 seconds
                    distanceInterval: 10, // Or when moved 10 meters
                },
                (location) => {
                    if (isManualOverride) return;

                    const coords: Coordinates = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    const result = matchLocation(coords, savedLocations);

                    if (result.needsMeetingRoomConfirmation) {
                        // Only prompt once every 5 minutes to avoid spam
                        const now = Date.now();
                        if (now - lastMeetingRoomPrompt.current > 5 * 60 * 1000) {
                            lastMeetingRoomPrompt.current = now;
                            promptMeetingRoom();
                        } else {
                            // Keep whatever was set last time (office or meeting_room)
                            // Only update to office if not already meeting_room
                            setCurrentLocation(prev =>
                                prev === 'meeting_room' ? 'meeting_room' : 'office'
                            );
                        }
                    } else {
                        setCurrentLocation(result.location);
                    }
                }
            );
        } catch (error) {
            console.error('Error starting location watch:', error);
            setLocationError('Failed to start location tracking');
        }
    };

    const stopWatching = () => {
        if (watchSubscription.current) {
            watchSubscription.current.remove();
            watchSubscription.current = null;
        }
    };

    const promptMeetingRoom = () => {
        Alert.alert(
            '📍 Location Detected',
            'It looks like you\'re at the Office. Are you in a Meeting Room?',
            [
                {
                    text: 'No, Office',
                    style: 'cancel',
                    onPress: () => setCurrentLocation('office'),
                },
                {
                    text: 'Yes, Meeting Room',
                    onPress: () => setCurrentLocation('meeting_room'),
                },
            ],
            { cancelable: false }
        );
    };

    const saveLocation = async (type: LocationType, coords: Coordinates) => {
        const updated = { ...savedLocations, [type]: coords };
        setSavedLocations(updated);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving location:', error);
        }
    };

    const clearLocation = async (type: LocationType) => {
        const updated = { ...savedLocations, [type]: null };
        setSavedLocations(updated);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error clearing location:', error);
        }
    };

    const manualOverride = (type: LocationType) => {
        setIsManualOverride(true);
        setCurrentLocation(type);
    };

    const clearManualOverride = () => {
        setIsManualOverride(false);
    };

    const leaveMeetingRoom = () => {
        setCurrentLocation('office');
    };

    const refreshLocation = async () => {
        setIsLocationLoading(true);
        try {
            const coords = await getCurrentPosition();
            if (coords) {
                const result = matchLocation(coords, savedLocations);
                if (result.needsMeetingRoomConfirmation) {
                    promptMeetingRoom();
                } else {
                    setCurrentLocation(result.location);
                }
            }
        } catch (error) {
            console.error('Error refreshing location:', error);
        } finally {
            setIsLocationLoading(false);
        }
    };

    return (
        <LocationContext.Provider
            value={{
                currentLocation,
                savedLocations,
                isLocationLoading,
                locationError,
                hasPermission,
                saveLocation,
                clearLocation,
                manualOverride,
                isManualOverride,
                clearManualOverride,
                refreshLocation,
                leaveMeetingRoom,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
