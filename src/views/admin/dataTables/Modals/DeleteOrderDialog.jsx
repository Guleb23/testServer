import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useToast,
    Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

const DeleteOrderDialog = ({
    isOpen,
    onClose,
    onDelete,
    orderId,
}) => {
    const cancelRef = useRef();
    const toast = useToast();

    const handleDelete = async () => {
        try {
            await onDelete(orderId);
            toast({
                title: 'Заказ удален',
                description: 'Заказ успешно удален.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить заказ.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            onClose();
        }
    };

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Удаление заказа
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Вы уверены? Это действие нельзя отменить.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Отмена
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDelete}
                            ml={3}
                        >
                            Удалить
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default DeleteOrderDialog;