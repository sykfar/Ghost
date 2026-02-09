const ghostBookshelf = require('./base');

const TripReview = ghostBookshelf.Model.extend({
    tableName: 'trip_reviews',

    trip() {
        return this.belongsTo('Trip', 'trip_id');
    },

    member() {
        return this.belongsTo('Member', 'member_id');
    }
});

const TripReviews = ghostBookshelf.Collection.extend({
    model: TripReview
});

module.exports = {
    TripReview: ghostBookshelf.model('TripReview', TripReview),
    TripReviews: ghostBookshelf.collection('TripReviews', TripReviews)
};
