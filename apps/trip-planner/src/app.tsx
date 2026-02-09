import {APP_ROUTE_PREFIX, routes} from '@src/routes';
import {AppProvider, BaseAppProps, FrameworkProvider, Outlet, RouterProvider} from '@tryghost/admin-x-framework';
import {ShadeApp} from '@tryghost/shade';

const App: React.FC<BaseAppProps> = ({framework, designSystem}) => {
    return (
        <FrameworkProvider
            {...framework}
            queryClientOptions={{
                staleTime: 0,
                refetchOnMount: true,
                refetchOnWindowFocus: false
            }}
        >
            <AppProvider>
                <RouterProvider prefix={APP_ROUTE_PREFIX} routes={routes}>
                    <ShadeApp className="shade-trip-planner app-container" darkMode={designSystem.darkMode} fetchKoenigLexical={null}>
                        <Outlet />
                    </ShadeApp>
                </RouterProvider>
            </AppProvider>
        </FrameworkProvider>
    );
};

export default App;
