import { Box, Flex, Text, List, ListItem, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

export default function PieCard({ pieData, ...rest }) {
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const colors = ["#4318FF", "#39B8FF", "#8E24AA", "#673AB7"];

  // Если данных нет, показываем заглушку
  if (!pieData || pieData.length === 0) {
    return (
      <Card p="20px" align="center" direction="column" w="100%" {...rest}>
        <Text color={textColor} fontSize="md" fontWeight="600">
          Нет данных для отображения
        </Text>
      </Card>
    );
  }

  // Данные для PieChart с назначением цветов
  const pieChartData = pieData.map((category, index) => ({
    ...category,
    color: colors[index % colors.length],
  }));

  // Данные для диаграммы
  const chartData = pieChartData.map(category => category.percentage);

  // Опции для круговой диаграммы
  const chartOptions = {
    chart: {
      width: "100%", // Размер диаграммы
    },
    colors: pieChartData.map((category) => category.color), // Используем цвета для диаграммы
    tooltip: {
      enabled: true,
      theme: "dark",
      custom: ({ seriesIndex }) => {
        const category = pieChartData[seriesIndex];
        if (!category) return ""; // Проверка на всякий случай

        return `<div style="padding: 6px">
          <strong>${category.name}</strong><br />
          ${category.quantity} шт
        </div>`;
      }
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
  };

  return (
    <Card p="20px" align="left" direction="column" w="100%" {...rest}>
      <Flex px={{ base: "0px", "2xl": "10px" }} justifyContent="space-between" alignItems="left" w="100%" mb="8px">
        <Text color={textColor} fontSize="md" fontWeight="600" mt="4px">
          Популярные категории месяца
        </Text>
      </Flex>

      <ReactApexChart options={chartOptions} series={chartData} type="pie" width="100%" height="55%" />

      <List spacing={3} mt="15px">
        {pieChartData.map((category, index) => (
          <ListItem key={index} pl="10px">
            <Flex align="center">
              <Box h="8px" w="8px" bg={category.color} borderRadius="50%" me="4px" />
              <Text fontSize="sm" color="secondaryGray.600" fontWeight="700" mr="15px">
                {category.name}
              </Text>
              <Text fontSize="md" color={textColor} fontWeight="700">
                {category.percentage}%
              </Text>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}



