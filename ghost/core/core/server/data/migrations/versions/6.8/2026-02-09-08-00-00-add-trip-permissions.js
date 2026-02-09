const {combineTransactionalMigrations} = require('../../utils/migrations');
const {addPermissionWithRoles} = require('../../utils/permissions');

const ADMIN_ROLES = ['Administrator', 'Admin Integration', 'Owner'];

const tripPermissions = [
    {name: 'Browse trips', action: 'browse', object: 'trip'},
    {name: 'Read trips', action: 'read', object: 'trip'},
    {name: 'Add trips', action: 'add', object: 'trip'},
    {name: 'Edit trips', action: 'edit', object: 'trip'},
    {name: 'Destroy trips', action: 'destroy', object: 'trip'},
    {name: 'Clone trips', action: 'clone', object: 'trip'},
    {name: 'Share trips', action: 'share', object: 'trip'}
];

const waypointPermissions = [
    {name: 'Browse waypoints', action: 'browse', object: 'waypoint'},
    {name: 'Read waypoints', action: 'read', object: 'waypoint'},
    {name: 'Add waypoints', action: 'add', object: 'waypoint'},
    {name: 'Edit waypoints', action: 'edit', object: 'waypoint'},
    {name: 'Destroy waypoints', action: 'destroy', object: 'waypoint'},
    {name: 'Reorder waypoints', action: 'reorder', object: 'waypoint'}
];

const routePermissions = [
    {name: 'Read trip routes', action: 'read', object: 'trip_route'},
    {name: 'Calculate trip routes', action: 'calculate', object: 'trip_route'},
    {name: 'Check trip route feasibility', action: 'feasibility', object: 'trip_route'}
];

const reviewPermissions = [
    {name: 'Browse trip reviews', action: 'browse', object: 'trip_review'},
    {name: 'Add trip reviews', action: 'add', object: 'trip_review'},
    {name: 'Edit trip reviews', action: 'edit', object: 'trip_review'},
    {name: 'Destroy trip reviews', action: 'destroy', object: 'trip_review'}
];

const photoPermissions = [
    {name: 'Browse trip photos', action: 'browse', object: 'trip_photo'},
    {name: 'Add trip photos', action: 'add', object: 'trip_photo'},
    {name: 'Destroy trip photos', action: 'destroy', object: 'trip_photo'}
];

const preferencePermissions = [
    {name: 'Read member preferences', action: 'read', object: 'member_preference'},
    {name: 'Edit member preferences', action: 'edit', object: 'member_preference'}
];

const allPermissions = [
    ...tripPermissions,
    ...waypointPermissions,
    ...routePermissions,
    ...reviewPermissions,
    ...photoPermissions,
    ...preferencePermissions
];

module.exports = combineTransactionalMigrations(
    ...allPermissions.map(config => addPermissionWithRoles(config, ADMIN_ROLES))
);
