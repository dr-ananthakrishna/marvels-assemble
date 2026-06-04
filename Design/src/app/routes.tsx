import { createBrowserRouter, Navigate } from 'react-router';
import Splash from './screens/Splash';
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import Register from './screens/Register';
import ApplicationSuccess from './screens/ApplicationSuccess';
import AppLayout from './components/AppLayout';
import Dashboard from './screens/Dashboard';
import Activities from './screens/Activities';
import Badges from './screens/Badges';
import Masterclasses from './screens/Masterclasses';
import Rewards from './screens/Rewards';
import Profile from './screens/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Splash,
  },
  {
    path: '/welcome',
    Component: Welcome,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/application-success',
    Component: ApplicationSuccess,
  },
  {
    path: '/dashboard',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
    ],
  },
  {
    path: '/activities',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Activities,
      },
    ],
  },
  {
    path: '/badges',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Badges,
      },
    ],
  },
  {
    path: '/masterclasses',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Masterclasses,
      },
    ],
  },
  {
    path: '/rewards',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Rewards,
      },
    ],
  },
  {
    path: '/ranks',
    element: <Navigate to="/badges" replace />,
  },
  {
    path: '/profile',
    Component: Profile,
  },
]);
