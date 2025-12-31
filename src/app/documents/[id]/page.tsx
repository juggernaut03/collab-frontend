'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Editor from '@/components/Editor';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    IconButton,
    Input,
    Spinner,
    Text,
    useColorModeValue,
    HStack,
    Avatar,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    useToast,
} from '@chakra-ui/react';

import { io, Socket } from 'socket.io-client';
import VideoChat from '@/components/VideoChat';

export default function DocumentPage() {
    const { id } = useParams();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [document, setDocument] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [shareEmail, setShareEmail] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const toast = useToast();
    const [socket, setSocket] = useState<Socket | null>(null);

    const bg = useColorModeValue('gray.50', 'gray.900');
    const headerBg = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.800');

    useEffect(() => {
        const s = io('http://localhost:5001');
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const { data } = await api.get(`/documents/${id}`);
                setDocument(data);
                setTitle(data.title || 'Untitled Document');
            } catch (error) {
                console.error('Failed to fetch document', error);
                router.push('/dashboard');
            }
        };

        if (id && user) {
            fetchDocument();
        }
    }, [id, user, router]);

    const updateTitle = async () => {
        try {
            await api.put(`/documents/${id}`, { title });
            setIsEditingTitle(false);
        } catch (error) {
            console.error('Failed to update title', error);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await api.post(`/documents/${id}/share`, { email: shareEmail });
            toast({
                title: 'Document shared',
                description: `Successfully shared with ${shareEmail}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setShareEmail('');
            onClose();
        } catch (error: any) {
            toast({
                title: 'Share failed',
                description: error.response?.data?.message || 'Something went wrong',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSharing(false);
        }
    };

    if (loading || !document) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="xl" color="blue.500" />
            </Flex>
        );
    }

    return (
        <Flex direction="column" minH="100vh" bg={bg}>
            {/* Header */}
            <Box
                bg={headerBg}
                borderBottomWidth="1px"
                borderColor={borderColor}
                h="16"
                px={4}
            >
                <Flex h="full" align="center" justify="space-between">
                    <HStack spacing={4}>
                        <Link href="/dashboard" passHref>
                            <IconButton
                                aria-label="Back to dashboard"
                                icon={<ArrowLeft size={20} />}
                                variant="ghost"
                                size="sm"
                            />
                        </Link>

                        <Flex direction="column">
                            {isEditingTitle ? (
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={updateTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && updateTitle()}
                                    autoFocus
                                    size="sm"
                                    variant="flushed"
                                    fontWeight="bold"
                                    fontSize="lg"
                                />
                            ) : (
                                <Heading
                                    size="md"
                                    cursor="pointer"
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
                                    px={2}
                                    rounded="md"
                                    onClick={() => setIsEditingTitle(true)}
                                >
                                    {title}
                                </Heading>
                            )}
                            <Text fontSize="xs" color="gray.500" px={2}>
                                {document.owner === user?._id ? 'Owner' : 'Collaborator'}
                            </Text>
                        </Flex>
                    </HStack>

                    <HStack spacing={2}>
                        <Button
                            leftIcon={<Share2 size={16} />}
                            size="sm"
                            variant="outline"
                            onClick={onOpen}
                            isDisabled={document.owner !== user?._id}
                        >
                            Share
                        </Button>
                        <Avatar
                            size="sm"
                            name={user?.username}
                            bg="blue.500"
                            color="white"
                        />
                    </HStack>
                </Flex>
            </Box>

            {/* Editor Container */}
            <Box flex="1" p={4} overflow="hidden">
                <Container maxW="5xl" h="full" p={0}>
                    <Editor documentId={id as string} socket={socket} />
                </Container>
            </Box>

            <VideoChat socket={socket} documentId={id as string} user={user} />


            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Share Document</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Email address</FormLabel>
                            <Input
                                placeholder="Enter email to share with"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleShare} isLoading={isSharing}>
                            Share
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Video Chat Integration - Pass socket if available, but we need to access the socket from Editor or lift state up. 
                For now, let's assume VideoChat manages its own socket or we lift socket state.
                Actually, Editor manages the socket. We should probably lift the socket state to DocumentPage 
                or have a separate socket context.
                
                For simplicity, let's create a new socket connection in VideoChat or pass it down.
                Creating multiple sockets is okay but not ideal.
                Let's try to pass the socket from Editor? No, Editor is a child.
                
                Refactoring: Let's move socket connection to DocumentPage and pass it to both Editor and VideoChat.
            */}
        </Flex>
    );
}
