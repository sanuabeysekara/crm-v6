import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// login option 3 routing
const AddLead = Loadable(lazy(() => import('views/pages/leads/leadForm')));
// const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const LeadRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/pages/leads/addLead',
            element: <AddLead />
        }
    ]
};

export default LeadRoutes;
