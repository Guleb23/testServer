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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
const columnHelper = createColumnHelper();

export default function ColumnTable({ productsData, clientsData, categories, onDeleteProduct, onEditProduct, onDeleteClient, onEditClient }) {
  const inputBg = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white"); // Цвет текста в input
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [clientFormData, setClientFormData] = React.useState({
    id: '',
    fullName: '',
    phone: '',
    address: '',
    cashback: '',
  });

  const clientColumns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => info.getValue(),
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          ID
        </Text>
      ),
    }),
    columnHelper.accessor('fullName', { header: 'ФИО' }),
    columnHelper.accessor('phone', { header: 'Телефон' }),
    columnHelper.accessor('address', { header: 'Адрес' }),
    columnHelper.accessor('cashback', {
      header: 'Кэшбэк',
      cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <Flex justifyContent="space-between" align="center">
          <Button size="sm" onClick={() => handleEditClient(row.original)}>
            <FaEdit />
          </Button>
          <Button size="sm" colorScheme="red" onClick={() => handleDeleteClient(row.original.id)}>
            <MdDelete />
          </Button>
        </Flex>
      ),
    }),
  ];
  const productColumns = [
    columnHelper.accessor('id', { header: 'ID' }),
    columnHelper.accessor('name', { header: 'Название' }),
    columnHelper.accessor('category', {
      header: 'Категория',
      cell: ({ row }) => row.original.category?.name || row.original.category, // На случай, если category — это строка
    }),
    columnHelper.accessor('weight', { header: 'Вес' }),
    columnHelper.accessor('price', { header: 'Стоимость' }),
    columnHelper.display({
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <Flex justifyContent="space-between" align="center">
          <Button size="sm" onClick={() => handleEditProduct(row.original)}><FaEdit /></Button>
          <Button size="sm" colorScheme="red" onClick={() => onDeleteProduct(row.original.id)}><MdDelete /></Button>
        </Flex>
      ),
    }),
  ];
  const [tableType, setTableType] = React.useState('products');
  const [page, setPage] = React.useState(0);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [productFormData, setProductFormData] = React.useState({
    id: '',
    name: '',
    category: '',
    weight: '',
    price: '',
  });

  const columns = tableType === 'products' ? productColumns : clientColumns;
  const data = tableType === 'products' ? productsData : clientsData;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);



  // Функция для редактирования
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductFormData({
      id: product.id,
      name: product.name,
      category: categories.find(cat => cat.name === product.category),
      weight: product.weight,
      price: product.price,
    });
    setIsModalOpen(true);
  };


  // Функция для сохранения изменений
  const handleSaveProduct = () => {
    const updatedProduct = {
      ...productFormData,
      category:
        typeof productFormData.category === 'object'
          ? productFormData.category.id
          : productFormData.category,
    };

    console.log(updatedProduct);
    onEditProduct(updatedProduct);
    setIsModalOpen(false);
  };
  // Отмена редактирования
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedClient(null);
    setProductFormData({ id: '', name: '', category: '', weight: '', price: '' });
    setClientFormData({ id: '', fullName: '', phone: '', address: '', cashback: '' });
  };
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setClientFormData({
      id: client.id,
      fullName: client.fullName,
      phone: client.phone,
      address: client.address,
      cashback: client.cashback,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('Удалить клиента?')) {
      onDeleteClient(id);
    }
  };

  const handleSaveClient = () => {
    onEditClient(clientFormData);
    setIsModalOpen(false);
  };
  return (
    <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize={{ sm: '16px', lg: '22px' }} fontWeight="700" mb="4px" lineHeight="100%">
          {tableType === 'products' ? 'Товары' : 'Клиенты'}
        </Text>
        <Menu
          options={[
            { label: 'Товары', action: () => setTableType('products') },
            { label: 'Клиенты', action: () => setTableType('clients') },
          ]}
        />
      </Flex>

      <Box maxHeight="600px" overflowY="auto">
        <Table variant="simple" color="gray.500" mb="16px" fontFamily="'Montserrat', sans-serif">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} colSpan={header.colSpan} pe="10px" borderColor={borderColor} cursor="pointer">
                    <Flex justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '14px' }} color="gray.400">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>

          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td fontSize="md"
                    fontWeight="700"
                    color={textColor}
                    minW="20px"
                    borderColor="transparent" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Модальное окно для редактирования продукта */}
      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProduct ? 'Редактировать продукт' : selectedClient ? 'Редактировать клиента' : ''}
          </ModalHeader>
          <ModalBody>
            {selectedProduct && (
              <>
                <FormControl>
                  <FormLabel>Название</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    value={productFormData.category?.id}  // Используем id категории
                    onChange={(e) => {
                      const selectedCategory = categories.find(
                        (category) => category.id === parseInt(e.target.value)
                      );
                      setProductFormData({
                        ...productFormData,
                        category: selectedCategory.id,  // Обновляем выбранную категорию
                      });
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}  {/* Отображаем название категории */}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Вес</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={productFormData.weight}
                    onChange={(e) => setProductFormData({ ...productFormData, weight: e.target.value })}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Цена</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                  />
                </FormControl>
              </>
            )}

            {selectedClient && (
              <>
                <FormControl>
                  <FormLabel>ФИО</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={clientFormData.fullName}
                    onChange={(e) => setClientFormData({ ...clientFormData, fullName: e.target.value })}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Телефон</FormLabel>
                  <Input

                    bg={inputBg}
                    color={inputTextColor}
                    value={clientFormData.phone}
                    onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Адрес</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Кэшбэк</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={clientFormData.cashback}
                    onChange={(e) => setClientFormData({ ...clientFormData, cashback: e.target.value })}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleCancel}>
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedProduct ? handleSaveProduct : handleSaveClient}
            >
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
