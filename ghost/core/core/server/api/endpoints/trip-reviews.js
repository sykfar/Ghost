const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const messages = {
    reviewNotFound: 'Review not found.',
    tripNotFound: 'Trip not found.'
};

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'trip_reviews',

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
            return models.TripReview.findPage(frame.options);
        }
    },

    add: {
        statusCode: 201,
        headers: {
            cacheInvalidate: false
        },
        permissions: true,
        async query(frame) {
            const reviewData = frame.data.trip_reviews[0];

            const trip = await models.Trip.findOne({id: reviewData.trip_id});
            if (!trip) {
                throw new errors.NotFoundError({
                    message: tpl(messages.tripNotFound)
                });
            }

            return models.TripReview.add(reviewData, frame.options);
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
            const model = await models.TripReview.edit(frame.data.trip_reviews[0], frame.options);
            if (!model) {
                throw new errors.NotFoundError({
                    message: tpl(messages.reviewNotFound)
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
            return models.TripReview.destroy({...frame.options, require: true});
        }
    }
};

module.exports = controller;
