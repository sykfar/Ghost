const ghostBookshelf = require('./base');

const Route = ghostBookshelf.Model.extend({
    tableName: 'routes',

    trip() {
        return this.belongsTo('Trip', 'trip_id');
    },

    parse(attrs) {
        attrs = ghostBookshelf.Model.prototype.parse.call(this, attrs);

        if (attrs.waypoint_order && typeof attrs.waypoint_order === 'string') {
            try {
                attrs.waypoint_order = JSON.parse(attrs.waypoint_order);
            } catch (e) {
                // leave as string if not valid JSON
            }
        }

        if (attrs.route_geometry && typeof attrs.route_geometry === 'string') {
            try {
                attrs.route_geometry = JSON.parse(attrs.route_geometry);
            } catch (e) {
                // leave as string if not valid JSON
            }
        }

        return attrs;
    },

    format(attrs) {
        if (attrs.waypoint_order && typeof attrs.waypoint_order === 'object') {
            attrs.waypoint_order = JSON.stringify(attrs.waypoint_order);
        }

        if (attrs.route_geometry && typeof attrs.route_geometry === 'object') {
            attrs.route_geometry = JSON.stringify(attrs.route_geometry);
        }

        return ghostBookshelf.Model.prototype.format.call(this, attrs);
    }
});

const Routes = ghostBookshelf.Collection.extend({
    model: Route
});

module.exports = {
    Route: ghostBookshelf.model('Route', Route),
    Routes: ghostBookshelf.collection('Routes', Routes)
};
