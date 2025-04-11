/* eslint-disable */
import {
  Flex,
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { HamburgerIcon } from '@chakra-ui/icons';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

// Custom components
import Card from 'components/card/Card';

const columnHelper = createColumnHelper();

export default function CheckTable({ topProductsData, topClientsData }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [showTopProducts, setShowTopProducts] = useState(true);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    setProducts(topProductsData.slice(0, 10)); // Берем только топ-10
    setClients(topClientsData.slice(0, 10));
  }, [topProductsData, topClientsData]);

  const productColumns = [
    columnHelper.accessor('id', {
      header: () => <Text color="gray.400">Номер</Text>,
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('name', {
      header: () => <Text color="gray.400">Название</Text>,
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('sales', {
      header: () => <Text color="gray.400">Кол-во продаж</Text>,
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
  ];
  

  const clientColumns = [
    columnHelper.accessor('id', {
      header: () => <Text color="gray.400">Номер</Text>,
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('name', {
      header: () => <Text color="gray.400">Имя</Text>,
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('purchaseAmount', {
      header: () => <Text color="gray.400">Сумма покупок</Text>,
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
  ];
  

  const table = useReactTable({
    data: showTopProducts ? products : clients,
    columns: showTopProducts ? productColumns : clientColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
          Топ 10
        </Text>
        <Menu>
          <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="ghost" />
          <MenuList minW="150px">
            <MenuItem onClick={() => setShowTopProducts(true)}>Топ Товаров</MenuItem>
            <MenuItem onClick={() => setShowTopProducts(false)}>Топ Клиентов</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Box>
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} borderColor={borderColor} fontSize="12px">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id} borderColor="transparent">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}
