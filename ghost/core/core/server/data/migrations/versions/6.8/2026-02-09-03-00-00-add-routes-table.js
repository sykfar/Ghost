const {addTable} = require('../../utils');

module.exports = addTable('routes', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    trip_id: {type: 'string', maxlength: 24, nullable: false, references: 'trips.id', cascadeDelete: true, unique: true},
    waypoint_order: {type: 'text', maxlength: 65535, nullable: true},
    total_distance_meters: {type: 'integer', nullable: true, unsigned: true},
    total_duration_minutes: {type: 'integer', nullable: true, unsigned: true},
    route_geometry: {type: 'text', maxlength: 1000000000, nullable: true, fieldtype: 'long'},
    travel_mode: {type: 'string', maxlength: 50, nullable: true},
    is_feasible: {type: 'boolean', nullable: true},
    feasibility_message: {type: 'text', maxlength: 65535, nullable: true},
    calculated_at: {type: 'dateTime', nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
});
