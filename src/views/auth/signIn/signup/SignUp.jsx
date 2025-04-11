import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
    VStack,
    useToast,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiEyeCloseLine } from "react-icons/ri";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { registerUser } from "api/registerUser";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { useAuth } from "contexts/AuthContext";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const toast = useToast();
    const navigate = useNavigate();

    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const textColorBrand = useColorModeValue("brand.500", "white");

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Пароли не совпадают",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await registerUser(formData);
            toast({
                title: "Регистрация успешна!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            const { token, user } = response.data;
            login(token, user);
            navigate("/admin/default");
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error.response?.data?.message || "Не удалось зарегистрироваться",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };

    return (
        <DefaultAuth illustrationBackground={illustration} image={illustration}>
            <Flex
                overflow="hidden"
                maxW={{ base: "100%", md: "max-content" }}
                w='100%'
                mx={{ base: "auto", lg: "0px" }}
                me='auto'
                h='100%'
                alignItems='start'
                justifyContent='center'

                px={{ base: "25px", md: "0px" }}

                flexDirection='column'>
                <Box me='auto'>
                    <Heading color={textColor} fontSize='36px' mb='10px'>
                        Sign up
                    </Heading>
                    <Text
                        mb='36px'
                        ms='4px'
                        color={textColorSecondary}
                        fontWeight='400'
                        fontSize='md'>
                        Enter your data to sign up!
                    </Text>
                </Box>
                <Flex
                    zIndex='2'
                    direction='column'
                    w={{ base: "100%", md: "420px" }}
                    maxW='100%'
                    background='transparent'
                    borderRadius='15px'
                    mx={{ base: "auto", lg: "unset" }}
                    me='auto'
                >

                    <FormControl>
                        <Input

                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            name="firstName"
                            ms={{ base: "0px", md: "0px" }}
                            placeholder='Your firstname'
                            mb='24px'
                            value={formData.firstName}
                            onChange={handleChange}
                            fontWeight='500'
                            size='lg'
                        />
                    </FormControl>

                    <FormControl>
                        <Input

                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            name="lastName"
                            ms={{ base: "0px", md: "0px" }}
                            placeholder='Your lastname'
                            mb='24px'
                            value={formData.lastName}
                            onChange={handleChange}
                            fontWeight='500'
                            size='lg'
                        />
                    </FormControl>

                    <FormControl>
                        <Input

                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            name="email"
                            ms={{ base: "0px", md: "0px" }}
                            type='email'
                            placeholder='mail@simmmple.com'
                            mb='24px'
                            value={formData.email}
                            onChange={handleChange}
                            fontWeight='500'
                            size='lg'
                        />
                    </FormControl>

                    <FormControl>

                        <InputGroup>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                isRequired={true}
                                variant='auth'
                                fontSize='sm'
                                ms={{ base: "0px", md: "0px" }}
                                mb='24px'
                                fontWeight='500'
                                size='lg'
                            />
                            <InputRightElement>
                                <Icon
                                    as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                                    cursor="pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    <FormControl>

                        <Input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            ms={{ base: "0px", md: "0px" }}
                            mb='24px'
                            fontWeight='500'
                            size='lg'
                        />
                    </FormControl>
                </Flex>


                <Button
                    variant="brand"
                    fontWeight="500"
                    w="100%"
                    h="50px"
                    mb="6"
                    onClick={handleRegister}
                >
                    Зарегистрироваться
                </Button>

                <Text color={textColorSecondary} fontSize="sm" textAlign="center">
                    Уже есть аккаунт?{" "}
                    <NavLink to="/auth/sign-in">
                        <Text as="span" color={textColorBrand} fontWeight="500">
                            Войти
                        </Text>
                    </NavLink>
                </Text>
            </Flex>
        </DefaultAuth>
    );
}
