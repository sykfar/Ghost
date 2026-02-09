const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const messages = {
    photoNotFound: 'Photo not found.',
    tripNotFound: 'Trip not found.'
};

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'trip_photos',

    browse: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'filter',
            'limit',
            'order',
            'page'
        ],
        data: [
            'trip_id'
        ],
        permissions: true,
        query(frame) {
            if (frame.data.trip_id) {
                frame.options.filter = frame.options.filter
                    ? `trip_id:${frame.data.trip_id}+${frame.options.filter}`
                    : `trip_id:${frame.data.trip_id}`;
            }
            return models.TripPhoto.findPage(frame.options);
        }
    },

    add: {
        statusCode: 201,
        headers: {
            cacheInvalidate: false
        },
        permissions: true,
        async query(frame) {
            const photoData = frame.data.trip_photos[0];

            const trip = await models.Trip.findOne({id: photoData.trip_id});
            if (!trip) {
                throw new errors.NotFoundError({
                    message: tpl(messages.tripNotFound)
                });
            }

            return models.TripPhoto.add(photoData, frame.options);
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
            return models.TripPhoto.destroy({...frame.options, require: true});
        }
    }
};

module.exports = controller;
