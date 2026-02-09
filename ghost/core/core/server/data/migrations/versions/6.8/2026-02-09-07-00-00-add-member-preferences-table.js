const {addTable} = require('../../utils');

module.exports = addTable('member_preferences', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    member_id: {type: 'string', maxlength: 24, nullable: false, references: 'members.id', unique: true},
    preferred_travel_mode: {type: 'string', maxlength: 50, nullable: true},
    preferred_categories: {type: 'text', maxlength: 65535, nullable: true},
    preferred_pace: {type: 'string', maxlength: 50, nullable: true, validations: {isIn: [['relaxed', 'moderate', 'intensive']]}},
    home_city: {type: 'string', maxlength: 191, nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
});
