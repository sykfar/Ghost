const models = require('../../models');

/** @type {import('@tryghost/api-framework').Controller} */
const controller = {
    docName: 'member_preferences',

    read: {
        headers: {
            cacheInvalidate: false
        },
        data: [
            'member_id'
        ],
        permissions: true,
        async query(frame) {
            let model = await models.MemberPreference.findOne({member_id: frame.data.member_id});

            if (!model) {
                // Create default preferences if they don't exist
                model = await models.MemberPreference.add({
                    member_id: frame.data.member_id
                }, frame.options);
            }

            return model;
        }
    },

    edit: {
        headers: {
            cacheInvalidate: false
        },
        options: [
            'member_id'
        ],
        permissions: true,
        async query(frame) {
            const memberId = frame.options.member_id || frame.data.member_id;
            const prefData = frame.data.member_preferences[0];
            let existing = await models.MemberPreference.findOne({member_id: memberId});

            if (existing) {
                return models.MemberPreference.edit(prefData, {id: existing.id});
            }

            prefData.member_id = memberId;
            return models.MemberPreference.add(prefData, frame.options);
        }
    }
};

module.exports = controller;
