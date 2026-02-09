const ghostBookshelf = require('./base');

const TripPhoto = ghostBookshelf.Model.extend({
    tableName: 'trip_photos',

    hasTimestamps: ['created_at'],

    trip() {
        return this.belongsTo('Trip', 'trip_id');
    },

    waypoint() {
        return this.belongsTo('Waypoint', 'waypoint_id');
    },

    member() {
        return this.belongsTo('Member', 'member_id');
    }
});

const TripPhotos = ghostBookshelf.Collection.extend({
    model: TripPhoto
});

module.exports = {
    TripPhoto: ghostBookshelf.model('TripPhoto', TripPhoto),
    TripPhotos: ghostBookshelf.collection('TripPhotos', TripPhotos)
};
