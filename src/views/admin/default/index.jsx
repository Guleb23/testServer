import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import {
  MdShoppingBasket,
  MdCurrencyRuble,
  MdPeopleAlt,
  MdFormatListBulleted,
} from "react-icons/md";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import PieCard from "views/admin/default/components/PieCard";
import TotalSpent from "views/admin/default/components/TotalSpent";

import axios from '../../../api/axios'
import { useAuth } from "contexts/AuthContext";
export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const { user } = useAuth();
  const [statistics, setStatistics] = useState({
    products: 0,
    clients: 0,
    orders: 0,
    revenue: 0,
  });

  const [tableDataPie, setTableDataPie] = useState([]);
  const [tableDataCheckProducts, setTableDataCheckProducts] = useState([]);
  const [tableDataCheckClients, setTableDataCheckClients] = useState([]);
  const [tableDataComplex, setTableDataComplex] = useState([]);
  const [tableDataTotalSpent, setTableDataTotalSpent] = useState(null);

  useEffect(() => {
    console.log(user.id);
    const fetchData = async () => {
      try {
        const [
          miniStatsRes,
          revenueChartRes,
          categoriesRes,
          recentSalesRes,
          top10ProductsRes,
          top10ClientsRes,
        ] = await Promise.all([
          axios.get("/dashboard/mini-stats", { params: { userId: user.id } }),
          axios.get("/dashboard/revenue-chart?period=month", { params: { userId: user.id } }), // можно сменить на 'week'
          axios.get("/dashboard/popular-categories", { params: { userId: user.id } }),
          axios.get("/dashboard/recent-sales", { params: { userId: user.id } }),
          axios.get("/dashboard/top10-products", { params: { userId: user.id } }), // Новый запрос для топ-10 продуктов
          axios.get("/dashboard/top10-clients", { params: { userId: user.id } }), // Новый запрос для топ-10 клиентов
        ]);


        const stats = miniStatsRes.data;
        setStatistics({
          products: stats?.totalUnitsSold ?? 0,
          clients: stats?.totalBuyers ?? 0,
          orders: stats?.totalOrders ?? 0,
          revenue: stats?.totalRevenue ?? 0,
        });

        const pieDataNormalized = categoriesRes.data.map((item) => ({
          name: item.category,
          percentage: item.percentage,
          quantity: item.count,
        }));

        setTableDataPie(pieDataNormalized);
        // Нормализуем данные для топ-10 продуктов
        const normalizedTopProducts = top10ProductsRes.data.map((product) => ({
          id: product.productId,  // Убедитесь, что ваш ответ от сервера имеет это поле
          name: product.name,
          sales: product.quantity,  // Здесь мы присваиваем количество продаж
        }));


        setTableDataCheckProducts(normalizedTopProducts);
        const normalizedTopClients = top10ClientsRes.data.map((client) => ({
          id: client.clientId,  // Идентификатор клиента
          name: client.fullName,  // Имя клиента
          purchaseAmount: client.total,  // Общая сумма покупок
        }));
        console.log(normalizedTopClients);
        setTableDataCheckClients(normalizedTopClients); // Присваиваем данные топ-10 клиентов
        setTableDataComplex(recentSalesRes.data);
        console.log(recentSalesRes.data);

        setTableDataTotalSpent(revenueChartRes.data);

      } catch (error) {
        console.error("Ошибка загрузки дашборда:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box pt={{ base: "200px", md: "100px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 4 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg={boxBg} icon={<Icon w="32px" h="32px" as={MdShoppingBasket} color={brandColor} />} />}
          name="Товары"
          value={statistics?.products ? statistics.products : 0}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg={boxBg} icon={<Icon w="32px" h="32px" as={MdPeopleAlt} color={brandColor} />} />}
          name="Покупатели"
          value={statistics?.clients ? statistics.clients : 0}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg={boxBg} icon={<Icon w="32px" h="32px" as={MdFormatListBulleted} color={brandColor} />} />}
          name="Заказы"
          value={statistics?.orders ? statistics.orders : 0}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)" icon={<Icon w="28px" h="28px" as={MdCurrencyRuble} color="white" />} />}
          name="Выручка"
          value={`₽${statistics.revenue || 0}`}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        <TotalSpent gridColumn={{ base: "span 1", md: "span 2", lg: "span 3" }} tableDataTotalSpent={tableDataTotalSpent} />
        <PieCard gridColumn={{ base: "span 1", md: "span 2", lg: "span 1" }} pieData={tableDataPie} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
        <ComplexTable tableData={tableDataComplex} />
        <CheckTable topProductsData={tableDataCheckProducts} topClientsData={tableDataCheckClients} />
      </SimpleGrid>
    </Box>
  );
}
