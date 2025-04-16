import React from "react";
import InputMask from "react-input-mask";
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
} from "@chakra-ui/react";

const CreateClientModal = ({
    isOpen,
    onClose,
    handleCreateClient,
    newClient,
    setNewClient,
    inputBg,
    inputTextColor,
}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Создать клиента</ModalHeader>
            <ModalBody>
                <FormControl>
                    <FormLabel>ФИО</FormLabel>
                    <Input
                        bg={inputBg}
                        color={inputTextColor}
                        value={newClient.FullName}
                        onChange={(e) => setNewClient({ ...newClient, FullName: e.target.value })}
                        placeholder="Введите ФИО клиента"
                    />
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel>Телефон</FormLabel>
                    <Input
                        as={InputMask}
                        mask="+7 (999) 999-99-99"
                        bg={inputBg}
                        color={inputTextColor}
                        value={newClient.Phone}
                        onChange={(e) => setNewClient({ ...newClient, Phone: e.target.value })}
                        placeholder="+7 (___) ___-__-__"
                    />
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel>Адрес</FormLabel>
                    <Input
                        bg={inputBg}
                        color={inputTextColor}
                        value={newClient.Address}
                        onChange={(e) => setNewClient({ ...newClient, Address: e.target.value })}
                        placeholder="Введите адрес"
                    />
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel>Комментарий</FormLabel>
                    <Input
                        bg={inputBg}
                        color={inputTextColor}
                        value={newClient.Comment}
                        onChange={(e) => setNewClient({ ...newClient, Comment: e.target.value })}
                        placeholder="Введите комментарий"
                    />
                </FormControl>
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>
                    Отмена
                </Button>
                <Button colorScheme="blue" onClick={handleCreateClient}>
                    Создать
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);

export default CreateClientModal;
