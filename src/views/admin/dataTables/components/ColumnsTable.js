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
  useDisclosure,
} from '@chakra-ui/react';
import { MdDelete } from "react-icons/md";
import { FaEdit, FaSortUp, FaSortDown, FaSort } from "react-icons/fa";

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
import { AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import CreateProductModal from '../Modals/CreateProductModal';
import CreateClientModal from '../Modals/CreateClientModal';
import { useAuth } from 'contexts/AuthContext';
import axios from '../../../../api/axios';
import CreateCategoryModal from '../Modals/CreateCategoryModal';


export default function ColumnTable({ onAllUpdate, productsData = [], clientsData = [], categories, onDeleteProduct, onEditProduct, onDeleteClient, onEditClient }) {
  const inputBg = useColorModeValue("white", "gray.700");
  const { user } = useAuth();
  const inputTextColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const [newClient, setNewClient] = React.useState({ FullName: "", Phone: "", Address: "", Cashback: "", Comment: "", UserId: user.id });
  const [newProduct, setNewProduct] = React.useState({ name: "", price: "", category: "", weight: "" });
  const [newCategory, setNewCategory] = React.useState({ name: "" });
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
      id: 'id',
      header: 'ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('fullName', {
      id: 'fullName',
      header: 'ФИО',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('phone', {
      id: 'phone',
      header: 'Телефон',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('address', {
      id: 'address',
      header: 'Адрес',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('cashback', {
      id: 'cashback',
      header: 'Кэшбэк',
      cell: (info) => <Text textAlign="center">{info.getValue()}</Text>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <Flex justifyContent="center" gap={1} align="center">
          <Button size="md" onClick={() => handleEditClient(row.original)}>
            <FaEdit color="purple.200" />
          </Button>
          <Button size="md" onClick={() => handleDeleteClient(row.original.id)}>
            <MdDelete color="purple.900" />
          </Button>
        </Flex>
      ),
    }),
  ];

  const productColumns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: 'ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Название',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('category', {
      id: 'category',
      header: 'Категория',
      cell: ({ row }) => row.original.category?.name || row.original.category,
    }),
    columnHelper.accessor('weight', {
      id: 'weight',
      header: 'Вес',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('price', {
      id: 'price',
      header: 'Стоимость',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <Flex justifyContent="center" gap={1} align="center">
          <Button size="md" onClick={() => handleEditProduct(row.original)}><FaEdit color="purple.200" /></Button>
          <Button size="md" onClick={() => handleDeleteProduct(row.original.id)}><MdDelete color="purple.800" /></Button>
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
    initialState: {
      sorting: [
        {
          id: tableType === 'products' ? 'id' : 'id',
          desc: false,
        },
      ],
    },
  });

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const { isOpen: isOpenCreateProduct, onOpen: onOpenCreateProduct, onClose: onCloseCreateProduct } = useDisclosure();
  const { isOpen: isOpenCreateClient, onOpen: onOpenCreateClient, onClose: onCloseCreateClient } = useDisclosure();
  const { isOpen: isOpenCreateCategory, onOpen: onOpenCreateCategory, onClose: onCloseCreateCategory } = useDisclosure();

  const handleAdd = () => {
    if (tableType === 'products') {
      onOpenCreateProduct();
    } else {
      onOpenCreateClient();
    }
  };

  const handleCreateClient = async () => {
    try {
      const response = await axios.post("/dashboard/createClient", newClient);
      onCloseCreateClient();
      onAllUpdate();
    } catch (error) {
      console.error("Ошибка при создании клиента:", error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const response = await axios.post("/dashboard/product", newProduct);
      onAllUpdate();
      onCloseCreateProduct();
    } catch (error) {
      console.error("Ошибка при создании продукта:", error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const response = await axios.post("/dashboard/createCategory", newCategory);
      onAllUpdate();
      onCloseCreateCategory();
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
    }
  };

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

  const handleSaveProduct = () => {
    const updatedProduct = {
      ...productFormData,
      category:
        typeof productFormData.category === 'object'
          ? productFormData.category.id
          : productFormData.category,
    };
    onEditProduct(updatedProduct);
    setIsModalOpen(false);
  };

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
      comment: client.comment
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Удалить продукт?')) {
      onDeleteProduct(id);
    }
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('Удалить клиента?')) {
      onDeleteClient(id);
    }
  };

  const handleSaveClient = () => {
    onEditClient(clientFormData);
    onAllUpdate();
    setIsModalOpen(false);
  };

  return (
    <Card height="calc(100vh - 135px)" flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex px="25px" mb="8px" h={`12`} justify="space-between" align="center">
        <Flex align="center" gap={3}>
          <Text fontSize="22px" fontWeight="700" color={textColor}>
            {tableType === 'products' ? 'Товары' : 'Клиенты'}
          </Text>
          <Button
            borderRadius="50%"
            width="40px"
            height="40px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            onClick={handleAdd}
          >
            <AddIcon boxSize={4} color="purple.500" />
          </Button>
        </Flex>
        <Menu
          options={[
            { label: 'Товары', action: () => setTableType('products') },
            { label: 'Клиенты', action: () => setTableType('clients') },
          ]}
        />
      </Flex>

      <Box overflowY="auto">
        <Table height={`full`} variant="simple" color="gray.500" mb="24px" mt="12px" fontFamily="'Montserrat', sans-serif">
          <Thead height={`40px`}>
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
                    <Flex justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '14px' }} color="gray.400">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUpIcon boxSize={4} />,
                        desc: <ChevronDownIcon boxSize={4} />
                      }[header.column.getIsSorted()]}
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
                  <Td
                    fontSize="md"
                    fontWeight="700"
                    color={textColor}
                    minW="20px"
                    borderColor="transparent"
                    key={cell.id}
                  >
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
            {selectedProduct ? 'Редактировать товар' : selectedClient ? 'Редактировать клиента' : ''}
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
                    value={productFormData.category?.id}
                    onChange={(e) => {
                      const selectedCategory = categories.find(
                        (category) => category.id === parseInt(e.target.value)
                      );
                      setProductFormData({
                        ...productFormData,
                        category: selectedCategory.id,
                      });
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        <Text color={textColor}>
                          {category.name}
                        </Text>
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Цена, ₽</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                  />
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel>Вес, г</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={productFormData.weight}
                    onChange={(e) => setProductFormData({ ...productFormData, weight: e.target.value })}
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
                <FormControl mt={4}>
                  <FormLabel>Комментарий</FormLabel>
                  <Input
                    bg={inputBg}
                    color={inputTextColor}
                    value={clientFormData.comment}
                    onChange={(e) => setClientFormData({ ...clientFormData, comment: e.target.value })}
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

      <CreateClientModal
        isOpen={isOpenCreateClient}
        onClose={onCloseCreateClient}
        handleCreateClient={handleCreateClient}
        newClient={newClient}
        setNewClient={setNewClient}
        inputBg={inputBg}
        inputTextColor={inputTextColor}
      />
      <CreateProductModal
        isOpen={isOpenCreateProduct}
        onClose={onCloseCreateProduct}
        onOpenCreateCategory={onOpenCreateCategory}
        handleCreateProduct={handleCreateProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        inputBg={inputBg}
        inputTextColor={inputTextColor}
      />
      <CreateCategoryModal
        isOpen={isOpenCreateCategory}
        onClose={onCloseCreateCategory}
        handleCreateCategory={handleCreateCategory}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        inputBg={inputBg}
        inputTextColor={inputTextColor}
      />
    </Card>
  );
}