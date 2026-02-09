const {addTable} = require('../../utils');

module.exports = addTable('waypoints', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    trip_id: {type: 'string', maxlength: 24, nullable: false, references: 'trips.id', cascadeDelete: true, index: true},
    name: {type: 'string', maxlength: 191, nullable: false},
    description: {type: 'text', maxlength: 65535, nullable: true},
    latitude: {type: 'string', maxlength: 50, nullable: false},
    longitude: {type: 'string', maxlength: 50, nullable: false},
    address: {type: 'string', maxlength: 500, nullable: true},
    category: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'custom', validations: {isIn: [['sight', 'museum', 'restaurant', 'hotel', 'park', 'custom']]}},
    order_index: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0},
    duration_minutes: {type: 'integer', nullable: false, unsigned: true, defaultTo: 30},
    is_start_point: {type: 'boolean', nullable: false, defaultTo: false},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
});
