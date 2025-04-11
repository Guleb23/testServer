import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useState } from "react";
import { updateUser } from "api/user";


export default function ProfileSettings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, login, token } = useAuth();
  const toast = useToast();

  // Цвета для светлой и темной темы
  const textColor = useColorModeValue("navy.700", "white");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white"); // Цвет текста в input
  const buttonColor = useColorModeValue("white", "gray.700");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    oldPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        oldPassword: "",
        newPassword: ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        oldPassword: profile.oldPassword,
        newPassword: profile.newPassword
      };

      const response = await updateUser(user.id, updatedData, token);

      // Обновим контекст пользователя
      login(token, { ...user, ...updatedData });

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

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={useColorModeValue("white", "gray.800")}>
      <VStack spacing={4} align="stretch">
        <Heading size="md" color={textColor}>Профиль</Heading>
        <Text color={textColor}><b>Имя:</b> {user?.firstName}</Text>
        <Text color={textColor}><b>Фамилия:</b> {user?.lastName}</Text>
        <Text color={textColor}><b>Email:</b> {user?.email}</Text>
        <Button colorScheme="blue" onClick={onOpen}>Редактировать профиль</Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Редактирование профиля</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color={textColor}>Имя</FormLabel>
                <Input
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  bg={inputBg}
                  color={inputTextColor} // Устанавливаем цвет текста для input
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Фамилия</FormLabel>
                <Input
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  bg={inputBg}
                  color={inputTextColor} // Устанавливаем цвет текста для input
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  bg={inputBg}
                  color={inputTextColor} // Устанавливаем цвет текста для input
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Старый пароль</FormLabel>
                <Input
                  type="password"
                  name="oldPassword"
                  value={profile.oldPassword}
                  onChange={handleChange}
                  bg={inputBg}
                  color={inputTextColor} // Устанавливаем цвет текста для input
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Новый пароль</FormLabel>
                <Input
                  type="password"
                  name="newPassword"
                  value={profile.newPassword}
                  onChange={handleChange}
                  bg={inputBg}
                  color={inputTextColor} // Устанавливаем цвет текста для input
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave} color={buttonColor}>Сохранить</Button>
            <Button onClick={onClose} ml={3} color={textColor}>Отмена</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}