import React, { useEffect, useState } from "react";
import {
  Box, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, FormControl, FormLabel, Input, Select,
  useDisclosure, useColorModeValue, Text, useToast
} from "@chakra-ui/react";
import ColumnsTable from "views/admin/dataTables/components/ColumnsTable";
import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import axios from "../../../api/axios";
import { useAuth } from "contexts/AuthContext";
import AllOrdersTable from "./components/OrdersTable";

export default function UserReports() {

  const { user } = useAuth();
  const [tableDataComplex, setTableDataComplex] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [categories, setCategories] = useState([]);


  const fetchData = async () => {
    try {
      const [
        productRes,
        clientsRes,
        recentSales,
        categoriesRes
      ] = await Promise.all([
        axios.get("/dashboard/all-products"),
        axios.get(`/dashboard/all-clients/${user.id}`),
        axios.get("/dashboard/all-sales", { params: { userId: user.id } }),
        axios.get("/dashboard/categories"),  // Получаем категории с сервера
      ]);
      const categories = categoriesRes.data.map((item) => ({
        id: item.id,
        name: item.categoryName
      }));
      setCategories(categories);  // Сохраняем категории в состоянии
      setProductsData(productRes.data);
      console.log(clientsRes.data);

      setClientsData(clientsRes.data);
      console.log(recentSales.data);

      setTableDataComplex(recentSales.data);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };
  // Получаем данные с сервера
  useEffect(() => {
    fetchData();
  }, []);
  const handleDeleteClient = async (id) => {
    if (!id) {
      console.error('ID клиента не найдено');
      return;
    }
    try {
      const response = await axios.delete(`/dashboard/client/${user.id}/${id}`);
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
      const response = await axios.put(`/dashboard/client/${user.id}/${updatedClient.id}`, updatedClient);
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








  return (
    <Box overflowY="hidden" pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb='20px'
        columns={{ sm: 1, md: 2 }}
        spacing={{ base: "20px", xl: "20px" }}>
        <AllOrdersTable tableData={tableDataComplex} onAllUpdate={fetchData} />
        <ColumnsTable onAllUpdate={fetchData} categories={categories} onDeleteClient={handleDeleteClient} onEditClient={handleEditClient} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} productsData={productsData} clientsData={clientsData} />


      </SimpleGrid>
    </Box>
  );
}
