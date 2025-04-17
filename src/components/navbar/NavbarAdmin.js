import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex, Link, Text, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import AdminNavbarLinks from 'components/navbar/NavbarLinksAdmin';

const pageNames = {
  'dashboard': { name: 'Главная', path: '/' },
  'data-tables': { name: 'Таблицы', path: '/admin/data-tables' }, // Добавляем путь для data-tables
  'profile': { name: 'Профиль', path: '/admin/profile' }
};

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [brandText, setBrandText] = useState({ name: 'Главная', path: '/' });

  useEffect(() => {
    window.addEventListener('scroll', changeNavbar);
    updateBreadcrumb();
    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  }, [location.pathname]);

  const changeNavbar = () => {
    setScrolled(window.scrollY > 1);
  };

  const updateBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard';
    // Проверяем, если в pageNames есть ключ для этого пути, если нет, то оставляем "Главная"
    setBrandText(pageNames[lastSegment] || { name: 'Главная', path: '/' });
  };

  let mainText = useColorModeValue('navy.700', 'white');
  let secondaryText = useColorModeValue('gray.700', 'white');
  let navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)');

  return (
    <Box
      position="fixed"
      boxShadow="none"
      bg={navbarBg}
      backdropFilter="blur(20px)"
      borderRadius="16px"
      minH="75px"
      px={{ sm: '15px', md: '10px' }}
      pt="8px"
      w={{ base: 'calc(100vw - 6%)', md: 'calc(100vw - 8%)', xl: 'calc(100vw - 350px)' }}
      top={{ base: '12px', md: '16px', xl: '20px' }}
      right={{ base: '12px', md: '30px', xl: '30px' }}
    >
      <Flex w="100%" flexDirection={{ sm: 'column', md: 'row' }} alignItems={{ xl: 'center' }}>
        <Box>
          <Breadcrumb>
            <BreadcrumbItem color={secondaryText} fontSize="sm">
              <BreadcrumbLink as={RouterLink} to={brandText.path} color={secondaryText}>
                {brandText.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Link as={RouterLink} to={brandText.path} color={mainText} fontWeight="bold" fontSize="34px">
            {brandText.name}
          </Link>
        </Box>
        <Box ms="auto">
          <AdminNavbarLinks {...props} scrolled={scrolled} />
        </Box>
      </Flex>
    </Box>
  );
}

AdminNavbar.propTypes = {
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func
};
