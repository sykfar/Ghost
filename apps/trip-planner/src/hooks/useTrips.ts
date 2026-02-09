export {
    useBrowseTrips,
    useReadTrip,
    useCreateTrip,
    useUpdateTrip,
    useDeleteTrip,
    useCloneTrip,
    useShareTrip,
    useAddWaypoint,
    useDeleteWaypoint,
    useCalculateRoute,
    useBrowseReviews,
    useAddReview,
    useEditReview,
    useDeleteReview,
    useBrowsePhotos,
    useAddPhoto,
    useDeletePhoto,
    useReadPreferences,
    useUpdatePreferences
} from '@tryghost/admin-x-framework/api/trips';

export type {
    Trip,
    Waypoint,
    Route,
    TripReview,
    TripPhoto,
    MemberPreference,
    TripsResponseType,
    WaypointsResponseType,
    TripRoutesResponseType,
    TripReviewsResponseType,
    TripPhotosResponseType,
    MemberPreferencesResponseType
} from '@tryghost/admin-x-framework/api/trips';
