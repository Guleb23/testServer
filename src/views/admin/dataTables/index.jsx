import React, { useEffect, useState } from "react";
import {
  Box, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, FormControl, FormLabel, Input, Select,
  useDisclosure, useColorModeValue, Text, useToast
} from "@chakra-ui/react";
import ColumnsTable from "views/admin/dataTables/components/ColumnsTable";
import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import axios from "../../../api/axios";

export default function UserReports() {
  const inputBg = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white");
  const toast = useToast();

  const [tableDataComplex, setTableDataComplex] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedClientCashback, setSelectedClientCashback] = useState(0);

  const { isOpen: isOpenCreateProduct, onOpen: onOpenCreateProduct, onClose: onCloseCreateProduct } = useDisclosure();
  const { isOpen: isOpenCreateClient, onOpen: onOpenCreateClient, onClose: onCloseCreateClient } = useDisclosure();
  const { isOpen: isOpenCreateOrder, onOpen: onOpenCreateOrder, onClose: onCloseCreateOrder } = useDisclosure();
  const { isOpen: isOpenCreateCategory, onOpen: onOpenCreateCategory, onClose: onCloseCreateCategory } = useDisclosure();

  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", weight: "" });
  const [newClient, setNewClient] = useState({ FullName: "", Phone: "", Address: "", Cashback: "", Comment: "" });
  const [newOrder, setNewOrder] = useState({
    clientId: "",
    cashbackUsed: 0,
    discountPercent: 0,
    discountReason: "",
    deliveryMethod: "",
    products: [],
  });
  const [newCategory, setNewCategory] = useState({ name: "" });
  const fetchData = async () => {
    try {
      const [
        productRes,
        clientsRes,
        recentSales,
        categoriesRes
      ] = await Promise.all([
        axios.get("/dashboard/all-products"),
        axios.get("/dashboard/all-clients"),
        axios.get("/dashboard/recent-sales"),
        axios.get("/dashboard/categories"),  // Получаем категории с сервера
      ]);
      const categories = categoriesRes.data.map((item) => ({
        id: item.id,
        name: item.categoryName
      }));
      setCategories(categories);  // Сохраняем категории в состоянии
      setProductsData(productRes.data);
      setClientsData(clientsRes.data);
      setTableDataComplex(recentSales.data);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };
  // Получаем данные с сервера
  useEffect(() => {
    fetchData();
    // Отключаем прокрутку на body

    console.log(clientsData);

    // Восстанавливаем прокрутку при размонтировании компонента



  }, []);
  const handleDeleteClient = async (id) => {
    if (!id) {
      console.error('ID клиента не найдено');
      return;
    }
    try {
      const response = await axios.delete(`/dashboard/client/${id}`);
      if (response.status === 200) {
        setClientsData(clientsData.filter(client => client.id !== id));  // Обновляем список клиентов
      } else {
        throw new Error('Ошибка при удалении клиента');
      }
    } catch (error) {
      console.error('Ошибка при удалении клиента:', error);
    }
  };

  // Функция для редактирования клиента
  const handleEditClient = async (updatedClient) => {
    try {
      const response = await axios.put(`/dashboard/client/${updatedClient.id}`, updatedClient);
      if (response.status === 200) {
        setClientsData((prevData) =>
          prevData.map((client) =>
            client.id === updatedClient.id ? { ...client, ...updatedClient } : client
          )
        );
      } else {
        throw new Error('Ошибка при редактировании клиента');
      }
    } catch (error) {
      console.error('Ошибка при редактировании клиента:', error);
    }
  };
  // Функция для удаления продукта
  const handleDeleteProduct = async (id) => {
    if (!id) {
      console.error('ID не найдено');
      return;
    }
    try {
      const response = await axios.delete(`/dashboard/product/${id}`);
      if (response.status === 200) {
        setProductsData(productsData.filter(product => product.id !== id));  // Обновляем состояние после удаления
      } else {
        throw new Error('Ошибка при удалении товара');
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
    }
  };

  // Функция для редактирования продукта
  const handleEditProduct = async (updatedProduct) => {
    try {
      console.log("вход");
      console.log(updatedProduct);

      // Отправляем запрос на сервер для обновления продукта
      const response = await axios.put(`/dashboard/product/${updatedProduct.id}`, updatedProduct);

      if (response.status === 200) {
        setProductsData((prevData) =>
          prevData.map((product) =>
            product.id === updatedProduct.id
              ? {
                ...product,
                ...updatedProduct, // Сначала обновляем все поля из updatedProduct
                // Находим категорию по categoryId и присваиваем её имя
                category: categories.find((category) => category.id === updatedProduct.category)?.name || product.category,
              }
              : product
          )
        );
        console.log("выход");
        console.log(updatedProduct);
      } else {
        throw new Error('Ошибка при редактировании товара');
      }
    } catch (error) {
      console.error('Ошибка при редактировании товара:', error);
    }
  };

  // Функции для создания нового продукта, клиента, категории и заказа
  const handleCreateProduct = async () => {
    try {
      const response = await axios.post("/dashboard/product", newProduct);
      fetchData();
      onCloseCreateProduct();
    } catch (error) {
      console.error("Ошибка при создании продукта:", error);
    }
  };

  const handleCreateClient = async () => {
    try {
      const response = await axios.post("/dashboard/createClient", newClient);
      fetchData();
      onCloseCreateClient();
    } catch (error) {
      console.error("Ошибка при создании клиента:", error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const payload = {
        clientId: parseInt(newOrder.clientId),
        deliveryMethod: newOrder.deliveryMethod,
        discountPercent: newOrder.discountPercent,
        discountReason: newOrder.discountReason,
        cashbackUsed: newOrder.cashbackUsed,
        products: newOrder.products.map(p => ({
          productId: parseInt(p.productId),
          quantity: parseInt(p.quantity)
        }))
      };
      console.log(JSON.stringify(payload, null, 2));

      const response = await axios.post("/dashboard/createOrder", payload);
      toast({
        title: "Заказ успешно создан",
        description: `Кешбэк начислен: ${response.data.cashbackEarned}₽`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchData();
      onCloseCreateOrder();
    } catch (error) {
      toast({
        title: "Ошибка при создании заказа",
        description: error?.response?.data || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateCategory = async () => {
    try {
      const response = await axios.post("/dashboard/createCategory", newCategory);
      // Добавляем новую категорию в список
      fetchData();
      onCloseCreateCategory();
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
    }
  };

  return (
    <Box overflowY="hidden" pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb='20px'
        columns={{ sm: 1, md: 2 }}
        spacing={{ base: "20px", xl: "20px" }}>
        <ComplexTable tableData={tableDataComplex} onAllUpdate={fetchData} />
        <ColumnsTable categories={categories} onDeleteClient={handleDeleteClient} onEditClient={handleEditClient} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} productsData={productsData} clientsData={clientsData} />



        <Button onClick={onOpenCreateOrder}>Создать заказ</Button>
        <Button onClick={onOpenCreateProduct}>Создать продукт</Button>
        <div></div>
        <Button onClick={onOpenCreateClient}>Создать клиента</Button>

      </SimpleGrid>



      {/* Модальное окно для создания продукта */}
      <Modal isOpen={isOpenCreateProduct} onClose={onCloseCreateProduct}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создать продукт</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Название</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Введите название продукта"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Цена</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Введите цену"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Категория</FormLabel>
              {/* Заменяем поле ввода на выпадающий список */}
              <Select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                placeholder="Выберите категорию"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Button onClick={onOpenCreateCategory} mt={2} size="sm">Создать категорию</Button> {/* Кнопка для создания категории */}
            </FormControl>
            {/* Добавляем поле для веса */}
            <FormControl mt={4}>
              <FormLabel>Вес</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newProduct.weight}
                onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                placeholder="Введите вес продукта"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onCloseCreateProduct}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleCreateProduct}>
              Создать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для создания клиента */}
      <Modal isOpen={isOpenCreateClient} onClose={onCloseCreateClient}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создать клиента</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Имя</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newClient.FullName}
                onChange={(e) => setNewClient({ ...newClient, FullName: e.target.value })}
                placeholder="Введите имя клиента"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>phone</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newClient.Phone}
                onChange={(e) => setNewClient({ ...newClient, Phone: e.target.value })}
                placeholder="Введите phone"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Address</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newClient.Address}
                onChange={(e) => setNewClient({ ...newClient, Address: e.target.value })}
                placeholder="Введите Address"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Cashback</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newClient.Cashback}
                onChange={(e) => setNewClient({ ...newClient, Cashback: e.target.value })}
                placeholder="Введите кешбек"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Comment</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newClient.Comment}
                onChange={(e) => setNewClient({ ...newClient, Comment: e.target.value })}
                placeholder="Введите кешбек"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onCloseCreateClient}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleCreateClient}>
              Создать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для создания заказа */}
      <Modal isOpen={isOpenCreateOrder} onClose={onCloseCreateOrder}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создать заказ</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Клиент</FormLabel>
              <Select
                value={newOrder.clientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setNewOrder({ ...newOrder, clientId: id });
                  const client = clientsData.find(c => c.id === parseInt(id));
                  setSelectedClientCashback(client?.cashback ?? 0);
                }}
              >
                <option value="">Выберите клиента</option>
                {clientsData.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </Select>

              {newOrder.clientId && (
                <Text mt={2}>Кешбэк клиента: <strong>{selectedClientCashback}₽</strong></Text>
              )}

              {/* Добавление нескольких продуктов */}
              <FormControl mt={4}>
                <FormLabel>Продукты</FormLabel>
                {newOrder.products.map((product, index) => (
                  <Box key={index} mb={2} p={2} border="1px solid #ccc" borderRadius="md">
                    <Select
                      value={product.productId}
                      onChange={(e) => {
                        const updatedProducts = [...newOrder.products];
                        updatedProducts[index].productId = e.target.value;
                        setNewOrder({ ...newOrder, products: updatedProducts });
                      }}
                    >
                      <option value="">Выберите продукт</option>
                      {productsData.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                      ))}
                    </Select>

                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => {
                        const updatedProducts = [...newOrder.products];
                        updatedProducts[index].quantity = parseInt(e.target.value);
                        setNewOrder({ ...newOrder, products: updatedProducts });
                      }}
                      placeholder="Количество"
                      mt={2}
                    />
                    <Button
                      mt={2}
                      colorScheme="red"
                      size="sm"
                      onClick={() => {
                        const updatedProducts = newOrder.products.filter((_, i) => i !== index);
                        setNewOrder({ ...newOrder, products: updatedProducts });
                      }}
                    >
                      Удалить продукт
                    </Button>
                  </Box>
                ))}

                <Button
                  mt={4}
                  colorScheme="blue"
                  onClick={() => {
                    setNewOrder({
                      ...newOrder,
                      products: [...newOrder.products, { productId: '', quantity: 1 }]
                    });
                  }}
                >
                  Добавить продукт
                </Button>
              </FormControl>

              {/* Оставшиеся поля */}
              <FormControl mt={4}>
                <FormLabel>Использовать кешбэк</FormLabel>
                <Input
                  type="number"
                  value={newOrder.cashbackUsed}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value <= selectedClientCashback) {
                      setNewOrder({ ...newOrder, cashbackUsed: value });
                    }
                  }}
                  placeholder={`До ${selectedClientCashback}`}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Скидка (%)</FormLabel>
                <Input
                  type="number"
                  value={newOrder.discountPercent}
                  onChange={(e) => setNewOrder({ ...newOrder, discountPercent: parseFloat(e.target.value) })}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Причина скидки</FormLabel>
                <Input
                  value={newOrder.discountReason}
                  onChange={(e) => setNewOrder({ ...newOrder, discountReason: e.target.value })}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Метод доставки</FormLabel>
                <Input
                  value={newOrder.deliveryMethod}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryMethod: e.target.value })}
                />
              </FormControl>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onCloseCreateOrder}>Отмена</Button>
            <Button colorScheme="blue" onClick={handleCreateOrder}>Создать</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


      {/* Модальное окно для создания категории */}
      <Modal isOpen={isOpenCreateCategory} onClose={onCloseCreateCategory}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создать категорию</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Название категории</FormLabel>
              <Input
                bg={inputBg}
                color={inputTextColor}
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Введите название категории"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onCloseCreateCategory}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleCreateCategory}>
              Создать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
