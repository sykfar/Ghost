import React from 'react';
import {Waypoint} from '@app-types/trip';
import {Button, Card, CardContent, CardHeader, CardTitle} from '@tryghost/shade';

const CATEGORY_LABELS: Record<string, string> = {
    sight: 'Sight',
    museum: 'Museum',
    restaurant: 'Restaurant',
    hotel: 'Hotel',
    park: 'Park',
    custom: 'Custom'
};

interface WaypointListProps {
    waypoints: Waypoint[];
    onDeleteWaypoint: (id: string) => void;
}

const WaypointList: React.FC<WaypointListProps> = ({waypoints, onDeleteWaypoint}) => {
    if (waypoints.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Waypoints</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Click on the map to add waypoints
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Waypoints ({waypoints.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {waypoints
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((wp, index) => (
                        <div
                            key={wp.id}
                            className="flex items-center gap-2 rounded-md border p-2"
                        >
                            <span className="bg-muted flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{wp.name}</p>
                                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                    <span>{CATEGORY_LABELS[wp.category] || wp.category}</span>
                                    <span>&middot;</span>
                                    <span>{wp.duration_minutes} min</span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 flex-shrink-0 p-0"
                                onClick={() => onDeleteWaypoint(wp.id)}
                            >
                                &times;
                            </Button>
                        </div>
                    ))}
            </CardContent>
        </Card>
    );
};

export default WaypointList;
