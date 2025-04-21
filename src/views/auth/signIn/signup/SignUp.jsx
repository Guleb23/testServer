import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    Heading,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
    Progress,
    Stack,
    useToast,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiEyeCloseLine } from "react-icons/ri";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { registerUser } from "api/registerUser";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { useAuth } from "contexts/AuthContext";

const PasswordStrengthIndicator = ({ password }) => {
    const calculateStrength = (pass) => {
        let score = 0;

        // Длина пароля
        if (pass.length > 0) score += 5;
        if (pass.length >= 8) score += 15;
        if (pass.length >= 12) score += 20;

        // Разнообразие символов
        if (/[A-Z]/.test(pass)) score += 15;
        if (/[a-z]/.test(pass)) score += 15;
        if (/[0-9]/.test(pass)) score += 15;
        if (/[^A-Za-z0-9]/.test(pass)) score += 15;

        return Math.min(100, score);
    };

    const strength = calculateStrength(password);
    let color = "red";
    let label = "Слабый";

    if (strength >= 60) {
        color = "yellow";
        label = "Средний";
    }
    if (strength >= 80) {
        color = "green";
        label = "Сильный";
    }

    return (
        <Box mt={2} mb={4}>
            <Progress
                value={strength}
                size="xs"
                colorScheme={color}
                borderRadius="full"
            />
            <Flex justifyContent="space-between" mt={1}>
                <Text fontSize="xs" color="gray.500">
                    Сложность пароля:
                </Text>
                <Text fontSize="xs" color={`${color}.500`} fontWeight="bold">
                    {label}
                </Text>
            </Flex>
        </Box>
    );
};

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
    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const toast = useToast();
    const navigate = useNavigate();

    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const textColorBrand = useColorModeValue("brand.500", "white");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Валидация при изменении
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "firstName":
            case "lastName":
                if (!value.trim()) {
                    error = "Обязательное поле";
                } else if (value.length < 2) {
                    error = "Минимум 2 символа";
                }
                break;
            case "email":
                if (!value.trim()) {
                    error = "Обязательное поле";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "Некорректный email";
                }
                break;
            case "password":
                if (!value) {
                    error = "Обязательное поле";
                } else if (value.length < 8) {
                    error = "Пароль должен содержать минимум 8 символов";
                } else if (!/[A-Z]/.test(value)) {
                    error = "Добавьте хотя бы одну заглавную букву";
                } else if (!/[a-z]/.test(value)) {
                    error = "Добавьте хотя бы одну строчную букву";
                } else if (!/[0-9]/.test(value)) {
                    error = "Добавьте хотя бы одну цифру";
                } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                    error = "Добавьте хотя бы один спецсимвол";
                }
                break;
            case "confirmPassword":
                if (!value) {
                    error = "Обязательное поле";
                } else if (value !== formData.password) {
                    error = "Пароли не совпадают";
                }
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateForm = () => {
        let isValid = true;
        const newTouched = {
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            confirmPassword: true,
        };
        setTouched(newTouched);

        Object.keys(formData).forEach((field) => {
            const fieldValid = validateField(field, formData[field]);
            isValid = isValid && fieldValid;
        });

        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            toast({
                title: "Пожалуйста, исправьте ошибки в форме",
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
        <DefaultAuth illustrationBackground={illustration}>
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
                        Регистрация
                    </Heading>
                    <Text
                        mb='36px'
                        ms='4px'
                        color={textColorSecondary}
                        fontWeight='400'
                        fontSize='md'>
                        Введите свои данные для регистрации
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
                    <FormControl mb='24px' isInvalid={!!errors.firstName && touched.firstName}>
                        <Input
                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            name="firstName"
                            ms={{ base: "0px", md: "0px" }}
                            placeholder='Ваше имя'

                            value={formData.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fontWeight='500'
                            size='lg'
                        />
                        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>

                    <FormControl mb='24px' isInvalid={!!errors.lastName && touched.lastName}>
                        <Input
                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            name="lastName"
                            ms={{ base: "0px", md: "0px" }}
                            placeholder='Ваша фамилия'

                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fontWeight='500'
                            size='lg'
                        />
                        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                    </FormControl>

                    <FormControl mb='24px' isInvalid={!!errors.email && touched.email}>
                        <Input
                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            name="email"
                            ms={{ base: "0px", md: "0px" }}
                            type='email'
                            placeholder='mail@simmmple.com'

                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fontWeight='500'
                            size='lg'
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl mb='8px' isInvalid={!!errors.password && touched.password}>
                        <InputGroup >
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Введите пароль"
                                isRequired={true}
                                variant='auth'
                                fontSize='sm'
                                ms={{ base: "0px", md: "0px" }}

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
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                        {formData.password && (
                            <PasswordStrengthIndicator password={formData.password} />
                        )}

                        <Text fontSize="xs" color="gray.500" mt={2}>
                            Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы
                        </Text>


                    </FormControl>

                    <FormControl mb='24px' isInvalid={!!errors.confirmPassword && touched.confirmPassword}>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Подтвердите пароль"
                            isRequired={true}
                            variant='auth'
                            fontSize='sm'
                            ms={{ base: "0px", md: "0px" }}

                            fontWeight='500'
                            size='lg'
                        />
                        <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
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