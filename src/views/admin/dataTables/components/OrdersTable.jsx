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
    SimpleGrid,
    Divider,
    ModalFooter,
    NumberInput,
    NumberInputField,
    Checkbox,
    TableContainer,
    FormLabel,
    FormControl,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MdPerson, MdPhone, MdCalendarToday, MdLocalShipping, MdCardGiftcard, MdCreditCard, MdEdit, MdPriceCheck, MdAdd, MdCheck, MdCancel } from 'react-icons/md';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { renderTrack, renderThumb, renderView } from "../../../../components/scrollbar/Scrollbar"
import { FaShoppingCart, FaEdit, FaFilter } from 'react-icons/fa';
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
import { useAuth } from 'contexts/AuthContext';
import { AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import CreateOrderModal from '../Modals/CreateOrderModal';
import { IoMdPricetag } from 'react-icons/io';
import DeleteOrderDialog from '../Modals/DeleteOrderDialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RiFileExcel2Line } from 'react-icons/ri';
const columnHelper = createColumnHelper();

export default function AllOrdersTable({ tableData, onAllUpdate }) {
    const {
        isOpen: isDeleteOrderOpen,
        onOpen: onDeleteOrderOpen,
        onClose: onDeleteOrderClose
    } = useDisclosure();
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ productId: "", quantity: 1 });
    const { user } = useAuth()
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
    const [allProductData, setAllProductData] = useState([]);
    const [clientsData, setClientsData] = useState([]);
    const { isOpen: isOpenCreateOrder, onOpen: onOpenCreateOrder, onClose: onCloseCreateOrder } = useDisclosure();
    const {
        isOpen: isClientOpen, onOpen: onClientOpen, onClose: onClientClose,
    } = useDisclosure();
    const openAddProductModal = () => setIsAddProductOpen(true);
    const closeAddProductModal = () => {
        setNewProduct({ productId: "", quantity: 1 });
        setIsAddProductOpen(false);
    };
    const { isOpen: isFilterOpen, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclosure();
    const [filterValues, setFilterValues] = React.useState({
        minSum: '',
        maxSum: '',
        startDate: '',
        endDate: '',
        paymentStatus: '',
    });

    const columns = [
        {
            header: () => <Text fontSize="sm" color="gray.400">Номер</Text>,
            id: 'rowNumber',
            cell: (info) => <Text fontSize="md">{info.row.index + 1}</Text>,
        },
        columnHelper.accessor('client', {
            header: () => <Text fontSize="sm" color="gray.400">Клиент</Text>,
            cell: ({ getValue }) => (
                <Text fontSize="md" color={textColor}>
                    {getValue()}
                </Text>
            ),
        }),
        columnHelper.accessor('cost', {
            header: () => <Text fontSize="sm" color="gray.400">Сумма</Text>,
            sortingFn: (rowA, rowB, columnId) => {
                const aValue = rowA.getValue(columnId);
                const bValue = rowB.getValue(columnId);
                const parseValue = (val) => {
                    const numeric = typeof val === 'string'
                        ? parseFloat(val.replace(/[^\d.-]/g, ''))
                        : val;
                    return numeric;
                };
                const aNum = parseValue(aValue);
                const bNum = parseValue(bValue);
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
        {
            header: () => <Text fontSize="sm" color="gray.400" textAlign="center">Оплата</Text>,
            accessorKey: 'status', // или 'isPaid'
            cell: ({ row, getValue }) => (
                <Flex justify="center" align="center" h="100%">
                    <Button
                        colorScheme={getValue() ? 'green' : 'red'} // меняем цвет в зависимости от статуса
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation(); // предотвращаем всплытие события
                            const newStatus = !getValue(); // инвертируем статус

                            // обновляем статус на сервере
                            updatePaymentStatus(row.original.id || row.original.orderId, newStatus);
                        }}
                    >
                        {getValue() ? <MdCheck /> : <MdCancel />} {/* Текст на кнопке */}
                    </Button>
                </Flex>
            ),
        },
        {
            header: () => <Text fontSize="sm" color="gray.400">Действия</Text>,
            id: 'actions',
            cell: (info) => (
                <Flex justify="center" align="center" h="100%">
                    <Button
                        size="md"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(info.row.original.id || info.row.original.orderId);
                        }}
                    >
                        <MdDeleteForever color="purple.500" />
                    </Button>
                </Flex>
            ),
        }
    ];
    const parseDate = (str) => {
        const [day, month, year] = str.split('.');
        return new Date(`${year}-${month}-${day}`);
    };
    const filteredData = React.useMemo(() => {
        return data.filter(row => {
            const sum = parseFloat(row.cost?.toString().replace(/[^\d.-]/g, '')) || 0;

            const {
                minSum, maxSum, startDate, endDate, paymentStatus
            } = filterValues;

            const rowDate = typeof row.date === 'string' && row.date.includes('.')
                ? parseDate(row.date)
                : new Date(row.date); // Поддержка ISO-формата

            if (minSum && sum < parseFloat(minSum)) return false;
            if (maxSum && sum > parseFloat(maxSum)) return false;
            if (startDate && rowDate < new Date(startDate)) return false;
            if (endDate && rowDate > new Date(endDate)) return false;

            if (paymentStatus === 'paid' && !row.status) return false;
            if (paymentStatus === 'unpaid' && row.status) return false;

            return true;
        });
    }, [data, filterValues]);


    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
    const exportToExcelProduct = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(file, 'filtered-orders.xlsx');
    };
    const updatePaymentStatus = async (orderId, newStatus) => {
        try {
            // Отправляем запрос на сервер для обновления статуса
            await axios.put(`/dashboard/order/${orderId}/status`, {
                status: newStatus,
            });

            // После успешного запроса обновляем статус на сервере,
            // теперь обновляем локальные данные таблицы
            const updatedData = data.map(row =>
                row.id === orderId ? { ...row, status: newStatus } : row
            );

            setData(updatedData); // обновляем состояние таблицы

        } catch (e) {
            console.error('Ошибка обновления статуса:', e);
        }
    };





    const {
        isOpen: isOrderOpen, onOpen: onOrderOpen, onClose: onOrderClose,
    } = useDisclosure();

    const {
        isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose,
    } = useDisclosure();
    const [productsData, setProductsData] = useState([]);
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredProducts([]);
            return;
        }

        const filtered = allProductData.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredProducts(filtered);
    }, [searchTerm, allProductData]);
    useEffect(() => {
        const fetchForCreate = async () => {
            try {
                const [
                    productRes,
                    clientsRes,
                ] = await Promise.all([
                    axios.get("/dashboard/all-products"),
                    axios.get(`/dashboard/all-clients/${user.id}`)
                ]);
                setAllProductData(productRes.data);
                setClientsData(clientsRes.data);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
        };
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
        fetchForCreate();
    }, []);
    useEffect(() => {
        if (tableData.length) setData(tableData);
    }, [tableData]);

    const handleAddProductToOrder = async () => {
        if (!newProduct.productId || newProduct.quantity <= 0) {
            alert("Выберите товар и укажите количество");
            return;
        }

        try {
            await axios.post(`/dashboard/order/${selectedOrder.orderId}/product`, {
                productId: newProduct.productId,
                quantity: newProduct.quantity
            });

            // обновляем заказ
            const { data: updatedOrder } = await axios.get(
                `/dashboard/orderdetails/${user.id}/${selectedOrder.orderId}`
            );
            setSelectedOrder(updatedOrder);
            onAllUpdate();
            closeAddProductModal();
        } catch (e) {
            console.error("Ошибка при добавлении товара:", e);
        }
    };

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


            const { data } = await axios.get(`/dashboard/orderdetails/${user.id}/${order.id || order.orderId}`);
            onClientClose();
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
            const updatedProduct = {
                ...editingProduct,
                productName: editingProduct.name,
            };

            // 1. Отправляем изменения на сервер
            await axios.put(
                `/dashboard/order/${selectedOrder.orderId}/product/${encodeURIComponent(editingProduct.originalName)}`,
                updatedProduct
            );

            // 2. Запрашиваем обновленные данные заказа с сервера
            const { data: updatedOrder } = await axios.get(
                `/dashboard/orderdetails/${user.id}/${selectedOrder.orderId}`
            );

            // 3. Обновляем состояние
            setSelectedOrder(updatedOrder);
            onAllUpdate(); // Обновляем главную таблицу
            onEditClose(); // Закрываем модальное окно редактирования

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
            // 1. Удаляем товар на сервере
            await axios.delete(
                `/dashboard/order/${user.id}/${selectedOrder.orderId}/product/${encodeURIComponent(productName)}`
            );

            // 2. Запрашиваем обновленные данные заказа
            const { data: updatedOrder } = await axios.get(
                `/dashboard/orderdetails/${user.id}/${selectedOrder.orderId}`
            );

            // 3. Обновляем состояние
            setSelectedOrder(updatedOrder);
            onAllUpdate();
            handleCloseEdit();

        } catch (e) {
            console.error('Ошибка удаления товара:', e);
        }
    };
    const handleDeleteOrder = (orderId) => {
        setOrderToDelete(orderId);
        onDeleteOrderOpen();
    };

    const confirmDeleteOrder = async () => {
        try {
            await axios.delete(`/dashboard/order/${orderToDelete}`);
            onAllUpdate(); // Обновляем таблицу
        } catch (e) {
            console.error('Ошибка удаления:', e);
        }
    };

    return (
        <>

            <Card w="100%" height="calc(100vh - 135px)" px="0px" overflow="hidden" display="flex" flexDirection="column">
                {/* Заголовок - фиксированная шапка */}
                <Flex
                    px="25px"
                    mb="8px"
                    h="12"
                    justify="space-between"
                    align="center"
                    position="sticky"
                    top="0"
                    zIndex="1"
                >
                    <Text fontSize="22px" fontWeight="700" color={textColor}>Продажи</Text>
                    <Flex align={'center'}>
                        <Button
                            borderRadius="50%"
                            width="40px"
                            height="40px"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            padding={0}
                            onClick={exportToExcelProduct}

                        >
                            <img src='/excel.svg' width={16} height={16} />
                        </Button>
                        <Button
                            borderRadius="50%"
                            width="40px"
                            height="40px"
                            display="flex"
                            padding={0}
                            justifyContent="center"
                            alignItems="center"
                            onClick={onOpenFilter}
                        >
                            <img src='/filter.svg' width={16} height={16} />
                        </Button>
                        <Button
                            borderRadius="50%"
                            width="40px"
                            height="40px"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            onClick={onOpenCreateOrder}
                        >
                            <AddIcon boxSize={4} color="purple.500" />
                        </Button>

                    </Flex>


                </Flex>

                {/* Таблица в скролл-контейнере */}
                <Box flex="1">
                    <Scrollbars style={{ height: '100%' }} autoHide>
                        <Table
                            variant="simple"
                            color="gray.500"
                            mb="24px"
                            mt="12px"
                            fontFamily="'Montserrat', sans-serif"
                        >
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
                                                <Flex justify="space-between" align="center" fontSize="sm" color="gray.400" gap={1}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronUpIcon boxSize={4} />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDownIcon boxSize={4} />
                                                    ) : null}
                                                </Flex>
                                            </Th>
                                        ))}
                                    </Tr>
                                ))}
                            </Thead>

                            <Tbody>
                                {table.getRowModel().rows.map(row => (
                                    <Tr
                                        key={row.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOrderClick(row.original);
                                        }}
                                        _hover={{ bg: bgReadonly, cursor: 'pointer' }}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <Td
                                                h="65px"
                                                key={cell.id}
                                                borderColor="transparent"
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color={textColor}
                                            >
                                                {cell.column.id === 'status' ? (
                                                    <Flex justifyContent="center" alignItems="center">
                                                        <Button
                                                            colorScheme={cell.getValue() ? 'green' : 'red'}
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newStatus = !cell.getValue();
                                                                updatePaymentStatus(row.original.id || row.original.orderId, newStatus);
                                                                row.original.status = newStatus;
                                                            }}
                                                        >
                                                            {cell.getValue() ? <MdCheck /> : <MdCancel />}
                                                        </Button>
                                                    </Flex>
                                                ) : cell.column.id === 'actions' ? (
                                                    <Flex justifyContent="center" alignItems="center">
                                                        <Button
                                                            size="md"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteOrder(row.original.id || row.original.orderId);
                                                            }}
                                                        >
                                                            <MdDeleteForever color="purple.500" />
                                                        </Button>
                                                    </Flex>
                                                ) : (
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                )}
                                            </Td>
                                        ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Scrollbars>
                </Box>
            </Card>

            <DeleteOrderDialog
                isOpen={isDeleteOrderOpen}
                onClose={onDeleteOrderClose}
                onDelete={confirmDeleteOrder}
                orderId={orderToDelete}
            />
            <CreateOrderModal
                onAllUpdate={onAllUpdate}
                isOpen={isOpenCreateOrder}
                onClose={onCloseCreateOrder}
                clientsData={clientsData}
                productsData={allProductData}
                onOrderCreated={onOpenCreateOrder}
            />


            {/* Модалка заказа */}
            <Modal isOpen={isOrderOpen} onClose={onOrderClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Заказ №{selectedOrder?.orderId}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <Flex direction="column" gap={1}>
                                {/* Панель клиента */}
                                <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" _hover={{ bg: bgReadonly, cursor: 'pointer' }} onClick={() => handleClientClick(selectedOrder.client.fullName)}>
                                    <Text fontWeight="bold" fontSize="lg" mb={3} display="flex" alignItems="center">
                                        Клиент
                                    </Text>
                                    <Flex direction={['column', 'row']} gap={6} fontSize="md" color={textColor}>
                                        <Box flex={1}>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdPerson size={16} style={{ marginRight: '8px' }} /> Имя
                                            </Text>
                                            <Text>{selectedOrder.client?.fullName}</Text>
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdPhone size={16} style={{ marginRight: '8px' }} /> Телефон
                                            </Text>
                                            <Text>{selectedOrder.client?.phone}</Text>
                                        </Box>
                                    </Flex>
                                </Box>

                                {/* Панель деталей заказа */}
                                <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
                                    <Text fontWeight="bold" fontSize="lg" mb={3} display="flex" alignItems="center">
                                        Детали заказа
                                    </Text>
                                    <SimpleGrid columns={[1, 2]} spacing={6} fontSize="sm" color={textColor}>
                                        <Box>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdCalendarToday size={16} style={{ marginRight: '8px' }} /> Дата заказа
                                            </Text>
                                            <Text>{selectedOrder.date}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdLocalShipping size={16} style={{ marginRight: '8px' }} /> Доставка
                                            </Text>
                                            <Text>{selectedOrder.deliveryMethod}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdCardGiftcard size={16} style={{ marginRight: '8px' }} /> Скидка
                                            </Text>
                                            <Text>{selectedOrder.discountAmount}₽ ({selectedOrder.discountPercent}%)</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdCardGiftcard size={16} style={{ marginRight: '8px' }} /> Причина скидки
                                            </Text>
                                            <Text>{selectedOrder.discountReason || '—'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <MdCardGiftcard size={16} style={{ marginRight: '8px' }} /> Кэшбэк
                                            </Text>
                                            <Text>Начислено: {selectedOrder.cashbackEarned}₽</Text>
                                            <Text>Использовано: {selectedOrder.cashbackUsed}₽</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="medium" display="flex" alignItems="center">
                                                <IoMdPricetag size={16} style={{ marginRight: '8px' }} /> Цена без скидки:
                                            </Text>
                                            <Text>

                                                {selectedOrder.totalPriceWithoutDiscount}₽
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>
                                {/* Заголовок списка товаров */}
                                <Text fontWeight="bold" fontSize="lg" mb={3} display="flex" alignItems="center" justifyContent={`center`}>
                                    Товары в заказе
                                </Text>


                                {/* Список товаров */}
                                {selectedOrder?.products?.length > 0 ? (
                                    selectedOrder.products.map((product, idx) => (
                                        <Box key={idx} mb={3} p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
                                            <Text fontWeight="bold">{product.name}</Text>
                                            <Text>Категория: {product.category}</Text>
                                            <Text>Цена: {product.price}₽</Text>
                                            <Text>Количество: {product.quantity}</Text>
                                            <Button
                                                size="sm"
                                                mt={2}
                                                onClick={() => handleEditProduct(product)}
                                                leftIcon={<MdEdit />}
                                            >
                                                Редактировать
                                            </Button>
                                        </Box>
                                    ))
                                ) : (
                                    <Text>Нет товаров</Text>
                                )}
                                <Button
                                    colorScheme="green"
                                    onClick={openAddProductModal}
                                    leftIcon={<MdAdd />}
                                >
                                    Добавить товар
                                </Button>
                                <Flex
                                    justifyContent={`center`}
                                    alignItems={`center`}
                                    mt={6}
                                    p={4}
                                    bg="blue.50"
                                    _dark={{ bg: "blue.900" }}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    textAlign="right"
                                    boxShadow="md"
                                >
                                    <Text color="blue.600" _dark={{ color: "blue.200" }}>

                                        <MdCreditCard size={20} style={{ marginRight: '8px' }} />
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold" color="blue.600" _dark={{ color: "blue.200" }}>
                                        Финальная сумма: {selectedOrder?.finalTotalPrice}₽
                                    </Text>
                                </Flex>
                            </Flex>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal >
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
            <Modal isOpen={isAddProductOpen} onClose={closeAddProductModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Добавить товар в заказ</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box mb={4} position="relative">
                            <Input
                                placeholder="Поиск товара..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {filteredProducts.length > 0 && (
                                <Box
                                    position="absolute"
                                    top="100%"
                                    left={0}
                                    right={0}
                                    bg="white"
                                    border="1px solid #E2E8F0"
                                    borderRadius="md"
                                    boxShadow="md"
                                    maxHeight="200px"
                                    overflowY="auto"
                                    zIndex={10}
                                >
                                    {filteredProducts.map((product) => (
                                        <Box
                                            key={product.id}
                                            px={4}
                                            py={2}
                                            _hover={{ bg: "gray.100", cursor: "pointer" }}
                                            onMouseDown={() => {
                                                setNewProduct({ ...newProduct, productId: product.id });
                                                setSearchTerm(product.name);
                                                setFilteredProducts([]);
                                            }}
                                        >
                                            {product.name}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                        <NumberInput
                            min={1}
                            value={newProduct.quantity}
                            onChange={(value) => setNewProduct({ ...newProduct, quantity: Number(value) })}
                        >
                            <NumberInputField placeholder="Количество" />
                        </NumberInput>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="green" mr={3} onClick={handleAddProductToOrder}>
                            Добавить
                        </Button>
                        <Button onClick={closeAddProductModal}>Отмена</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isFilterOpen} onClose={onCloseFilter}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Фильтр продаж</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Сумма от</FormLabel>
                            <Input
                                type="number"
                                value={filterValues.minSum}
                                onChange={(e) =>
                                    setFilterValues({ ...filterValues, minSum: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Сумма до</FormLabel>
                            <Input
                                type="number"
                                value={filterValues.maxSum}
                                onChange={(e) =>
                                    setFilterValues({ ...filterValues, maxSum: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Начальная дата</FormLabel>
                            <Input
                                type="date"
                                value={filterValues.startDate}
                                onChange={(e) =>
                                    setFilterValues({ ...filterValues, startDate: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Конечная дата</FormLabel>
                            <Input
                                type="date"
                                value={filterValues.endDate}
                                onChange={(e) =>
                                    setFilterValues({ ...filterValues, endDate: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Статус оплаты</FormLabel>
                            <Select
                                placeholder="Все"
                                value={filterValues.paymentStatus}
                                onChange={(e) =>
                                    setFilterValues({ ...filterValues, paymentStatus: e.target.value })
                                }
                            >
                                <option value="paid">Оплачено</option>
                                <option value="unpaid">Не оплачено</option>
                            </Select>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onCloseFilter}>
                            Применить
                        </Button>
                        <Button colorScheme="red" onClick={() => {
                            setFilterValues({
                                minSum: '',
                                maxSum: '',
                                startDate: '',
                                endDate: '',
                                paymentStatus: '',
                            });
                            onCloseFilter();
                        }}>Сбросить</Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
