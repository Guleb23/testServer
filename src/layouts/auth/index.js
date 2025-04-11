import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
//import routes from 'routes.js';
import { useAuthRoute } from 'routes';
// Chakra imports
import { Box, useColorModeValue } from '@chakra-ui/react';

// Layout components
import { SidebarContext } from 'contexts/SidebarContext';

// Custom Chakra theme
export default function Auth() {
  const routes = useAuthRoute();
  const location = useLocation(); // Хук для получения текущего пути
  const [toggleSidebar, setToggleSidebar] = useState(false);

  // Функция для проверки, является ли текущий путь маршрутом full-screen-maps
  const getRoute = () => {
    return location.pathname !== '/auth/full-screen-maps';
  };

  // Функция для рендеринга маршрутов
  const getRoutes = (routes) => {
    return routes.map((route, key) => {
      if (route.layout === '/auth') {
        return (
          <Route path={`${route.path}`} element={route.component} key={key} />
        );
      }
      if (route.collapse) {
        return getRoutes(route.items);
      } else {
        return null;
      }
    });
  };

  const authBg = useColorModeValue('white', 'navy.900');
  document.documentElement.dir = 'ltr';

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Box
          bg={authBg}
          float="right"
          minHeight="100vh"
          height="100%"
          position="relative"
          w="100%"
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          {getRoute() ? (
            <Box mx="auto" minH="100vh">
              <Routes>
                {getRoutes(routes)} {/* Здесь мы генерируем все маршруты */}
                <Route
                  path="/"
                  element={<Navigate to="/auth/sign-in/default" replace />}
                />
              </Routes>
            </Box>
          ) : null}
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
