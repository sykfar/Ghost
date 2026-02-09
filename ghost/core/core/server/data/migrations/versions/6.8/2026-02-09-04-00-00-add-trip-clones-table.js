const {addTable} = require('../../utils');

module.exports = addTable('trip_clones', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    original_trip_id: {type: 'string', maxlength: 24, nullable: false, references: 'trips.id', index: true},
    cloned_trip_id: {type: 'string', maxlength: 24, nullable: false, references: 'trips.id', index: true},
    member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', index: true},
    created_at: {type: 'dateTime', nullable: false}
});
