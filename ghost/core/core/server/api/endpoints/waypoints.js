const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const messages = {
    waypointNotFound: 'Waypoint not found.',
    tripNotFound: 'Trip not found.'
};

function applyTripFilter(frame) {
    if (frame.data.trip_id) {
        frame.options.filter = frame.options.filter
            ? `trip_id:${frame.data.trip_id}+${frame.options.filter}`
            : `trip_id:${frame.data.trip_id}`;
    }
    if (!frame.options.order) {
        frame.options.order = 'order_index ASC';
    }
}

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'waypoints',

    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'filter',
            'fields',
            'limit',
            'order',
            'page'
        ],
        data: [
            'trip_id'
        ],
        permissions: true,
        query(frame) {
            applyTripFilter(frame);
            return models.Waypoint.findPage(frame.options);
        }
    },

    read: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'fields'
        ],
        data: [
            'id'
        ],
        permissions: true,
        async query(frame) {
            const model = await models.Waypoint.findOne(frame.data, frame.options);
            if (!model) {
                throw new errors.NotFoundError({
                    message: tpl(messages.waypointNotFound)
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
        permissions: true,
        async query(frame) {
            const waypointData = frame.data.waypoints[0];

            // Verify trip exists
            const trip = await models.Trip.findOne({id: waypointData.trip_id});
            if (!trip) {
                throw new errors.NotFoundError({
                    message: tpl(messages.tripNotFound)
                });
            }

            return models.Waypoint.add(waypointData, frame.options);
        }
    },

    edit: {
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
            const model = await models.Waypoint.edit(frame.data.waypoints[0], frame.options);
            if (!model) {
                throw new errors.NotFoundError({
                    message: tpl(messages.waypointNotFound)
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
            return models.Waypoint.destroy({...frame.options, require: true});
        }
    },

    reorder: {
        headers: {
            cacheInvalidate: false
        },
        data: [
            'trip_id'
        ],
        permissions: true,
        async query(frame) {
            const waypointOrder = frame.data.waypoints;

            if (!Array.isArray(waypointOrder)) {
                throw new errors.BadRequestError({
                    message: 'waypoints must be an array of {id, order_index}'
                });
            }

            for (const item of waypointOrder) {
                await models.Waypoint.edit(
                    {order_index: item.order_index},
                    {id: item.id}
                );
            }

            return models.Waypoint.findAll({
                filter: `trip_id:${frame.data.trip_id}`,
                order: 'order_index ASC'
            });
        }
    }
};

module.exports = controller;
