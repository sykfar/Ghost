import {Meta, createQuery, createQueryWithId, createMutation} from '../utils/api/hooks';
import type {LineString} from 'geojson';

export type Trip = {
    id: string;
    member_id: string;
    title: string;
    description: string | null;
    city: string | null;
    country: string | null;
    start_date: string | null;
    end_date: string | null;
    travel_mode: 'car' | 'foot' | 'bike' | 'public_transport';
    status: 'draft' | 'planned' | 'in_progress' | 'completed';
    visibility: 'private' | 'shared' | 'public';
    share_token: string | null;
    created_at: string;
    updated_at: string | null;
    waypoints?: Waypoint[];
    route?: Route | null;
    reviews?: TripReview[];
    photos?: TripPhoto[];
};

export type Waypoint = {
    id: string;
    trip_id: string;
    name: string;
    description: string | null;
    latitude: string;
    longitude: string;
    address: string | null;
    category: 'sight' | 'museum' | 'restaurant' | 'hotel' | 'park' | 'custom';
    order_index: number;
    duration_minutes: number;
    is_start_point: boolean;
    created_at: string;
    updated_at: string | null;
};

export type Route = {
    id: string;
    trip_id: string;
    waypoint_order: string[] | null;
    total_distance_meters: number | null;
    total_duration_minutes: number | null;
    route_geometry: LineString | null;
    travel_mode: string | null;
    is_feasible: boolean | null;
    feasibility_message: string | null;
    calculated_at: string | null;
    created_at: string;
    updated_at: string | null;
};

export type TripReview = {
    id: string;
    trip_id: string;
    member_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string | null;
};

export type TripPhoto = {
    id: string;
    trip_id: string;
    waypoint_id: string | null;
    member_id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
};

export interface TripsResponseType {
    meta?: Meta;
    trips: Trip[];
}

export interface WaypointsResponseType {
    waypoints: Waypoint[];
}

export interface TripRoutesResponseType {
    trip_routes: Route[];
}

const tripsDataType = 'TripsResponseType';

// Browse trips
export const useBrowseTrips = createQuery<TripsResponseType>({
    dataType: tripsDataType,
    path: '/trips/',
    defaultSearchParams: {include: 'waypoints,route'}
});

// Read single trip
export const useReadTrip = createQueryWithId<TripsResponseType>({
    dataType: tripsDataType,
    path: id => `/trips/${id}/`,
    defaultSearchParams: {include: 'waypoints,route,reviews,photos'}
});

// Create trip
export const useCreateTrip = createMutation<TripsResponseType, Partial<Trip>>({
    method: 'POST',
    path: () => '/trips/',
    body: trip => ({trips: [trip]}),
    invalidateQueries: {dataType: tripsDataType}
});

// Update trip
export const useUpdateTrip = createMutation<TripsResponseType, {id: string; data: Partial<Trip>}>({
    method: 'PUT',
    path: ({id}) => `/trips/${id}/`,
    body: ({data}) => ({trips: [data]}),
    invalidateQueries: {dataType: tripsDataType}
});

// Delete trip
export const useDeleteTrip = createMutation<unknown, string>({
    method: 'DELETE',
    path: id => `/trips/${id}/`,
    invalidateQueries: {dataType: tripsDataType}
});

// Clone trip
export const useCloneTrip = createMutation<TripsResponseType, string>({
    method: 'POST',
    path: id => `/trips/${id}/clone/`,
    body: () => ({}),
    invalidateQueries: {dataType: tripsDataType}
});

// Share trip
export const useShareTrip = createMutation<TripsResponseType, string>({
    method: 'POST',
    path: id => `/trips/${id}/share/`,
    body: () => ({}),
    invalidateQueries: {dataType: tripsDataType}
});

// Add waypoint
export const useAddWaypoint = createMutation<WaypointsResponseType, {tripId: string; waypoint: Partial<Waypoint>}>({
    method: 'POST',
    path: ({tripId}) => `/trips/${tripId}/waypoints/`,
    body: ({tripId, waypoint}) => ({waypoints: [{...waypoint, trip_id: tripId}]}),
    invalidateQueries: {dataType: tripsDataType}
});

// Delete waypoint
export const useDeleteWaypoint = createMutation<unknown, {tripId: string; waypointId: string}>({
    method: 'DELETE',
    path: ({tripId, waypointId}) => `/trips/${tripId}/waypoints/${waypointId}/`,
    invalidateQueries: {dataType: tripsDataType}
});

// Calculate route
export const useCalculateRoute = createMutation<TripRoutesResponseType, string>({
    method: 'POST',
    path: tripId => `/trips/${tripId}/route/calculate/`,
    body: () => ({}),
    invalidateQueries: {dataType: tripsDataType}
});

// --- Reviews ---

export interface TripReviewsResponseType {
    meta?: Meta;
    trip_reviews: TripReview[];
}

const reviewsDataType = 'TripReviewsResponseType';

export const useBrowseReviews = createQueryWithId<TripReviewsResponseType>({
    dataType: reviewsDataType,
    path: tripId => `/trips/${tripId}/reviews/`
});

export const useAddReview = createMutation<TripReviewsResponseType, {tripId: string; rating: number; comment?: string}>({
    method: 'POST',
    path: ({tripId}) => `/trips/${tripId}/reviews/`,
    body: ({tripId, rating, comment}) => ({trip_reviews: [{trip_id: tripId, rating, comment: comment || null}]}),
    invalidateQueries: {dataType: reviewsDataType}
});

export const useEditReview = createMutation<TripReviewsResponseType, {reviewId: string; rating: number; comment?: string}>({
    method: 'PUT',
    path: ({reviewId}) => `/trip-reviews/${reviewId}/`,
    body: ({rating, comment}) => ({trip_reviews: [{rating, comment: comment || null}]}),
    invalidateQueries: {dataType: reviewsDataType}
});

export const useDeleteReview = createMutation<unknown, string>({
    method: 'DELETE',
    path: reviewId => `/trip-reviews/${reviewId}/`,
    invalidateQueries: {dataType: reviewsDataType}
});

// --- Photos ---

export interface TripPhotosResponseType {
    meta?: Meta;
    trip_photos: TripPhoto[];
}

const photosDataType = 'TripPhotosResponseType';

export const useBrowsePhotos = createQueryWithId<TripPhotosResponseType>({
    dataType: photosDataType,
    path: tripId => `/trips/${tripId}/photos/`
});

export const useAddPhoto = createMutation<TripPhotosResponseType, {tripId: string; image_url: string; caption?: string; waypoint_id?: string}>({
    method: 'POST',
    path: ({tripId}) => `/trips/${tripId}/photos/`,
    body: ({tripId, image_url, caption, waypoint_id}) => ({trip_photos: [{trip_id: tripId, image_url, caption: caption || null, waypoint_id: waypoint_id || null}]}),
    invalidateQueries: {dataType: photosDataType}
});

export const useDeletePhoto = createMutation<unknown, {tripId: string; photoId: string}>({
    method: 'DELETE',
    path: ({photoId}) => `/trip-photos/${photoId}/`,
    invalidateQueries: {dataType: photosDataType}
});

// --- Member Preferences ---

export type MemberPreference = {
    id: string;
    member_id: string;
    preferred_travel_mode: string | null;
    preferred_categories: string[] | null;
    preferred_pace: 'relaxed' | 'moderate' | 'intensive' | null;
    home_city: string | null;
    created_at: string;
    updated_at: string | null;
};

export interface MemberPreferencesResponseType {
    member_preferences: MemberPreference[];
}

const preferencesDataType = 'MemberPreferencesResponseType';

export const useReadPreferences = createQueryWithId<MemberPreferencesResponseType>({
    dataType: preferencesDataType,
    path: memberId => `/members/${memberId}/preferences/`
});

export const useUpdatePreferences = createMutation<MemberPreferencesResponseType, {memberId: string; data: Partial<MemberPreference>}>({
    method: 'PUT',
    path: ({memberId}) => `/members/${memberId}/preferences/`,
    body: ({data}) => ({member_preferences: [data]}),
    invalidateQueries: {dataType: preferencesDataType}
});
