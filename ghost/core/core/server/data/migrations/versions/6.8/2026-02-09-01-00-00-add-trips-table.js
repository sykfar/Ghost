const {addTable} = require('../../utils');

module.exports = addTable('trips', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    member_id: {type: 'string', maxlength: 24, nullable: true, references: 'members.id', index: true},
    title: {type: 'string', maxlength: 191, nullable: false},
    description: {type: 'text', maxlength: 65535, nullable: true},
    city: {type: 'string', maxlength: 191, nullable: true},
    country: {type: 'string', maxlength: 191, nullable: true},
    start_date: {type: 'dateTime', nullable: true},
    end_date: {type: 'dateTime', nullable: true},
    travel_mode: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'foot', validations: {isIn: [['car', 'foot', 'bike', 'public_transport']]}},
    status: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'draft', validations: {isIn: [['draft', 'planned', 'in_progress', 'completed']]}},
    visibility: {type: 'string', maxlength: 50, nullable: false, defaultTo: 'private', validations: {isIn: [['private', 'shared', 'public']]}},
    share_token: {type: 'string', maxlength: 191, nullable: true, unique: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
});
