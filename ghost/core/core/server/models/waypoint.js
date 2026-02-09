const ghostBookshelf = require('./base');

const Waypoint = ghostBookshelf.Model.extend({
    tableName: 'waypoints',

    defaults() {
        return {
            category: 'custom',
            order_index: 0,
            duration_minutes: 30,
            is_start_point: false
        };
    },

    trip() {
        return this.belongsTo('Trip', 'trip_id');
    },

    photos() {
        return this.hasMany('TripPhoto', 'waypoint_id');
    }
});

const Waypoints = ghostBookshelf.Collection.extend({
    model: Waypoint
});

module.exports = {
    Waypoint: ghostBookshelf.model('Waypoint', Waypoint),
    Waypoints: ghostBookshelf.collection('Waypoints', Waypoints)
};
