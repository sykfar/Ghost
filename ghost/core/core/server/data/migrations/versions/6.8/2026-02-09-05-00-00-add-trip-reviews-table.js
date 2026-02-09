const {addTable} = require('../../utils');

module.exports = addTable('trip_reviews', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    trip_id: {type: 'string', maxlength: 24, nullable: false, references: 'trips.id', cascadeDelete: true, index: true},
    member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', index: true},
    rating: {type: 'integer', nullable: false, unsigned: true},
    comment: {type: 'text', maxlength: 65535, nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    '@@UNIQUE_CONSTRAINTS@@': [
        ['trip_id', 'member_id']
    ]
});
