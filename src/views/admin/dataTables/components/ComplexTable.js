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
  Icon,
} from '@chakra-ui/react';
import * as React from 'react';
import { FaPhone, FaAddressCard, FaMoneyBillAlt, FaShoppingCart } from 'react-icons/fa';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import axios from "../../../../api/axios";

const columnHelper = createColumnHelper();

export default function ColumnTable(props) {
  const { tableData } = props;
  const [sorting, setSorting] = React.useState([]);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const [selectedClient, setSelectedClient] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null); // Добавим состояние для выбранного заказа
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOrderOpen, onOpen: onOrderOpen, onClose: onOrderClose } = useDisclosure();

  const handleClientClick = async (clientName) => {
    // Проверяем, что clientName это строка
    if (clientName && typeof clientName === 'string') {
      try {
        // Выполняем запрос с именем клиента в URL
        const response = await axios.get(`/dashboard/client-details/${encodeURIComponent(clientName)}`);
        console.log(response.data);

        setSelectedClient(response.data); // Сохраняем данные клиента
        onOpen(); // Открываем модальное окно
      } catch (error) {
        console.error('Ошибка при загрузке данных клиента:', error);
      }
    } else {
      console.warn('Некорректное имя клиента:', clientName);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order); // Сохраняем выбранный заказ
    onOrderOpen(); // Открываем модальное окно с товарами
  };

  const columns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Номер</Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>
      ),
    }),
    columnHelper.accessor('client', {
      id: 'client',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Клиент</Text>
      ),
      cell: (info) => {
        const clientData = info.getValue(); // строка или объект
        return (
          <Button
            size="sm"
            variant="link"
            colorScheme="blue"
            onClick={() => handleClientClick(clientData)} // Передаем строку с именем клиента
          >
            {clientData}
          </Button>
        );
      },
    }),
    columnHelper.accessor('cost', {
      id: 'cost',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Сумма</Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>
      ),
    }),
    columnHelper.accessor('date', {
      id: 'date',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Дата</Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>
      ),
    }),
  ];

  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    if (tableData.length > 0) {
      setData(tableData);
    }
  }, [tableData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            mb="4px"
            fontWeight="700"
            lineHeight="100%"
          >
            Последние продажи
          </Text>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex
                        justifyContent="space-between"
                        align="center"
                        fontSize={{ sm: '10px', lg: '12px' }}
                        color="gray.400"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽') : ''}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.slice(0, 11).map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      fontSize={{ sm: '14px' }}
                      minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                      borderColor="transparent"
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

      {/* Модальное окно для данных клиента */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Информация о клиенте</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedClient ? (
              <Box>
                <Flex direction="column" mb="4">
                  <Text fontSize="xl" fontWeight="bold">{selectedClient.fullName}</Text>
                  <Text fontSize="md" color="gray.500">{selectedClient.phone}</Text>
                  <Text fontSize="md" color="gray.500">{selectedClient.address}</Text>
                  <Text fontSize="md" color="gray.500">Кэшбэк: {selectedClient.cashback}₽</Text>
                </Flex>

                <Box mb="4">
                  <Text fontSize="lg" fontWeight="bold" mb="2">Заказы</Text>
                  {selectedClient.orders.map((order) => (
                    <Box key={order.orderId} mb="4" p="4" borderWidth="1px" borderRadius="lg" boxShadow="sm">
                      <Flex justify="space-between" mb="2">
                        <Text fontWeight="bold">Заказ #{order.orderId}</Text>
                        <Text fontWeight="medium" color="gray.500">{order.date}</Text>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Flex direction="column">
                          <Text>Сумма: {order.totalPriceWithoutDiscount}₽</Text>
                          <Text>Скидка: {order.discountAmount}₽ ({order.discountPercent}%)</Text>
                          <Text>Используемый кешбек: {order.cashbackUsed}₽</Text>
                          <Text>Итоговая сумма: {order.finalTotalPrice}₽</Text>
                          <Text>Получено кешбека: {order.cashbackEarned}₽</Text>
                        </Flex>

                        <Button leftIcon={<FaShoppingCart />} variant="outline" size="sm" onClick={() => handleOrderClick(order)}>
                          Смотреть товары
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Text>Нет данных</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Модальное окно для товаров в заказе */}
      <Modal isOpen={isOrderOpen} onClose={onOrderClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Товары в заказе</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder ? (
              <Box>
                <Text fontSize="lg" fontWeight="bold">Заказ #{selectedOrder.orderId}</Text>
                {selectedOrder.products.length > 0 ? (
                  <Box>
                    {selectedOrder.products.map((product, index) => (
                      <Box key={index} mb="4" p="4" borderWidth="1px" borderRadius="lg" boxShadow="sm">
                        <Text fontWeight="bold">{product.name}</Text>
                        <Text>Категория: {product.category}</Text>
                        <Text>Цена: {product.price}₽</Text>
                        <Text>Количество: {product.quantity}</Text>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text>В этом заказе нет товаров.</Text>
                )}
              </Box>
            ) : (
              <Text>Нет данных о заказе.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
