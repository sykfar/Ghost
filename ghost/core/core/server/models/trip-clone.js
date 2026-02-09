const ghostBookshelf = require('./base');

const TripClone = ghostBookshelf.Model.extend({
    tableName: 'trip_clones',

    hasTimestamps: ['created_at'],

    originalTrip() {
        return this.belongsTo('Trip', 'original_trip_id');
    },

    clonedTrip() {
        return this.belongsTo('Trip', 'cloned_trip_id');
    },

    member() {
        return this.belongsTo('Member', 'member_id');
    }
});

const TripClones = ghostBookshelf.Collection.extend({
    model: TripClone
});

module.exports = {
    TripClone: ghostBookshelf.model('TripClone', TripClone),
    TripClones: ghostBookshelf.collection('TripClones', TripClones)
};
