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
    useToast,
} from "@chakra-ui/react";

const CreateCategoryModal = ({
    isOpen,
    onClose,
    handleCreateCategory,
    newCategory,
    setNewCategory,
    inputBg,
    inputTextColor,
}) => {
    const toast = useToast();

    const validateAndSubmit = () => {
        if (!newCategory.name || newCategory.name.trim() === "") {
            toast({
                title: "Ошибка",
                description: "Название категории не может быть пустым",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        handleCreateCategory();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Создать категорию</ModalHeader>
                <ModalBody>
                    <FormControl isRequired>
                        <FormLabel>Название категории</FormLabel>
                        <Input
                            bg={inputBg}
                            color={inputTextColor}
                            value={newCategory.name}
                            onChange={(e) =>
                                setNewCategory({ ...newCategory, name: e.target.value })
                            }
                            placeholder="Введите название категории"
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button colorScheme="blue" onClick={validateAndSubmit}>
                        Создать
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateCategoryModal;