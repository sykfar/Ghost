import React, {useState} from 'react';
import {Trip, Waypoint} from '@app-types/trip';
import {useReadTrip, useUpdateTrip, useAddWaypoint, useDeleteWaypoint, useCalculateRoute, useShareTrip} from '@hooks/useTrips';
import {useNavigate, useParams} from '@tryghost/admin-x-framework';
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea} from '@tryghost/shade';
import TripMap from '@components/TripMap';
import WaypointList from '@components/WaypointList';
import ReviewPanel from '@components/ReviewPanel';
import PhotoGallery from '@components/PhotoGallery';

const TripEditor: React.FC = () => {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();

    const {data, isLoading: loading, refetch} = useReadTrip(id || '', {enabled: !!id});
    const {mutateAsync: updateTrip, isLoading: saving} = useUpdateTrip();
    const {mutateAsync: addWaypoint} = useAddWaypoint();
    const {mutateAsync: deleteWaypointMutation} = useDeleteWaypoint();
    const {mutateAsync: calculateRoute} = useCalculateRoute();
    const {mutateAsync: shareTrip} = useShareTrip();

    const trip = data?.trips?.[0] || null;

    // Local edits overlay on top of server data
    const [localEdits, setLocalEdits] = useState<Partial<Trip>>({});
    const editedTrip = trip ? {...trip, ...localEdits} : null;

    const updateField = (field: string, value: string) => {
        setLocalEdits(prev => ({...prev, [field]: value}));
    };

    const handleSave = async () => {
        if (!editedTrip || !id) {
            return;
        }
        await updateTrip({
            id,
            data: {
                title: editedTrip.title,
                description: editedTrip.description,
                city: editedTrip.city,
                country: editedTrip.country,
                start_date: editedTrip.start_date,
                end_date: editedTrip.end_date,
                travel_mode: editedTrip.travel_mode,
                status: editedTrip.status
            }
        });
        setLocalEdits({});
    };

    const handleMapClick = async (lat: number, lng: number) => {
        if (!id) {
            return;
        }
        const waypointCount = trip?.waypoints?.length || 0;
        await addWaypoint({
            tripId: id,
            waypoint: {
                name: `Stop ${waypointCount + 1}`,
                latitude: lat.toFixed(7),
                longitude: lng.toFixed(7),
                order_index: waypointCount,
                category: 'custom',
                duration_minutes: 30
            }
        });
        refetch();
    };

    const handleDeleteWaypoint = async (waypointId: string) => {
        if (!id) {
            return;
        }
        await deleteWaypointMutation({tripId: id, waypointId});
        refetch();
    };

    const handleCalculateRoute = async () => {
        if (!id) {
            return;
        }
        await calculateRoute(id);
        refetch();
    };

    const handleShare = async () => {
        if (!id) {
            return;
        }
        const result = await shareTrip(id);
        if (result.trips?.[0]?.share_token) {
            const shareUrl = `${window.location.origin}/ghost/api/content/trips/${result.trips[0].share_token}/`;
            await navigator.clipboard.writeText(shareUrl);
            alert('Share link copied to clipboard!');
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    if (!editedTrip) {
        return <div className="flex h-full items-center justify-center">Trip not found</div>;
    }

    const waypoints: Waypoint[] = editedTrip.waypoints || [];

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate('/trips')}>
                        Back
                    </Button>
                    <Input
                        className="text-lg font-bold"
                        value={editedTrip.title}
                        onChange={e => updateField('title', e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCalculateRoute} disabled={waypoints.length < 2}>
                        Calculate Route
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                        Share
                    </Button>
                    <Button variant="outline" onClick={() => window.open(`/ghost/api/admin/trips/${id}/export/`, '_blank')}>
                        Export PDF
                    </Button>
                    <Button disabled={saving} onClick={handleSave}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Main content: split layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left panel: trip details + waypoints */}
                <div className="w-96 flex-shrink-0 overflow-y-auto border-r p-4">
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-sm">Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-muted-foreground mb-1 block text-xs">City</label>
                                    <Input
                                        placeholder="City"
                                        value={editedTrip.city || ''}
                                        onChange={e => updateField('city', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-muted-foreground mb-1 block text-xs">Country</label>
                                    <Input
                                        placeholder="Country"
                                        value={editedTrip.country || ''}
                                        onChange={e => updateField('country', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-muted-foreground mb-1 block text-xs">Start Date</label>
                                    <Input
                                        type="date"
                                        value={editedTrip.start_date?.split('T')[0] || ''}
                                        onChange={e => updateField('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-muted-foreground mb-1 block text-xs">End Date</label>
                                    <Input
                                        type="date"
                                        value={editedTrip.end_date?.split('T')[0] || ''}
                                        onChange={e => updateField('end_date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">Travel Mode</label>
                                <select
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    value={editedTrip.travel_mode}
                                    onChange={e => updateField('travel_mode', e.target.value)}
                                >
                                    <option value="foot">Walking</option>
                                    <option value="car">Car</option>
                                    <option value="bike">Bike</option>
                                    <option value="public_transport">Public Transport</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">Status</label>
                                <select
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    value={editedTrip.status}
                                    onChange={e => updateField('status', e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-1 block text-xs">Description</label>
                                <Textarea
                                    placeholder="Trip description..."
                                    rows={3}
                                    value={editedTrip.description || ''}
                                    onChange={e => updateField('description', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Waypoint list */}
                    <WaypointList
                        waypoints={waypoints}
                        onDeleteWaypoint={handleDeleteWaypoint}
                    />

                    {/* Route info */}
                    {editedTrip.route && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-sm">Route Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <div className="space-y-1">
                                    <p>Distance: {editedTrip.route.total_distance_meters ? `${(editedTrip.route.total_distance_meters / 1000).toFixed(1)} km` : 'N/A'}</p>
                                    <p>Travel time: {editedTrip.route.total_duration_minutes ? `${editedTrip.route.total_duration_minutes} min` : 'N/A'}</p>
                                    <p className={editedTrip.route.is_feasible === false ? 'text-red-600 font-medium' : 'text-green-600'}>
                                        {editedTrip.route.feasibility_message || (editedTrip.route.is_feasible ? 'Feasible' : 'Not assessed')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reviews */}
                    <div className="mt-4">
                        <ReviewPanel tripId={id!} />
                    </div>

                    {/* Photos */}
                    <div className="mt-4">
                        <PhotoGallery tripId={id!} />
                    </div>
                </div>

                {/* Right panel: map */}
                <div className="flex-1">
                    <TripMap
                        routeGeometry={editedTrip.route?.route_geometry}
                        waypoints={waypoints}
                        onMapClick={handleMapClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default TripEditor;
