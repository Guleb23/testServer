// src/components/OrderModal.jsx

import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Box, Text, Button } from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';

const OrderModal = ({ isOpen, onClose, selectedOrder, handleEditProduct }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Товары в заказе #{selectedOrder?.orderId}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedOrder?.products?.length > 0 ? (
                        selectedOrder.products.map((product, idx) => (
                            <Box key={idx} mb={3} p={3} borderWidth="1px" borderRadius="md">
                                <Text fontWeight="bold">{product.name}</Text>
                                <Text>Категория: {product.category}</Text>
                                <Text>Цена: {product.price}₽</Text>
                                <Text>Количество: {product.quantity}</Text>
                                <Button size="sm" mt={2} onClick={() => handleEditProduct(product)} leftIcon={<FaEdit />}>Редактировать</Button>
                            </Box>
                        ))
                    ) : <Text>Нет товаров</Text>}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default OrderModal;
