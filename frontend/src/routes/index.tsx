import { createBrowserRouter } from 'react-router-dom';

import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ClientLayout from '@/layouts/ClientLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/dashboard/Dashboard';
import CourtTypes from '@/pages/court-types/CourtTypes';
import Courts from '@/pages/courts/Courts';
import Schedules from '@/pages/schedules/Schedules';
import AdminReservations from '@/pages/admin-reservations/Reservations';
import ReservationsHistory from '@/pages/admin-reservations/ReservationsHistory';
import Payments from '@/pages/payments/Payments';
import Landing from '@/pages/landing/Landing';
import ReservationWizard from '@/pages/reservations/ReservationWizard';
import MyReservations from '@/pages/reservations/MyReservations';
import Users from '@/pages/users/Users';
import ProtectedRoute from '@/routes/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'users',
            element: <Users />,
          },
          {
            path: 'court-types',
            element: <CourtTypes />,
          },
          {
            path: 'courts',
            element: <Courts />,
          },
          {
            path: 'schedules',
            element: <Schedules />,
          },
          {
            path: 'reservations',
            children: [
              {
                index: true,
                element: <AdminReservations />,
              },
              {
                path: 'history',
                element: <ReservationsHistory />,
              },
            ],
          },
          {
            path: 'payments',
            element: <Payments />,
          },
          {
            path: '*',
            element: null,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['CLIENTE']} />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          {
            path: '/reservar',
            element: <ReservationWizard />,
          },
          {
            path: '/mis-reservas',
            element: <MyReservations />,
          },
        ],
      },
    ],
  },
]);
