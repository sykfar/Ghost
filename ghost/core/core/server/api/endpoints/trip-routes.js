const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const messages = {
    routeNotFound: 'Route not found.',
    tripNotFound: 'Trip not found.',
    noWaypoints: 'Trip has no waypoints to calculate a route.'
};

// OSRM demo server for development
const OSRM_BASE_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';

async function fetchOsrmRoute(waypoints, travelMode) {
    const coordinates = waypoints
        .map(wp => `${wp.longitude},${wp.latitude}`)
        .join(';');

    const profile = travelMode === 'car' ? 'driving' : 'foot';
    const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=false`;

    let routeData;
    try {
        const response = await fetch(url);
        routeData = await response.json();
    } catch (err) {
        throw new errors.InternalServerError({
            message: 'Failed to calculate route from OSRM',
            err
        });
    }

    if (routeData.code !== 'Ok' || !routeData.routes || routeData.routes.length === 0) {
        throw new errors.InternalServerError({
            message: `OSRM returned error: ${routeData.code || 'Unknown'}`
        });
    }

    return routeData.routes[0];
}

function computeFeasibility(tripData, waypoints, totalDurationMinutes) {
    if (!tripData.start_date || !tripData.end_date) {
        return {isFeasible: null, feasibilityMessage: null};
    }

    const startDate = new Date(tripData.start_date);
    const endDate = new Date(tripData.end_date);
    const availableMinutes = (endDate - startDate) / (1000 * 60);
    const waypointDuration = waypoints.reduce((sum, wp) => sum + (wp.duration_minutes || 0), 0);
    const neededMinutes = totalDurationMinutes + waypointDuration;
    const isFeasible = neededMinutes <= availableMinutes;

    let feasibilityMessage;
    if (!isFeasible) {
        const hoursPerDay = 10;
        const recommendedDays = Math.ceil(neededMinutes / (hoursPerDay * 60));
        feasibilityMessage = `This trip needs approximately ${recommendedDays} day(s). Total travel: ${totalDurationMinutes} min, stops: ${waypointDuration} min. Consider extending your dates.`;
    } else {
        feasibilityMessage = `Trip is feasible. Total time needed: ${totalDurationMinutes + waypointDuration} min.`;
    }

    return {isFeasible, feasibilityMessage};
}

async function upsertRoute(tripId, routeRecord, options) {
    const existingRoute = await models.Route.findOne({trip_id: tripId});
    if (existingRoute) {
        return models.Route.edit(routeRecord, {id: existingRoute.id});
    }
    return models.Route.add(routeRecord, options);
}

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'trip_routes',

    read: {
        headers: {
            cacheInvalidate: false
        },
        data: [
            'trip_id'
        ],
        permissions: true,
        async query(frame) {
            const model = await models.Route.findOne({trip_id: frame.data.trip_id});
            if (!model) {
                throw new errors.NotFoundError({message: tpl(messages.routeNotFound)});
            }
            return model;
        }
    },

    calculate: {
        headers: {
            cacheInvalidate: false
        },
        data: [
            'trip_id'
        ],
        permissions: true,
        async query(frame) {
            return calculateRoute(frame.data.trip_id, frame.options);
        }
    },

    feasibility: {
        headers: {
            cacheInvalidate: false
        },
        data: [
            'trip_id'
        ],
        permissions: true,
        async query(frame) {
            const route = await models.Route.findOne({trip_id: frame.data.trip_id});
            if (!route) {
                throw new errors.NotFoundError({message: tpl(messages.routeNotFound)});
            }
            return route;
        }
    }
};

async function calculateRoute(tripId, options) {
    const trip = await models.Trip.findOne({id: tripId}, {withRelated: ['waypoints']});

    if (!trip) {
        throw new errors.NotFoundError({message: tpl(messages.tripNotFound)});
    }

    const tripData = trip.toJSON();
    const waypoints = (tripData.waypoints || []).sort((a, b) => a.order_index - b.order_index);

    if (waypoints.length < 2) {
        throw new errors.ValidationError({message: tpl(messages.noWaypoints)});
    }

    const osrmRoute = await fetchOsrmRoute(waypoints, tripData.travel_mode);
    const totalDistanceMeters = Math.round(osrmRoute.distance);
    const totalDurationMinutes = Math.round(osrmRoute.duration / 60);
    const {isFeasible, feasibilityMessage} = computeFeasibility(tripData, waypoints, totalDurationMinutes);

    const routeRecord = {
        trip_id: tripId,
        waypoint_order: JSON.stringify(waypoints.map(wp => wp.id)),
        total_distance_meters: totalDistanceMeters,
        total_duration_minutes: totalDurationMinutes,
        route_geometry: JSON.stringify(osrmRoute.geometry),
        travel_mode: tripData.travel_mode,
        is_feasible: isFeasible,
        feasibility_message: feasibilityMessage,
        calculated_at: new Date().toISOString()
    };

    return upsertRoute(tripId, routeRecord, options);
}

module.exports = controller;
