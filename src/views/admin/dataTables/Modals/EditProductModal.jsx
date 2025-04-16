import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Input,
    Button,
    Box,
    List,
    ListItem,
} from '@chakra-ui/react';
import { MdDeleteForever } from 'react-icons/md';

const EditProductModal = ({
    isOpen,
    onClose,
    editingProduct,
    categories,
    productsData,
    setEditingProduct,
    handleSaveEditedProduct,
    handleDeleteProduct,
    textColor,
    bgInput,
    bgReadonly,
}) => {
    const [categorySearch, setCategorySearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            const selectedCategory = categories.find(c => c.id === editingProduct.category);
            setCategorySearch(selectedCategory?.categoryName || '');

            setProductSearch(editingProduct.name || '');
        }
    }, [editingProduct, categories]);

    const filteredCategories = categories.filter((cat) =>
        cat.categoryName.toLowerCase().includes(categorySearch.toLowerCase())
    );

    const filteredProducts = productsData
        .filter((p) => p.category === editingProduct?.category)
        .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));

    const handleCategorySelect = (category) => {
        setEditingProduct((prev) => ({
            ...prev,
            category: category.id,
            name: '',
            price: '',
        }));
        setCategorySearch(category.categoryName);
        setProductSearch('');
        setShowCategoryDropdown(false);
    };

    const handleProductSelect = (product) => {
        setEditingProduct((prev) => ({
            ...prev,
            name: product.name,
            price: product.price,
        }));
        setProductSearch(product.name);
        setShowProductDropdown(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontWeight="bold" fontSize="lg">
                    Редактировать товар
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {editingProduct && (
                        <Box
                            as="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveEditedProduct();
                            }}
                        >
                            {/* Категория */}
                            <Text mb={1} fontWeight="medium" color={textColor}>
                                Категория
                            </Text>
                            <Box position="relative" mb={4}>
                                <Input
                                    bg={bgInput}
                                    value={categorySearch}
                                    onChange={(e) => {
                                        setCategorySearch(e.target.value);
                                        setShowCategoryDropdown(true);
                                    }}
                                    onFocus={() => setShowCategoryDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
                                    placeholder="Введите или выберите категорию"
                                    autoComplete="off"
                                />
                                {showCategoryDropdown && filteredCategories.length > 0 && (
                                    <Box
                                        position="absolute"
                                        zIndex="10"
                                        bg={bgInput}
                                        w="100%"
                                        border="1px solid #ccc"
                                        borderRadius="md"
                                        maxH="150px"
                                        overflowY="auto"
                                        mt={1}
                                    >
                                        <List spacing={0}>
                                            {filteredCategories.map((cat) => (
                                                <ListItem
                                                    key={cat.id}
                                                    px={3}
                                                    py={2}
                                                    _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                                                    onClick={() => handleCategorySelect(cat)}
                                                >
                                                    {cat.categoryName}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Box>

                            {/* Товар */}
                            <Text mb={1} fontWeight="medium" color={textColor}>
                                Товар
                            </Text>
                            <Box position="relative" mb={4}>
                                <Input
                                    bg={bgInput}
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setShowProductDropdown(true);
                                    }}
                                    onFocus={() => setShowProductDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                                    placeholder="Введите или выберите товар"
                                    autoComplete="off"
                                />
                                {showProductDropdown && filteredProducts.length > 0 && (
                                    <Box
                                        position="absolute"
                                        zIndex="10"
                                        bg={bgInput}
                                        w="100%"
                                        border="1px solid #ccc"
                                        borderRadius="md"
                                        maxH="150px"
                                        overflowY="auto"
                                        mt={1}
                                    >
                                        <List spacing={0}>
                                            {filteredProducts.map((product) => (
                                                <ListItem
                                                    key={product.id}
                                                    px={3}
                                                    py={2}
                                                    _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    {product.name} — {product.price}₽
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Box>

                            {/* Цена */}
                            <Text mb={1} fontWeight="medium" color={textColor}>
                                Цена
                            </Text>
                            <Input
                                mb={4}
                                isReadOnly
                                bg={bgReadonly}
                                value={editingProduct.price ? `${editingProduct.price}₽` : ''}
                                color={textColor}
                                fontWeight="semibold"
                            />

                            {/* Количество */}
                            <Text mb={1} fontWeight="medium" color={textColor}>
                                Количество
                            </Text>
                            <Input
                                type="number"
                                mb={6}
                                bg={bgInput}
                                value={editingProduct.quantity}
                                onChange={(e) =>
                                    setEditingProduct({
                                        ...editingProduct,
                                        quantity: +e.target.value,
                                    })
                                }
                            />

                            <Button type="submit" colorScheme="blue" w="100%">
                                Сохранить
                            </Button>
                            <Button
                                mt={3}
                                w="100%"
                                colorScheme="red"
                                onClick={() => handleDeleteProduct(editingProduct.name)}
                                leftIcon={<MdDeleteForever />}
                            >
                                Удалить товар
                            </Button>
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default EditProductModal;
