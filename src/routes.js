import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUp from 'views/auth/signIn/signup/SignUp';
import { useAuth } from 'contexts/AuthContext';

export const useAuthRoute = () => {
  const { user } = useAuth();

  // Возвращаем маршруты в зависимости от того, авторизован ли пользователь
  const routes = user
    ? [
      {
        name: 'Главная',
        layout: '/admin',
        path: '/default',
        component: <MainDashboard />,
      },
      {
        name: 'Таблицы',
        layout: '/admin',
        path: '/data-tables',
        component: <DataTables />,
      },
      {
        name: 'Профиль',
        layout: '/admin',
        path: '/profile',
        component: <Profile />,
      },
    ]
    : [
      {
        name: 'Sign In',
        layout: '/auth',
        path: '/sign-in',
        component: <SignInCentered />,
      },
      {
        name: 'Sign Up',
        layout: '/auth',
        path: '/sign-up',
        component: <SignUp />,
      },
    ];

  return routes;
};