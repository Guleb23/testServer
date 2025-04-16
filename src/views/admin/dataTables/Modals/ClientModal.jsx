import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text, Box, Flex, Button } from '@chakra-ui/react';
import { FaShoppingCart, MdDeleteForever } from 'react-icons/all';

const ClientModal = ({ isOpen, onClose, selectedClient, handleOrderClick, handleDeleteOrder }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Информация о клиенте</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedClient ? (
                        <>
                            <Text fontSize="xl" fontWeight="bold">{selectedClient.fullName}</Text>
                            <Text>{selectedClient.phone}</Text>
                            <Text>{selectedClient.address}</Text>
                            <Text>Кэшбэк: {selectedClient.cashback}₽</Text>

                            {selectedClient.orders.map((order) => (
                                <Box key={order.orderId} mt={4} p={3} borderWidth="1px" borderRadius="md">
                                    <Flex justify="space-between">
                                        <Box>
                                            <Text>Заказ #{order.orderId}</Text>
                                            <Text>{order.date}</Text>
                                            <Text>Итог: {order.finalTotalPrice}₽</Text>
                                        </Box>
                                        <Flex direction="column" gap={2}>
                                            <Button size="sm" onClick={() => handleOrderClick(order)} leftIcon={<FaShoppingCart />}>Товары</Button>
                                            <Button size="sm" colorScheme="red" onClick={() => handleDeleteOrder(order.orderId)} leftIcon={<MdDeleteForever />}>
                                                Удалить
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))}
                        </>
                    ) : <Text>Нет данных</Text>}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ClientModal;