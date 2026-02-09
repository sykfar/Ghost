const ghostBookshelf = require('./base');

const Trip = ghostBookshelf.Model.extend({
    tableName: 'trips',

    defaults() {
        return {
            status: 'draft',
            visibility: 'private',
            travel_mode: 'foot'
        };
    },

    relationships: ['waypoints', 'route', 'reviews', 'photos'],

    relationshipConfig: {
        waypoints: {editable: false},
        route: {editable: false},
        reviews: {editable: false},
        photos: {editable: false}
    },

    waypoints() {
        return this.hasMany('Waypoint', 'trip_id')
            .query('orderBy', 'order_index', 'ASC');
    },

    route() {
        return this.hasOne('Route', 'trip_id');
    },

    reviews() {
        return this.hasMany('TripReview', 'trip_id');
    },

    photos() {
        return this.hasMany('TripPhoto', 'trip_id');
    },

    member() {
        return this.belongsTo('Member', 'member_id');
    },

    clones() {
        return this.hasMany('TripClone', 'original_trip_id');
    },

    permittedAttributes() {
        let filteredKeys = ghostBookshelf.Model.prototype.permittedAttributes.apply(this, arguments);
        this.relationships.forEach((key) => {
            filteredKeys.push(key);
        });
        return filteredKeys;
    },

    searchQuery(queryBuilder, query) {
        queryBuilder.where(function () {
            this.where('trips.title', 'like', `%${query}%`)
                .orWhere('trips.city', 'like', `%${query}%`)
                .orWhere('trips.country', 'like', `%${query}%`);
        });
    }
}, {
    permittedOptions(methodName) {
        let options = ghostBookshelf.Model.permittedOptions.call(this, methodName);
        if (['findPage', 'findAll'].includes(methodName)) {
            options = options.concat(['search', 'status', 'visibility']);
        }
        return options;
    }
});

const Trips = ghostBookshelf.Collection.extend({
    model: Trip
});

module.exports = {
    Trip: ghostBookshelf.model('Trip', Trip),
    Trips: ghostBookshelf.collection('Trips', Trips)
};
