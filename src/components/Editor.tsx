'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import 'react-quill/dist/quill.snow.css';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill');
        return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
    },
    { ssr: false }
);

interface EditorProps {
    documentId: string;
    socket: Socket | null;
}

const SAVE_INTERVAL_MS = 2000;

export default function Editor({ documentId, socket }: EditorProps) {
    const { user } = useAuth();
    // const [socket, setSocket] = useState<Socket | null>(null); // Removed local state
    const [value, setValue] = useState('');
    const quillRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const bg = useColorModeValue('white', 'gray.900');

    // Connect to Socket.io - MOVED TO PARENT
    useEffect(() => {
        if (socket) {
            if (socket.connected) {
                setIsConnected(true);
            }

            socket.on('connect', () => {
                console.log('Connected to socket server');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from socket server');
                setIsConnected(false);
            });
        }
    }, [socket]);

    // Join Document Room
    useEffect(() => {
        if (socket && documentId && isConnected) {
            console.log('Joining document room:', documentId);
            socket.emit('join-document', documentId);
        }
    }, [socket, documentId, isConnected]);

    // Load initial document content
    useEffect(() => {
        const loadDocument = async () => {
            try {
                const { data } = await api.get(`/documents/${documentId}`);
                if (data.content && quillRef.current) {
                    const editor = quillRef.current.getEditor();
                    // If content is a Delta object (has 'ops'), set it directly
                    if (data.content.ops) {
                        editor.setContents(data.content);
                    } else {
                        // Fallback for HTML string or empty
                        // editor.clipboard.dangerouslyPasteHTML(data.content);
                    }
                    setValue(editor.root.innerHTML);
                }
            } catch (error) {
                console.error('Failed to load document', error);
            }
        };

        // Wait for Quill to be ready
        if (quillRef.current) {
            loadDocument();
        } else {
            // Retry a bit later if ref is not ready yet (rare but possible with dynamic import)
            const timer = setTimeout(loadDocument, 100);
            return () => clearTimeout(timer);
        }
    }, [documentId]);

    // Handle receiving changes
    useEffect(() => {
        if (socket == null || quillRef.current == null) return;

        const handler = (delta: any) => {
            console.log('Received changes:', delta);
            const editor = quillRef.current.getEditor();
            editor.updateContents(delta);
            // Update local state so it doesn't revert on re-render
            setValue(editor.root.innerHTML);
        };

        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        };
    }, [socket]);

    // Handle text changes
    const handleChange = (content: string, delta: any, source: string, editor: any) => {
        // Update value regardless of source to keep state in sync
        setValue(content);

        if (source !== 'user') return;

        if (socket) {
            socket.emit('send-changes', delta, documentId);
        }
    };

    // Auto-save
    useEffect(() => {
        if (socket == null || quillRef.current == null) return;

        const interval = setInterval(() => {
            const content = quillRef.current.getEditor().getContents();
            socket.emit('save-document', content, documentId);
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 1000);
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [socket, documentId]);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };

    return (
        <Box
            bg={bg}
            rounded="lg"
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            h="calc(100vh - 200px)"
            display="flex"
            flexDirection="column"
        >
            <Flex
                p={2}
                borderBottomWidth="1px"
                borderColor={borderColor}
                justify="space-between"
                align="center"
            >
                <Text fontSize="xs" color={isConnected ? 'green.500' : 'red.500'}>
                    {isConnected ? '● Connected' : '○ Disconnected'}
                </Text>
                <Text fontSize="xs" color={isSaving ? 'blue.500' : 'gray.400'}>
                    {isSaving ? 'Saving...' : 'Saved'}
                </Text>
            </Flex>
            <Box flex="1" display="flex" flexDirection="column" sx={{
                '.quill': {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                },
                '.ql-container': {
                    flex: 1,
                    overflowY: 'auto',
                    fontSize: '16px',
                    border: 'none !important',
                },
                '.ql-toolbar': {
                    borderTop: 'none !important',
                    borderLeft: 'none !important',
                    borderRight: 'none !important',
                    borderBottom: `1px solid ${borderColor} !important`,
                }
            }}>
                <ReactQuill
                    forwardedRef={quillRef}
                    theme="snow"
                    value={value}
                    onChange={handleChange}
                    modules={modules}
                />
            </Box>
        </Box>
    );
}
