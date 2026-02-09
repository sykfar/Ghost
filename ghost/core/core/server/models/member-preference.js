const ghostBookshelf = require('./base');

const MemberPreference = ghostBookshelf.Model.extend({
    tableName: 'member_preferences',

    member() {
        return this.belongsTo('Member', 'member_id');
    },

    parse(attrs) {
        attrs = ghostBookshelf.Model.prototype.parse.call(this, attrs);

        if (attrs.preferred_categories && typeof attrs.preferred_categories === 'string') {
            try {
                attrs.preferred_categories = JSON.parse(attrs.preferred_categories);
            } catch (e) {
                // leave as string if not valid JSON
            }
        }

        return attrs;
    },

    format(attrs) {
        if (attrs.preferred_categories && typeof attrs.preferred_categories === 'object') {
            attrs.preferred_categories = JSON.stringify(attrs.preferred_categories);
        }

        return ghostBookshelf.Model.prototype.format.call(this, attrs);
    }
});

const MemberPreferences = ghostBookshelf.Collection.extend({
    model: MemberPreference
});

module.exports = {
    MemberPreference: ghostBookshelf.model('MemberPreference', MemberPreference),
    MemberPreferences: ghostBookshelf.collection('MemberPreferences', MemberPreferences)
};
