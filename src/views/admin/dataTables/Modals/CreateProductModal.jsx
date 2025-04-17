import React, { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Button,
    Box,
    List,
    ListItem,
    useToast
} from "@chakra-ui/react";

const CreateProductModal = ({
    isOpen,
    onClose,
    onOpenCreateCategory,
    handleCreateProduct,
    newProduct,
    setNewProduct,
    categories,
    inputBg,
    inputTextColor,
}) => {
    const [categorySearch, setCategorySearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const toast = useToast();

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    const handleCategorySelect = (category) => {
        setNewProduct({ ...newProduct, category: category.id });
        setCategorySearch(category.name);
        setShowDropdown(false);
    };

    const validateForm = () => {
        // Check if the product name is not empty
        if (!newProduct.name) {
            toast({
                title: "Ошибка",
                description: "Пожалуйста, введите название товара.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        // Check if the category is selected
        if (!newProduct.category) {
            toast({
                title: "Ошибка",
                description: "Пожалуйста, выберите категорию.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        // Check if price is a valid number
        if (!newProduct.price || isNaN(newProduct.price) || newProduct.price <= 0) {
            toast({
                title: "Ошибка",
                description: "Пожалуйста, введите правильную цену товара.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        // Check if weight is a valid number
        if (!newProduct.weight || isNaN(newProduct.weight) || newProduct.weight <= 0) {
            toast({
                title: "Ошибка",
                description: "Пожалуйста, введите правильный вес товара.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        return true;
    };

    const handleCreateProductWithValidation = () => {
        // Validate the form before submitting
        if (validateForm()) {
            handleCreateProduct();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Создать товар</ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>Название</FormLabel>
                        <Input
                            bg={inputBg}
                            color={inputTextColor}
                            value={newProduct.name}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, name: e.target.value })
                            }
                            placeholder="Введите название товара"
                        />
                    </FormControl>

                    <FormControl mt={4} position="relative">
                        <FormLabel>Категория</FormLabel>
                        <Input
                            bg={inputBg}
                            color={inputTextColor}
                            placeholder="Введите или выберите категорию"
                            value={categorySearch}
                            onChange={(e) => {
                                setCategorySearch(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // задержка, чтобы успел выполниться onClick
                            autoComplete="off"
                        />
                        {showDropdown && filteredCategories.length > 0 && (
                            <Box
                                position="absolute"
                                zIndex="10"
                                bg={inputBg}
                                w="100%"
                                border="1px solid #ccc"
                                borderRadius="md"
                                maxH="150px"
                                overflowY="auto"
                                mt={1}
                            >
                                <List spacing={0}>
                                    {filteredCategories.map((category) => (
                                        <ListItem
                                            key={category.id}
                                            px={3}
                                            py={2}
                                            _hover={{ bg: "gray.100", cursor: "pointer" }}
                                            tabIndex={0}
                                            onClick={() => handleCategorySelect(category)}
                                        >
                                            {category.name}
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                        <Button onClick={onOpenCreateCategory} mt={2} size="sm">
                            Создать категорию
                        </Button>
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel>Цена, ₽</FormLabel>
                        <Input
                            bg={inputBg}
                            color={inputTextColor}
                            value={newProduct.price}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, price: e.target.value })
                            }
                            placeholder="Введите цену в рублях"
                        />
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel>Вес, г</FormLabel>
                        <Input
                            bg={inputBg}
                            color={inputTextColor}
                            value={newProduct.weight}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, weight: e.target.value })
                            }
                            placeholder="Введите вес товара в граммах"
                        />
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button colorScheme="blue" onClick={handleCreateProductWithValidation}>
                        Создать
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateProductModal;
