import React from "react";
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

const CreateCategoryModal = ({
    isOpen,
    onClose,
    handleCreateCategory,
    newCategory,
    setNewCategory,
    inputBg,
    inputTextColor,
}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Создать категорию</ModalHeader>
            <ModalBody>
                <FormControl>
                    <FormLabel>Название категории</FormLabel>
                    <Input
                        bg={inputBg}
                        color={inputTextColor}
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Введите название категории"
                    />
                </FormControl>
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>
                    Отмена
                </Button>
                <Button colorScheme="blue" onClick={handleCreateCategory}>
                    Создать
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);

export default CreateCategoryModal;
