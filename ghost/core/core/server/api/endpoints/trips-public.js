const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const ALLOWED_INCLUDES = ['waypoints', 'route', 'reviews'];

const messages = {
    tripNotFound: 'Shared trip not found.'
};

async function findSharedTrip(shareToken, options) {
    const model = await models.Trip.findOne(
        {share_token: shareToken},
        {...options, withRelated: ['waypoints', 'route', 'reviews']}
    );

    if (!model) {
        throw new errors.NotFoundError({message: tpl(messages.tripNotFound)});
    }

    const visibility = model.get('visibility');
    if (visibility !== 'shared' && visibility !== 'public') {
        throw new errors.NotFoundError({message: tpl(messages.tripNotFound)});
    }

    return model;
}

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'trips',

    read: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'include'
        ],
        data: [
            'share_token'
        ],
        validation: {
            options: {
                include: {
                    values: ALLOWED_INCLUDES
                }
            },
            data: {
                share_token: {
                    required: true
                }
            }
        },
        permissions: true,
        async query(frame) {
            return findSharedTrip(frame.data.share_token, frame.options);
        }
    }
};

module.exports = controller;
