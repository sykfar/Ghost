import React, {useState} from 'react';
import {Trip} from '@app-types/trip';
import {useBrowseTrips, useCreateTrip, useDeleteTrip} from '@hooks/useTrips';
import {useNavigate} from '@tryghost/admin-x-framework';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input} from '@tryghost/shade';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed'
};

const TRAVEL_MODE_LABELS: Record<string, string> = {
    car: 'Car',
    foot: 'Walking',
    bike: 'Bike',
    public_transport: 'Public Transport'
};

const TripList: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const searchParams: Record<string, string> = {include: 'waypoints,route'};
    if (statusFilter) {
        searchParams.filter = `status:${statusFilter}`;
    }

    const {data, isLoading: loading} = useBrowseTrips({searchParams});
    const {mutateAsync: createTrip} = useCreateTrip();
    const {mutateAsync: deleteTrip} = useDeleteTrip();

    const trips: Trip[] = data?.trips || [];

    const handleNewTrip = async () => {
        const result = await createTrip({
            title: 'New Trip',
            status: 'draft',
            travel_mode: 'foot',
            visibility: 'private'
        });

        if (result.trips?.[0]) {
            navigate(`/trips/${result.trips[0].id}`);
        }
    };

    const handleDeleteTrip = async (id: string) => {
        await deleteTrip(id);
    };

    const filteredTrips = trips.filter(trip => {
        if (!searchQuery) {
            return true;
        }
        const q = searchQuery.toLowerCase();
        return trip.title.toLowerCase().includes(q) ||
               trip.city?.toLowerCase().includes(q) ||
               trip.country?.toLowerCase().includes(q);
    });

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Trip Planner</h1>
                    <p className="text-muted-foreground">Plan and manage your city trips</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/preferences')}>Preferences</Button>
                    <Button onClick={handleNewTrip}>New Trip</Button>
                </div>
            </div>

            <div className="mb-4 flex gap-3">
                <Input
                    className="max-w-xs"
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <select
                    className="rounded-md border px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {loading ? (
                <p className="text-muted-foreground py-12 text-center">Loading trips...</p>
            ) : filteredTrips.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No trips found</p>
                    <Button variant="outline" onClick={handleNewTrip}>Create your first trip</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTrips.map(trip => (
                        <Card
                            key={trip.id}
                            className="cursor-pointer transition-shadow hover:shadow-md"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{trip.title}</CardTitle>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                        {STATUS_LABELS[trip.status] || trip.status}
                                    </span>
                                </div>
                                {trip.city && (
                                    <CardDescription>
                                        {trip.city}{trip.country ? `, ${trip.country}` : ''}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                    <span>{TRAVEL_MODE_LABELS[trip.travel_mode] || trip.travel_mode}</span>
                                    {trip.start_date && (
                                        <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                                    )}
                                    {trip.waypoints && (
                                        <span>{trip.waypoints.length} stops</span>
                                    )}
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTrip(trip.id);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TripList;
