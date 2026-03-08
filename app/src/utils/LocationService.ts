import * as Location from 'expo-location';
import { LocationType } from '../data/features';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface SavedLocations {
    home: Coordinates | null;
    office: Coordinates | null;
    meeting_room: Coordinates | null;
}

// Geofence radii in meters
const LOCATION_RADIUS: Record<string, number> = {
    home: 100,
    office: 100,
    meeting_room: 20,
};

/**
 * Request foreground location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
}

/**
 * Get current GPS coordinates
 */
export async function getCurrentPosition(): Promise<Coordinates | null> {
    try {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('Error getting current position:', error);
        return null;
    }
}

/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Match current coordinates to a saved location based on proximity.
 * 
 * Priority: meeting_room (smallest radius) > office > home
 * If no match found, defaults to 'home'.
 * 
 * Returns: { location, needsMeetingRoomConfirmation }
 * - needsMeetingRoomConfirmation is true when user is at office geofence
 *   but NOT within meeting room geofence (so we should ask them)
 */
export function matchLocation(
    currentCoords: Coordinates,
    savedLocations: SavedLocations
): { location: LocationType; needsMeetingRoomConfirmation: boolean } {
    const distances: Partial<Record<LocationType, number>> = {};

    // Calculate distance to each saved location
    for (const [key, coords] of Object.entries(savedLocations)) {
        if (coords) {
            distances[key as LocationType] = calculateDistance(
                currentCoords.latitude,
                currentCoords.longitude,
                coords.latitude,
                coords.longitude
            );
        }
    }

    // Check if within meeting room radius first (highest priority)
    if (
        distances.meeting_room !== undefined &&
        distances.meeting_room <= LOCATION_RADIUS.meeting_room
    ) {
        return { location: 'meeting_room', needsMeetingRoomConfirmation: false };
    }

    // Check if within office radius
    if (
        distances.office !== undefined &&
        distances.office <= LOCATION_RADIUS.office
    ) {
        // User is at office — need to ask if they're in a meeting room
        return { location: 'office', needsMeetingRoomConfirmation: true };
    }

    // Check if within home radius
    if (
        distances.home !== undefined &&
        distances.home <= LOCATION_RADIUS.home
    ) {
        return { location: 'home', needsMeetingRoomConfirmation: false };
    }

    // Default to home if no match
    return { location: 'home', needsMeetingRoomConfirmation: false };
}
