import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Button, FormControl, FormLabel, Input, Box, Text, Select, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import axios from "../../../../api/axios";
import { useAuth } from 'contexts/AuthContext';
import ReactSelect from 'react-select';
import { useToast } from '@chakra-ui/react';

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated, onAllUpdate }) {
    const { user } = useAuth();
    const toast = useToast();
    const [productsData, setProductsData] = useState([]);
    const [clientsData, setClientsData] = useState([]);
    const [newOrder, setNewOrder] = useState({
        UserId: user.id,
        clientId: '',
        products: [{ productId: '', quantity: 1 }],
        cashbackUsed: 0,
        discountPercent: 0,
        discountReason: '',
        deliveryMethod: '',
    });
    const [selectedClientCashback, setSelectedClientCashback] = useState(0);
    useEffect(() => {
        if (isOpen) {
            fetchForCreate();
            resetOrder();
        }
    }, [isOpen]);
    const fetchForCreate = async () => {
        try {
            const [
                productRes,
                clientsRes,
            ] = await Promise.all([
                axios.get("/dashboard/all-products"),
                axios.get(`/dashboard/all-clients/${user.id}`)
            ]);
            setProductsData(productRes.data);
            setClientsData(clientsRes.data);
            console.log("Clietns");
            console.log(clientsRes.data);

        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    };
    const getProductById = (id) => productsData.find(p => p.id === parseInt(id));
    const resetOrder = () => {
        setNewOrder({
            UserId: user.id,
            clientId: '',
            products: [{ productId: '', quantity: 1 }],
            cashbackUsed: 0,
            discountPercent: 0,
            discountReason: '',
            deliveryMethod: '',
        });
        setSelectedClientCashback(0);
    };
    const calculateTotals = () => {
        const total = newOrder.products.reduce((sum, item) => {
            const product = getProductById(item.productId);
            return sum + (product?.price || 0) * item.quantity;
        }, 0);
        const discounted = total - (total * newOrder.discountPercent / 100) - newOrder.cashbackUsed;
        return { total, discounted };
    };

    const { total, discounted } = calculateTotals();

    const handleCreateOrder = async () => {
        // Валидации
        if (!newOrder.clientId) {
            toast({
                title: 'Ошибка',
                description: 'Пожалуйста, выберите клиента.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const hasValidProduct = newOrder.products.some(p => p.productId);
        if (!hasValidProduct) {
            toast({
                title: 'Ошибка',
                description: 'Добавьте хотя бы один товар.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!newOrder.deliveryMethod) {
            toast({
                title: 'Ошибка',
                description: 'Пожалуйста, выберите способ доставки.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (newOrder.cashbackUsed > selectedClientCashback) {
            toast({
                title: 'Ошибка',
                description: `Максимальный кешбэк: ${selectedClientCashback}₽`,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await axios.post('/dashboard/createOrder', newOrder);
            onOrderCreated();
            onAllUpdate();
            resetOrder();
            onClose();
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось создать заказ.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => {
            resetOrder();
            onClose();
        }}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Создать заказ</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Клиент</FormLabel>
                        <ReactSelect
                            options={clientsData.map(c => ({ value: c.id, label: c.fullName }))}
                            value={clientsData.find(c => c.id === parseInt(newOrder.clientId)) && {
                                value: newOrder.clientId,
                                label: clientsData.find(c => c.id === parseInt(newOrder.clientId)).fullName
                            }}
                            onChange={(selected) => {
                                setNewOrder({ ...newOrder, clientId: selected.value });
                                const client = clientsData.find(c => c.id === selected.value);
                                setSelectedClientCashback(client?.cashback ?? 0);
                            }}
                            placeholder="Выберите клиента"
                        />
                        {newOrder.clientId && (
                            <Text mt={2}>Кешбэк клиента: <strong>{selectedClientCashback}₽</strong></Text>
                        )}

                        <FormControl mt={4}>
                            <FormLabel>Товары</FormLabel>
                            {newOrder.products.map((product, index) => {
                                const selectedProduct = getProductById(product.productId);
                                return (
                                    <Box key={index} mb={4} p={3} border="1px solid #ccc" borderRadius="md">
                                        <ReactSelect
                                            options={productsData.map(p => ({ value: p.id, label: p.name }))}
                                            value={productsData.find(p => p.id === parseInt(product.productId)) && {
                                                value: product.productId,
                                                label: selectedProduct?.name || ''
                                            }}
                                            onChange={(selected) => {
                                                const updated = [...newOrder.products];
                                                updated[index].productId = selected.value;
                                                setNewOrder({ ...newOrder, products: updated });
                                            }}
                                            placeholder="Выберите товар"
                                        />
                                        <FormLabel fontSize="sm" mt={2}>Количество (шт)</FormLabel>
                                        <NumberInput
                                            min={1}
                                            value={product.quantity}
                                            onChange={(_, value) => {
                                                const updated = [...newOrder.products];
                                                updated[index].quantity = value;
                                                setNewOrder({ ...newOrder, products: updated });
                                            }}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>

                                        {selectedProduct && (
                                            <Text mt={2} fontSize="sm">
                                                Цена за упаковку: <strong>{selectedProduct.price}₽</strong><br />
                                                В упаковке : <strong>{selectedProduct.weight}г.</strong><br />
                                                Итого за товар: <strong>{selectedProduct.price * product.quantity}₽</strong>
                                            </Text>
                                        )}

                                        <Button
                                            mt={2}
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => {
                                                const updated = newOrder.products.filter((_, i) => i !== index);
                                                setNewOrder({ ...newOrder, products: updated });
                                            }}
                                        >
                                            Удалить товар
                                        </Button>
                                    </Box>
                                );
                            })}
                            <Button
                                mt={2}
                                colorScheme="blue"
                                onClick={() => {
                                    setNewOrder({ ...newOrder, products: [...newOrder.products, { productId: '', quantity: 1 }] });
                                }}
                            >
                                Добавить товар
                            </Button>
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Метод доставки</FormLabel>
                            <Select
                                value={newOrder.deliveryMethod}
                                onChange={(e) => setNewOrder({ ...newOrder, deliveryMethod: e.target.value })}
                            >
                                <option value="">Выберите метод</option>
                                <option value="Самовывоз">Самовывоз</option>
                                <option value="Доставка">Доставка</option>
                            </Select>
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Использовать кешбэк</FormLabel>
                            <NumberInput
                                min={0}
                                max={selectedClientCashback}
                                value={newOrder.cashbackUsed}
                                clampValueOnBlur={true}
                                onChange={(valueString, valueNumber) => {
                                    // Пустое поле
                                    if (valueString === '') {
                                        setNewOrder({ ...newOrder, cashbackUsed: 0 });
                                        return;
                                    }

                                    // Не число — не обновляем
                                    if (isNaN(valueNumber)) return;

                                    // Валидное значение
                                    if (valueNumber <= selectedClientCashback) {
                                        setNewOrder({ ...newOrder, cashbackUsed: valueNumber });
                                    }
                                }}
                            >
                                <NumberInputField placeholder={`До ${selectedClientCashback}₽`} />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Скидка (%)</FormLabel>
                            <Input
                                type="number"
                                value={newOrder.discountPercent}
                                onChange={(e) => setNewOrder({ ...newOrder, discountPercent: parseFloat(e.target.value) })}
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Причина скидки</FormLabel>
                            <Input
                                value={newOrder.discountReason}
                                onChange={(e) => setNewOrder({ ...newOrder, discountReason: e.target.value })}
                            />
                        </FormControl>

                        <Box mt={4} p={3} border="1px solid #ccc" borderRadius="md">
                            <Text>Сумма заказа: <strong>{total}₽</strong></Text>
                            <Text>С учётом скидки и кешбэка: <strong>{discounted}₽</strong></Text>
                        </Box>
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={() => {
                        resetOrder();
                        onClose();
                    }}>Отмена</Button>
                    <Button colorScheme="blue" onClick={handleCreateOrder}>Создать</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}