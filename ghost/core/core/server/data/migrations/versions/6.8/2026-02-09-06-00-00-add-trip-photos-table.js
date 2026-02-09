const {addTable} = require('../../utils');

module.exports = addTable('trip_photos', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    trip_id: {type: 'string', maxlength: 24, nullable: false, references: 'trips.id', cascadeDelete: true, index: true},
    waypoint_id: {type: 'string', maxlength: 24, nullable: true, references: 'waypoints.id', setNullDelete: true},
    member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', index: true},
    image_url: {type: 'string', maxlength: 2000, nullable: false},
    caption: {type: 'string', maxlength: 500, nullable: true},
    created_at: {type: 'dateTime', nullable: false}
});
