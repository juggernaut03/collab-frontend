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
    Spinner,
} from '@chakra-ui/react';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, {
                _id: data._id,
                username: data.username,
                email: data.email,
            });
            toast({
                title: 'Login successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err: any) {
            toast({
                title: 'Login failed',
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
                        <Heading fontSize="4xl">Sign in to your account</Heading>
                        <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }}>
                            to enjoy all of our cool <ChakraLink color="blue.400">features</ChakraLink> ✌️
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
                            <Stack spacing={10}>
                                <Stack
                                    direction={{ base: 'column', sm: 'row' }}
                                    align="start"
                                    justify="space-between"
                                >
                                    <ChakraLink color="blue.400">Forgot password?</ChakraLink>
                                </Stack>
                                <Button
                                    bg="blue.400"
                                    color="white"
                                    _hover={{
                                        bg: 'blue.500',
                                    }}
                                    type="submit"
                                    isLoading={isLoading}
                                >
                                    Sign in
                                </Button>
                            </Stack>
                            <Stack pt={6}>
                                <Text align="center">
                                    Don't have an account?{' '}
                                    <Link href="/register" passHref>
                                        <ChakraLink color="blue.400">Sign up</ChakraLink>
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
