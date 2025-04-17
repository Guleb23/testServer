import React, { useState } from "react";
import { Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import CreateOrderModal from "../../../views/admin/dataTables/Modals/CreateOrderModal"; // Импортируйте ваш компонент

export default function SidebarDocs() {
  const bgColor = "linear-gradient(135deg, #868CFF 0%, #4318FF 100%)";
  const borderColor = useColorModeValue("white", "navy.800");
  const navigate = useNavigate();

  // Состояние для модального окна
  const [isOpen, setIsOpen] = useState(false);

  // Функция для открытия модального окна
  const onOpen = () => setIsOpen(true);

  // Функция для закрытия модального окна
  const onClose = () => setIsOpen(false);

  return (
    <Flex justify="center" direction="column" align="center" bg={bgColor} borderRadius="30px" position="relative">
      <Flex direction="column" mb="12px" align="center" justify="center" px="15px" pt="15px">
        <Text fontSize={{ base: "lg", xl: "18px" }} color="white" fontWeight="bold" lineHeight="150%" textAlign="center" px="10px" mt="10px" mb="6px">
          Есть новый заказ?
        </Text>
      </Flex>

      <Button
        onClick={onOpen} // Открытие модального окна
        bg="whiteAlpha.300"
        _hover={{ bg: "whiteAlpha.200" }}
        _active={{ bg: "whiteAlpha.100" }}
        mb={{ sm: "16px", xl: "24px" }}
        color={"white"}
        fontWeight="regular"
        fontSize="sm"
        minW="185px"
        mx="auto"
      >
        Добавить продажу
      </Button>

      {/* Модальное окно для создания заказа */}
      <CreateOrderModal
        isOpen={isOpen}
        onClose={onClose}
        onOrderCreated={() => { window.location.reload() }} // Функция после создания заказа (можно сделать с использованием состояния или других эффектов)
        onAllUpdate={() => { }} // Функция для обновления данных, если необходимо
      />
    </Flex>
  );
}
