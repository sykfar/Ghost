import {RouteObject, lazyComponent} from '@tryghost/admin-x-framework';

export const APP_ROUTE_PREFIX = '/';

export const routes: RouteObject[] = [
    {
        path: 'trips',
        children: [
            {
                index: true,
                lazy: lazyComponent(() => import('./views/TripList'))
            },
            {
                path: ':id',
                lazy: lazyComponent(() => import('./views/TripEditor'))
            }
        ]
    },
    {
        path: 'preferences',
        lazy: lazyComponent(() => import('./views/Preferences'))
    }
];
