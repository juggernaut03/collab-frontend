'use client';

import {
    Box,
    Container,
    Flex,
    HStack,
    Text,
    VStack,
    Link,
} from '@chakra-ui/react';
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react';

const socialLinks = [
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Github, url: 'https://github.com', label: 'GitHub' },
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
];

const footerLinks = [
    {
        title: 'Product',
        links: ['Features', 'Pricing', 'Templates', 'Integrations'],
    },
    {
        title: 'Resources',
        links: ['Blog', 'Help Center', 'Guides', 'API Docs'],
    },
    {
        title: 'Company',
        links: ['About', 'Careers', 'Contact', 'Partners'],
    },
    {
        title: 'Legal',
        links: ['Privacy', 'Terms', 'Security', 'Cookies'],
    },
];

export default function Footer() {
    return (
        <Box bg="#101828" pt="16" pb="8" px={{ base: '4', md: '8' }}>
            <Container maxW="7xl">
                <VStack spacing="12" align="start">
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        gap="16"
                        w="full"
                        justify="space-between"
                    >
                        {/* Left Column - Brand */}
                        <VStack align="start" spacing="4" maxW="355px">
                            <HStack spacing="2">
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    w="10"
                                    h="10"
                                    borderRadius="lg"
                                    bg="blue.500"
                                >
                                    <Text fontSize="xl" fontWeight="bold" color="white">
                                        C
                                    </Text>
                                </Box>
                                <Text
                                    fontSize="xl"
                                    fontWeight="semibold"
                                    color="white"
                                    letterSpacing="-0.02em"
                                >
                                    CollabTool
                                </Text>
                            </HStack>
                            <Text fontSize="md" color="#99a1af" lineHeight="1.5" maxW="329px">
                                Real-time collaboration made simple. Edit documents, share ideas,
                                and work together with your team seamlessly.
                            </Text>
                            <HStack spacing="4">
                                {socialLinks.map((social, idx) => (
                                    <Link
                                        key={idx}
                                        href={social.url}
                                        isExternal
                                        _hover={{ textDecoration: 'none' }}
                                    >
                                        <Box
                                            w="10"
                                            h="10"
                                            bg="#1e2939"
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            cursor="pointer"
                                            transition="background 0.2s"
                                            _hover={{ bg: '#2d3a4f' }}
                                        >
                                            <social.icon color="#99a1af" size={20} />
                                        </Box>
                                    </Link>
                                ))}
                            </HStack>
                        </VStack>

                        {/* Right Columns - Links */}
                        <Flex
                            direction={{ base: 'column', sm: 'row' }}
                            gap={{ base: '8', md: '16' }}
                            flexWrap="wrap"
                        >
                            {footerLinks.map((section, idx) => (
                                <VStack key={idx} align="start" spacing="4" minW="120px">
                                    <Text
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color="white"
                                        textTransform="uppercase"
                                        letterSpacing="0.05em"
                                    >
                                        {section.title}
                                    </Text>
                                    {section.links.map((link, linkIdx) => (
                                        <Link
                                            key={linkIdx}
                                            href="#"
                                            fontSize="sm"
                                            color="#99a1af"
                                            _hover={{ color: 'white', textDecoration: 'none' }}
                                            transition="color 0.2s"
                                        >
                                            {link}
                                        </Link>
                                    ))}
                                </VStack>
                            ))}
                        </Flex>
                    </Flex>

                    {/* Bottom Section */}
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'start', md: 'center' }}
                        w="full"
                        pt="8"
                        borderTopWidth="1px"
                        borderTopColor="#1e2939"
                        gap="4"
                    >
                        <Text fontSize="sm" color="#99a1af">
                            © {new Date().getFullYear()} CollabTool. All rights reserved.
                        </Text>
                        <HStack spacing="6">
                            <Link
                                href="#"
                                fontSize="sm"
                                color="#99a1af"
                                _hover={{ color: 'white', textDecoration: 'none' }}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                fontSize="sm"
                                color="#99a1af"
                                _hover={{ color: 'white', textDecoration: 'none' }}
                            >
                                Terms of Service
                            </Link>
                        </HStack>
                    </Flex>
                </VStack>
            </Container>
        </Box>
    );
}
