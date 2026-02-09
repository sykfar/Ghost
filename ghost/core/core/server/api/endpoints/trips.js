const crypto = require('crypto');
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const ALLOWED_INCLUDES = ['waypoints', 'route', 'reviews', 'photos'];

const messages = {
    tripNotFound: 'Trip not found.',
    tripNotOwned: 'You do not have permission to access this trip.'
};

async function cloneTrip(tripId, options) {
    const originalTrip = await models.Trip.findOne({id: tripId}, {withRelated: ['waypoints']});

    if (!originalTrip) {
        throw new errors.NotFoundError({message: tpl(messages.tripNotFound)});
    }

    const tripData = originalTrip.toJSON();

    const clonedTrip = await models.Trip.add({
        member_id: options.context.member_id || tripData.member_id,
        title: `${tripData.title} (copy)`,
        description: tripData.description,
        city: tripData.city,
        country: tripData.country,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        travel_mode: tripData.travel_mode,
        status: 'draft',
        visibility: 'private'
    }, options);

    if (tripData.waypoints && tripData.waypoints.length > 0) {
        for (const wp of tripData.waypoints) {
            await models.Waypoint.add({
                trip_id: clonedTrip.id,
                name: wp.name,
                description: wp.description,
                latitude: wp.latitude,
                longitude: wp.longitude,
                address: wp.address,
                category: wp.category,
                order_index: wp.order_index,
                duration_minutes: wp.duration_minutes,
                is_start_point: wp.is_start_point
            }, options);
        }
    }

    const cloneMemberId = options.context.member_id || tripData.member_id || null;
    await models.TripClone.add({
        original_trip_id: originalTrip.id,
        cloned_trip_id: clonedTrip.id,
        ...(cloneMemberId ? {member_id: cloneMemberId} : {})
    }, options);

    return clonedTrip;
}

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'trips',

    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include',
            'filter',
            'fields',
            'limit',
            'order',
            'page',
            'status',
            'visibility'
        ],
        validation: {
            options: {
                include: {
                    values: ALLOWED_INCLUDES
                }
            }
        },
        permissions: true,
        query(frame) {
            return models.Trip.findPage(frame.options);
        }
    },

    read: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include',
            'filter',
            'fields'
        ],
        data: [
            'id',
            'share_token'
        ],
        validation: {
            options: {
                include: {
                    values: ALLOWED_INCLUDES
                }
            }
        },
        permissions: true,
        async query(frame) {
            let model;

            if (frame.data.share_token) {
                model = await models.Trip.findOne({share_token: frame.data.share_token}, frame.options);
            } else {
                model = await models.Trip.findOne(frame.data, frame.options);
            }

            if (!model) {
                throw new errors.NotFoundError({
                    message: tpl(messages.tripNotFound)
                });
            }

            return model;
        }
    },

    add: {
        statusCode: 201,
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include'
        ],
        validation: {
            options: {
                include: {
                    values: ALLOWED_INCLUDES
                }
            }
        },
        permissions: true,
        query(frame) {
            return models.Trip.add(frame.data.trips[0], frame.options);
        }
    },

    edit: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'id',
            'include'
        ],
        validation: {
            options: {
                include: {
                    values: ALLOWED_INCLUDES
                },
                id: {
                    required: true
                }
            }
        },
        permissions: true,
        async query(frame) {
            const model = await models.Trip.edit(frame.data.trips[0], frame.options);
            if (!model) {
                throw new errors.NotFoundError({
                    message: tpl(messages.tripNotFound)
                });
            }
            return model;
        }
    },

    destroy: {
        statusCode: 204,
        headers: {
            cacheInvalidate: false
        },
        options: [
            'id'
        ],
        validation: {
            options: {
                id: {
                    required: true
                }
            }
        },
        permissions: true,
        query(frame) {
            return models.Trip.destroy({...frame.options, require: true});
        }
    },

    clone: {
        statusCode: 201,
        headers: {
            cacheInvalidate: false
        },
        options: [
            'id',
            'include'
        ],
        validation: {
            options: {
                id: {
                    required: true
                },
                include: {
                    values: ALLOWED_INCLUDES
                }
            }
        },
        permissions: true,
        async query(frame) {
            return cloneTrip(frame.options.id, frame.options);
        }
    },

    share: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'id'
        ],
        validation: {
            options: {
                id: {
                    required: true
                }
            }
        },
        permissions: true,
        async query(frame) {
            const trip = await models.Trip.findOne({id: frame.options.id});

            if (!trip) {
                throw new errors.NotFoundError({
                    message: tpl(messages.tripNotFound)
                });
            }

            let shareToken = trip.get('share_token');

            if (!shareToken) {
                shareToken = crypto.randomBytes(16).toString('hex');
                await models.Trip.edit({
                    share_token: shareToken,
                    visibility: 'shared'
                }, {id: trip.id});
            }

            return await models.Trip.findOne({id: trip.id}, frame.options);
        }
    }
};

module.exports = controller;
