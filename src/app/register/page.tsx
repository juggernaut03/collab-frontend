'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    Link as ChakraLink,
    Flex,
} from '@chakra-ui/react';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/register', {
                username,
                email,
                password,
            });
            login(data.token, {
                _id: data._id,
                username: data.username,
                email: data.email,
            });
            toast({
                title: 'Account created.',
                description: "We've created your account for you.",
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err: any) {
            toast({
                title: 'Registration failed',
                description: err.response?.data?.message || 'Something went wrong',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
            <Container maxW="md" py={12} px={6}>
                <Stack spacing={8} mx="auto" maxW="lg">
                    <Stack align="center">
                        <Heading fontSize="4xl" textAlign="center">
                            Sign up
                        </Heading>
                        <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }}>
                            to start collaborating today 🚀
                        </Text>
                    </Stack>
                    <Box
                        rounded="lg"
                        bg="white"
                        _dark={{ bg: 'gray.800' }}
                        boxShadow="lg"
                        p={8}
                    >
                        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
                            <FormControl id="username" isRequired>
                                <FormLabel>Username</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <UserIcon size={20} color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl id="email" isRequired>
                                <FormLabel>Email address</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Mail size={20} color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <Lock size={20} color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <Stack spacing={10} pt={2}>
                                <Button
                                    loadingText="Submitting"
                                    size="lg"
                                    bg="blue.400"
                                    color="white"
                                    _hover={{
                                        bg: 'blue.500',
                                    }}
                                    type="submit"
                                    isLoading={isLoading}
                                >
                                    Sign up
                                </Button>
                            </Stack>
                            <Stack pt={6}>
                                <Text align="center">
                                    Already have an account?{' '}
                                    <Link href="/login" passHref>
                                        <ChakraLink color="blue.400">Login</ChakraLink>
                                    </Link>
                                </Text>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Flex>
    );
}
