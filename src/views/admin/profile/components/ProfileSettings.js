import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import axios from "api/axios";
import { updateUser } from "api/user";

export default function ProfileSettings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();

  const cancelRef = useRef();
  const { user, token, login, logout } = useAuth();
  const toast = useToast();

  const textColor = useColorModeValue("gray.800", "white");
  const bgColor = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputText = useColorModeValue("gray.800", "white");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cashbackPercent: user.cashbackPercent,
    oldPassword: "",
    newPassword: ""
  });

  // Загружаем актуальные данные пользователя при открытии модалки
  const fetchUser = async () => {
    try {
      const resp = await axios.get(`/user/getuser/${user.id}`);
      const data = resp.data;

      console.log(data);
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        cashbackPercent: data.cashbackPercent || 0,
        oldPassword: "",
        newPassword: ""
      });
    } catch (error) {
      toast({
        title: "Ошибка загрузки данных",
        description: error.response?.data || "Не удалось получить данные пользователя",
        status: "error",
        duration: 4000,
        isClosable: true
      });
    }
  };

  const handleOpenEdit = () => {
    fetchUser();


    onOpen();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: name === "cashbackPercent" ? Number(value) : value });
  };

  const handleSave = async () => {
    try {
      const updatedData = { ...profile };
      const response = await updateUser(user.id, updatedData, token);

      login(token, { ...user, ...updatedData }); // Обновим контекст

      toast({
        title: "Профиль обновлён.",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      onClose();
    } catch (err) {
      toast({
        title: "Ошибка обновления",
        description: err.response?.data || "Что-то пошло не так",
        status: "error",
        duration: 4000,
        isClosable: true
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/user/delete/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Аккаунт удалён.",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      logout();
    } catch (err) {
      toast({
        title: "Ошибка удаления",
        description: err.response?.data || "Не удалось удалить аккаунт",
        status: "error",
        duration: 4000,
        isClosable: true
      });
    }
  };

  return (
    <Box p={6} rounded="lg" bg={bgColor} shadow="base">
      <VStack spacing={4} align="start">
        <Heading size="lg" color={textColor}>Настройки профиля</Heading>
        <Text color={textColor}><b>Имя:</b> {user?.firstName}</Text>
        <Text color={textColor}><b>Фамилия:</b> {user?.lastName}</Text>
        <Text color={textColor}><b>Email:</b> {user?.email}</Text>
        <Text color={textColor}><b>Кешбэк:</b> {user?.cashbackPercent}%</Text>

        <Button colorScheme="blue" onClick={handleOpenEdit}>Редактировать профиль</Button>
        <Button colorScheme="red" onClick={onDeleteOpen}>Удалить аккаунт</Button>
      </VStack>

      {/* Редактирование профиля */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Редактирование профиля</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color={textColor}>Имя</FormLabel>
                <Input name="firstName" value={profile.firstName} onChange={handleChange} bg={inputBg} color={inputText} />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Фамилия</FormLabel>
                <Input name="lastName" value={profile.lastName} onChange={handleChange} bg={inputBg} color={inputText} />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input type="email" name="email" value={profile.email} onChange={handleChange} bg={inputBg} color={inputText} />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Кешбэк %</FormLabel>
                <Input type="number" name="cashbackPercent" value={profile.cashbackPercent} onChange={handleChange} bg={inputBg} color={inputText} />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Старый пароль</FormLabel>
                <Input type="password" name="oldPassword" value={profile.oldPassword} onChange={handleChange} bg={inputBg} color={inputText} />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Новый пароль</FormLabel>
                <Input type="password" name="newPassword" value={profile.newPassword} onChange={handleChange} bg={inputBg} color={inputText} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave}>Сохранить</Button>
            <Button onClick={onClose} ml={3}>Отмена</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Подтверждение удаления */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Удаление аккаунта</AlertDialogHeader>
            <AlertDialogBody>Вы уверены? Это действие нельзя отменить.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>Отмена</Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>Удалить</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
