'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    SimpleGrid,
    Text,
    Spinner,
    IconButton,
    useColorModeValue,
    HStack,
    Badge,
} from '@chakra-ui/react';
import { Plus, FileText, Trash2, LogOut } from 'lucide-react';

interface Document {
    _id: string;
    title: string;
    updatedAt: string;
    owner: string;
}

export default function Dashboard() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/documents');
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const createDocument = async () => {
        try {
            const { data } = await api.post('/documents');
            router.push(`/documents/${data._id}`);
        } catch (error) {
            console.error('Failed to create document', error);
        }
    };

    const deleteDocument = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter((doc) => doc._id !== id));
        } catch (error) {
            console.error('Failed to delete document', error);
            alert('Failed to delete document. You might not be the owner.');
        }
    };

    if (loading || !user) {
        return (
            <Flex h="100vh" align="center" justify="center">
                <Spinner size="xl" color="blue.500" />
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg={bg}>
            {/* Header */}
            <Box bg={cardBg} borderBottom="1px" borderColor={borderColor}>
                <Container maxW="7xl" py={4}>
                    <Flex align="center" justify="space-between">
                        <HStack spacing={2}>
                            <Flex
                                p={1.5}
                                rounded="lg"
                                bg="blue.500"
                                color="white"
                                align="center"
                                justify="center"
                            >
                                <FileText size={20} />
                            </Flex>
                            <Heading size="md">Dashboard</Heading>
                        </HStack>
                        <HStack spacing={4}>
                            <Text fontSize="sm" color="gray.500">
                                Welcome, {user.username}
                            </Text>
                            <IconButton
                                aria-label="Logout"
                                icon={<LogOut size={20} />}
                                variant="ghost"
                                colorScheme="red"
                                onClick={logout}
                            />
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxW="7xl" py={8}>
                <Flex align="center" justify="space-between" mb={8}>
                    <Heading size="lg">Your Documents</Heading>
                    <Button
                        leftIcon={<Plus size={20} />}
                        colorScheme="blue"
                        onClick={createDocument}
                    >
                        New Document
                    </Button>
                </Flex>

                {isLoadingDocs ? (
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                        {[1, 2, 3].map((i) => (
                            <Box
                                key={i}
                                h="160px"
                                bg={useColorModeValue('gray.200', 'gray.700')}
                                rounded="xl"
                                animation="pulse 2s infinite"
                            />
                        ))}
                    </SimpleGrid>
                ) : documents.length === 0 ? (
                    <Box textAlign="center" py={20}>
                        <Flex
                            w={16}
                            h={16}
                            bg={useColorModeValue('gray.100', 'gray.800')}
                            rounded="full"
                            align="center"
                            justify="center"
                            mx="auto"
                            mb={4}
                        >
                            <FileText size={32} color="gray" />
                        </Flex>
                        <Heading size="md" mb={2}>
                            No documents yet
                        </Heading>
                        <Text color="gray.500">
                            Create your first document to get started.
                        </Text>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                        {documents.map((doc) => (
                            <Link key={doc._id} href={`/documents/${doc._id}`} passHref>
                                <Box
                                    as="a"
                                    display="block"
                                    bg={cardBg}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    rounded="xl"
                                    p={6}
                                    transition="all 0.2s"
                                    _hover={{
                                        shadow: 'lg',
                                        borderColor: 'blue.400',
                                        transform: 'translateY(-2px)',
                                    }}
                                    position="relative"
                                    role="group"
                                >
                                    <Flex justify="space-between" align="start" mb={4}>
                                        <Flex
                                            p={2}
                                            bg="blue.50"
                                            _dark={{ bg: 'blue.900' }}
                                            color="blue.500"
                                            rounded="lg"
                                        >
                                            <FileText size={24} />
                                        </Flex>
                                        {doc.owner === user._id && (
                                            <IconButton
                                                aria-label="Delete document"
                                                icon={<Trash2 size={16} />}
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                opacity={0}
                                                _groupHover={{ opacity: 1 }}
                                                onClick={(e) => deleteDocument(e, doc._id)}
                                            />
                                        )}
                                    </Flex>
                                    <Heading size="md" mb={2} noOfLines={1}>
                                        {doc.title || 'Untitled Document'}
                                    </Heading>
                                    <Text fontSize="sm" color="gray.500">
                                        Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                                    </Text>
                                </Box>
                            </Link>
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </Box>
    );
}
