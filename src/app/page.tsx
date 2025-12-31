'use client';

import Link from 'next/link';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    SimpleGrid,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { ArrowRight, Users, Zap, Shield } from 'lucide-react';
import Footer from '@/components/Footer';

export default function Home() {
    return (
        <>
            <Box bg={useColorModeValue('white', 'gray.900')} minH="100vh">
                {/* Navigation */}
                <Flex
                    as="nav"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    padding={6}
                    maxW="7xl"
                    mx="auto"
                >
                    <Heading as="h1" size="lg" letterSpacing={'tighter'} color="blue.500">
                        CollabTool
                    </Heading>
                    <Stack direction="row" spacing={4} align="center">
                        <Link href="/login" passHref>
                            <Button variant="ghost" colorScheme="gray">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register" passHref>
                            <Button colorScheme="blue" variant="solid">
                                Get Started
                            </Button>
                        </Link>
                    </Stack>
                </Flex>

                {/* Hero Section */}
                <Container maxW="7xl" pt={20} pb={16} textAlign="center">
                    <Heading
                        as="h1"
                        fontSize={{ base: '4xl', md: '6xl' }}
                        fontWeight="bold"
                        lineHeight="1.2"
                        mb={8}
                    >
                        Real-time collaboration <br />
                        <Text as="span" color="blue.500">
                            made simple.
                        </Text>
                    </Heading>
                    <Text
                        fontSize="xl"
                        color={useColorModeValue('gray.600', 'gray.400')}
                        maxW="2xl"
                        mx="auto"
                        mb={10}
                    >
                        Edit documents, share ideas, and work together with your team in real-time.
                        No lag, no conflicts, just smooth collaboration.
                    </Text>
                    <Stack direction="row" spacing={4} justify="center">
                        <Link href="/register" passHref>
                            <Button
                                size="lg"
                                colorScheme="blue"
                                rightIcon={<ArrowRight size={20} />}
                                height="3.5rem"
                                px={8}
                                fontSize="lg"
                            >
                                Start Collaborating
                            </Button>
                        </Link>
                    </Stack>

                    {/* Features */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={24}>
                        <Feature
                            icon={Zap}
                            title="Lightning Fast"
                            text="Real-time updates via WebSockets ensure you never miss a beat."
                            color="blue"
                        />
                        <Feature
                            icon={Users}
                            title="Team Focused"
                            text="Built for teams of all sizes with granular permission controls."
                            color="purple"
                        />
                        <Feature
                            icon={Shield}
                            title="Secure by Default"
                            text="Enterprise-grade security to keep your documents safe."
                            color="green"
                        />
                    </SimpleGrid>
                </Container>
            </Box>
            <Footer />
        </>
    );
}

interface FeatureProps {
    title: string;
    text: string;
    icon: any;
    color: string;
}

const Feature = ({ title, text, icon, color }: FeatureProps) => {
    return (
        <Box
            p={6}
            rounded="2xl"
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            textAlign="left"
        >
            <Flex
                w={12}
                h={12}
                align="center"
                justify="center"
                rounded="lg"
                bg={`${color}.100`}
                color={`${color}.600`}
                mb={4}
            >
                <Icon as={icon} w={6} h={6} />
            </Flex>
            <Heading as="h3" size="md" mb={2}>
                {title}
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
        </Box>
    );
};
