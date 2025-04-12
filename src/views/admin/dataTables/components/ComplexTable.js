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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Input,
  Select,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { FaShoppingCart, FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import axios from '../../../../api/axios';

const columnHelper = createColumnHelper();

export default function OrdersTable({ tableData, onAllUpdate }) {

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState();
  const [sorting, setSorting] = useState([]);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgInput = useColorModeValue('gray.100', 'whiteAlpha.100');
  const bgReadonly = useColorModeValue('gray.50', 'whiteAlpha.100');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const {
    isOpen: isClientOpen, onOpen: onClientOpen, onClose: onClientClose,
  } = useDisclosure();

  const {
    isOpen: isOrderOpen, onOpen: onOrderOpen, onClose: onOrderClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose,
  } = useDisclosure();
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get('/dashboard/categories');
        setCategories(response.data); // Присваиваем полученные продукты
        console.log(response.data);

      } catch (error) {
        console.error('Ошибка при получении данных продуктов:', error);
      }
    }
    async function fetchData() {
      try {
        const response = await axios.get('/dashboard/all-products');
        setProductsData(response.data); // Присваиваем полученные продуктыA
        console.log(response.data);

      } catch (error) {
        console.error('Ошибка при получении данных продуктов:', error);
      }
    }
    fetchData();
    fetchCategories();
  }, []);
  useEffect(() => {
    if (tableData.length) setData(tableData);
  }, [tableData]);

  const columns = [
    columnHelper.accessor('id', {
      header: () => <Text fontSize="sm" color="gray.400">Номер</Text>,
      cell: (info) => <Text fontSize="md" >{info.getValue()}</Text>,
    }),
    columnHelper.accessor('client', {
      header: () => <Text fontSize="sm" color="gray.400">Клиент</Text>,
      cell: ({ getValue }) => (
        <Button variant="link" size="md" color={textColor} onClick={() => handleClientClick(getValue())}>
          {getValue()}
        </Button>
      ),
    }),
    columnHelper.accessor('cost', {
      header: () => <Text fontSize="sm" color="gray.400">Сумма</Text>,
      // Добавляем кастомную функцию сортировки:
      sortingFn: (rowA, rowB, columnId) => {
        // Получаем значения из строк
        const aValue = rowA.getValue(columnId);
        const bValue = rowB.getValue(columnId);
        // Если значение представлено строкой с символами валюты – убираем их:
        const parseValue = (val) => {
          const numeric = typeof val === 'string'
            ? parseFloat(val.replace(/[^\d.-]/g, ''))
            : val;
          return numeric;
        };
        const aNum = parseValue(aValue);
        const bNum = parseValue(bValue);
        // Сравниваем как числа:
        return aNum > bNum ? 1 : aNum < bNum ? -1 : 0;
      },
      cell: (info) => {
        const value = info.getValue();
        const numeric = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
        const formatter = new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          maximumFractionDigits: 0,
        });
        return <Text fontSize="md">{formatter.format(numeric)}</Text>;
      },
    }),
    columnHelper.accessor('date', {
      header: () => <Text fontSize="sm" color="gray.400">Дата</Text>,
      cell: (info) => <Text fontSize="md">{info.getValue()}</Text>,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleClientClick = async (name) => {
    try {
      const { data } = await axios.get(`/dashboard/client-details/${encodeURIComponent(name)}`);
      setSelectedClient(data);
      onClientOpen();
    } catch (e) {
      console.error('Ошибка загрузки клиента:', e);
    }
  };

  const handleOrderClick = async (order) => {
    try {
      const { data } = await axios.get(`/dashboard/order-details/${order.orderId}`);
      setSelectedOrder(data);
      onOrderOpen();
    } catch (e) {
      console.error('Ошибка загрузки заказа:', e);
    }
  };
  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      originalName: product.name, // сохраняем оригинальное имя
    });
    onEditOpen();
  };

  const handleSaveEditedProduct = async () => {
    try {
      // Создаем новый объект товара на основе редактируемого
      const updatedProduct = {
        ...editingProduct,
        productName: editingProduct.name,  // Модификация с учетом нового продукта
      };

      // Отправляем обновленные данные товара на сервер
      await axios.put(
        `/dashboard/order/${selectedOrder.orderId}/product/${encodeURIComponent(editingProduct.originalName)}`,
        updatedProduct
      );
      onAllUpdate();
      // Обновляем товар в заказе
      setSelectedOrder((prev) => ({
        ...prev,
        products: prev.products.map((product) =>
          product.name === editingProduct.originalName ? updatedProduct : product
        ),
      }));

      // Закрываем модальное окно
      onEditClose();
    } catch (e) {
      console.error('Ошибка сохранения товара:', e);
    }
  };
  const handleCloseEdit = () => {
    onEditClose();
    onAllUpdate();
    setEditingProduct(null); // очищаем состояние
  };
  const handleDeleteProduct = async (productName) => {
    if (!window.confirm('Удалить товар?')) return;

    try {
      await axios.delete(
        `/dashboard/order/${selectedOrder.orderId}/product/${encodeURIComponent(editingProduct.originalName)}`
      );

      // Загрузить обновлённый заказ
      const { data } = await axios.get(`/dashboard/order-details/${selectedOrder.orderId}`);
      setSelectedOrder(data);
      onAllUpdate();
      handleCloseEdit(); // Закрыть модалку
    } catch (e) {
      console.error('Ошибка удаления товара:', e);
    }
  };
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Удалить заказ?')) return;

    try {
      await axios.delete(`/dashboard/order/${orderId}`);
      onAllUpdate();
      setSelectedClient((prev) => ({
        ...prev,
        orders: prev.orders.filter((order) => order.orderId !== orderId),
      }));

      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
        onOrderClose();
      }
    } catch (e) {
      console.error('Ошибка удаления:', e);
    }
  };

  return (
    <>
      <Card w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" justify="space-between" align="center">
          <Text fontSize="22px" fontWeight="700" color={textColor}>Последние продажи</Text>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px" fontFamily="'Montserrat', sans-serif">
            <Thead>
              {table.getHeaderGroups().map(headerGroup => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Th
                      fontSize={{ sm: '10px', lg: '12px' }}
                      color="gray.400"
                      key={header.id}
                      borderColor={borderColor}
                      onClick={header.column.getToggleSortingHandler()}
                      cursor="pointer"
                    >
                      <Flex justify="space-between" align="center" fontSize="sm" color="gray.400" gap={2}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <AiOutlineArrowUp />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <AiOutlineArrowDown />
                        ) : null}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map(row => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <Td
                      key={cell.id}
                      borderColor="transparent"
                      fontSize="xl"
                      fontWeight="bold"
                      color={textColor}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>

                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Модалка клиента */}
      <Modal isOpen={isClientOpen} onClose={onClientClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Информация о клиенте</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedClient ? (
              <>
                <Text fontSize="xl" fontWeight="bold">{selectedClient.fullName}</Text>
                <Text>{selectedClient.phone}</Text>
                <Text>{selectedClient.address}</Text>
                <Text>Кэшбэк: {selectedClient.cashback}₽</Text>

                {selectedClient.orders.map((order) => (
                  <Box key={order.orderId} mt={4} p={3} borderWidth="1px" borderRadius="md">
                    <Flex justify="space-between">
                      <Box>
                        <Text>Заказ #{order.orderId}</Text>
                        <Text>{order.date}</Text>
                        <Text>Итог: {order.finalTotalPrice}₽</Text>
                      </Box>
                      <Flex direction="column" gap={2}>
                        <Button size="sm" onClick={() => handleOrderClick(order)} leftIcon={<FaShoppingCart />}>Товары</Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleDeleteOrder(order.orderId)} leftIcon={<MdDeleteForever />}>
                          Удалить
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                ))}
              </>
            ) : <Text>Нет данных</Text>}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Модалка заказа */}
      <Modal isOpen={isOrderOpen} onClose={onOrderClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Товары в заказе #{selectedOrder?.orderId}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder?.products?.length > 0 ? (
              selectedOrder.products.map((product, idx) => (
                <Box key={idx} mb={3} p={3} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="bold">{product.name}</Text>
                  <Text>Категория: {product.category}</Text>
                  <Text>Цена: {product.price}₽</Text>
                  <Text>Количество: {product.quantity}</Text>
                  <Button size="sm" mt={2} onClick={() => handleEditProduct(product)} leftIcon={<FaEdit />}>Редактировать</Button>
                </Box>
              ))
            ) : <Text>Нет товаров</Text>}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontWeight="bold" fontSize="lg">
            Редактировать товар
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            {editingProduct && (
              <Box
                as="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEditedProduct();
                }}
              >
                {/* Категория */}
                <Text mb={1} fontWeight="medium" color={textColor}>
                  Категория
                </Text>
                <Select
                  mb={4}
                  bg={bgInput}
                  value={editingProduct.category}
                  onChange={(e) => {
                    const selectedCategory = e.target.value;
                    setEditingProduct((prev) => ({
                      ...prev,
                      category: selectedCategory,
                      name: '',
                      price: '',
                    }));
                  }}
                >
                  {categories?.map((category) => (
                    <option key={category.id} value={category.categoryName}>
                      {category.categoryName}
                    </option>
                  ))}
                </Select>

                {/* Название товара */}
                <Text mb={1} fontWeight="medium" color={textColor}>
                  Товар
                </Text>
                <Select
                  mb={4}
                  bg={bgInput}
                  value={editingProduct.name}
                  onChange={(e) => {
                    const selectedProduct = productsData
                      .filter((p) => p.category === editingProduct.category)
                      .find((p) => p.name === e.target.value);

                    if (selectedProduct) {
                      setEditingProduct((prev) => ({
                        ...prev,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                      }));
                    }
                  }}
                >
                  <option value="" disabled>
                    -- Выберите товар --
                  </option>
                  {productsData
                    .filter((p) => p.category === editingProduct.category)
                    .map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name} — {product.price}₽
                      </option>
                    ))}
                </Select>

                {/* Цена (только чтение) */}
                <Text mb={1} fontWeight="medium" color={textColor}>
                  Цена
                </Text>
                <Input
                  mb={4}
                  isReadOnly
                  bg={bgReadonly}
                  value={`${editingProduct.price}₽`}
                  color={textColor}
                  fontWeight="semibold"
                />

                {/* Количество */}
                <Text mb={1} fontWeight="medium" color={textColor}>
                  Количество
                </Text>
                <Input
                  type="number"
                  mb={6}
                  bg={bgInput}
                  value={editingProduct.quantity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      quantity: +e.target.value,
                    })
                  }
                />

                {/* Кнопки */}
                <Button type="submit" colorScheme="blue" w="100%">
                  Сохранить
                </Button>
                <Button
                  mt={3}
                  w="100%"
                  colorScheme="red"
                  onClick={() => handleDeleteProduct(editingProduct.name)}
                  leftIcon={<MdDeleteForever />}
                >
                  Удалить товар
                </Button>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
}
