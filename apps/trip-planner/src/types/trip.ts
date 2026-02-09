import type {LineString} from 'geojson';

export interface Trip {
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
}

export interface Waypoint {
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
}

export interface Route {
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
}

export interface TripReview {
    id: string;
    trip_id: string;
    member_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface TripPhoto {
    id: string;
    trip_id: string;
    waypoint_id: string | null;
    member_id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
}

export interface MemberPreference {
    id: string;
    member_id: string;
    preferred_travel_mode: string | null;
    preferred_categories: string[] | null;
    preferred_pace: 'relaxed' | 'moderate' | 'intensive' | null;
    home_city: string | null;
    created_at: string;
    updated_at: string | null;
}
