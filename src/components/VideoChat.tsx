'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, IconButton, Text, useToast } from '@chakra-ui/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VideoChatProps {
    socket: Socket | null;
    documentId: string;
    user: any;
}

interface PeerConnection {
    peerId: string;
    connection: RTCPeerConnection;
}

const STUN_SERVERS = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
};

export default function VideoChat({ socket, documentId, user }: VideoChatProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<PeerConnection[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const userVideo = useRef<HTMLVideoElement>(null);
    const peersRef = useRef<PeerConnection[]>([]);
    const toast = useToast();

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            stream?.getTracks().forEach(track => track.stop());
            peersRef.current.forEach(p => p.connection.close());
        };
    }, []);

    const joinCall = async () => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setStream(localStream);
            if (userVideo.current) {
                userVideo.current.srcObject = localStream;
            }
            setIsJoined(true);

            if (socket) {
                socket.emit('join-video', documentId);

                socket.on('all-users', (users: string[]) => {
                    const peers: PeerConnection[] = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socket.id!, localStream);
                        peersRef.current.push({
                            peerId: userID,
                            connection: peer,
                        });
                        peers.push({
                            peerId: userID,
                            connection: peer,
                        });
                    });
                    setPeers(peers);
                });

                socket.on('offer', handleReceiveOffer);
                socket.on('answer', handleReceiveAnswer);
                socket.on('ice-candidate', handleReceiveIceCandidate);
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
            toast({
                title: 'Error',
                description: 'Could not access camera or microphone',
                status: 'error',
            });
        }
    };

    const leaveCall = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        peersRef.current.forEach(p => p.connection.close());
        peersRef.current = [];
        setPeers([]);
        setIsJoined(false);
        if (socket) {
            // socket.emit('leave-video', documentId); // Implement if needed
        }
    };

    const createPeer = (userToSignal: string, callerID: string, stream: MediaStream) => {
        const peer = new RTCPeerConnection(STUN_SERVERS);

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit('ice-candidate', {
                    target: userToSignal,
                    candidate: event.candidate,
                });
            }
        };

        peer.ontrack = (event) => {
            // Handle remote stream
            // We need to update the state to render a video element for this peer
            // But since we store the connection in state, we can access it in the render loop
            // or we can force a re-render.
            // A better way is to have a separate component for each peer video.
        };

        peer.createOffer().then(offer => {
            peer.setLocalDescription(offer);
            socket?.emit('offer', {
                target: userToSignal,
                caller: callerID,
                sdp: offer,
            });
        });

        return peer;
    };

    const handleReceiveOffer = (payload: any) => {
        if (!stream) return; // Should not happen if joined
        const peer = new RTCPeerConnection(STUN_SERVERS);

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit('ice-candidate', {
                    target: payload.caller,
                    candidate: event.candidate,
                });
            }
        };

        peer.setRemoteDescription(payload.sdp);
        peer.createAnswer().then(answer => {
            peer.setLocalDescription(answer);
            socket?.emit('answer', {
                target: payload.caller,
                caller: socket.id,
                sdp: answer,
            });
        });

        const peerObj = {
            peerId: payload.caller,
            connection: peer,
        };

        peersRef.current.push(peerObj);
        setPeers(prev => [...prev, peerObj]);
    };

    const handleReceiveAnswer = (payload: any) => {
        const item = peersRef.current.find(p => p.peerId === payload.caller);
        if (item) {
            item.connection.setRemoteDescription(payload.sdp);
        }
    };

    const handleReceiveIceCandidate = (payload: any) => {
        const item = peersRef.current.find(p => p.peerId === payload.caller); // Sender of candidate
        if (item) {
            item.connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!isJoined) {
        return (
            <Button leftIcon={<Video size={20} />} colorScheme="green" onClick={joinCall}>
                Join Video Call
            </Button>
        );
    }

    return (
        <Box position="fixed" bottom="20px" right="20px" bg="gray.800" p={4} rounded="xl" shadow="2xl" width="300px" zIndex={1000}>
            <Grid templateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap={2} mb={4}>
                {/* Local Video */}
                <Box position="relative" bg="black" rounded="lg" overflow="hidden" h="150px">
                    <video ref={userVideo} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Text position="absolute" bottom="1" left="2" color="white" fontSize="xs">You</Text>
                </Box>

                {/* Remote Peers */}
                {peers.map((peer) => (
                    <RemoteVideo key={peer.peerId} peer={peer.connection} />
                ))}
            </Grid>

            <Box display="flex" justifyContent="center" gap={4}>
                <IconButton
                    aria-label="Toggle Mute"
                    icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    onClick={toggleMute}
                    colorScheme={isMuted ? 'red' : 'gray'}
                    rounded="full"
                    size="sm"
                />
                <IconButton
                    aria-label="Toggle Video"
                    icon={isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    onClick={toggleVideo}
                    colorScheme={isVideoOff ? 'red' : 'gray'}
                    rounded="full"
                    size="sm"
                />
                <IconButton
                    aria-label="Leave Call"
                    icon={<PhoneOff size={20} />}
                    onClick={leaveCall}
                    colorScheme="red"
                    rounded="full"
                    size="sm"
                />
            </Box>
        </Box>
    );
}

const RemoteVideo = ({ peer }: { peer: RTCPeerConnection }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        peer.ontrack = (event) => {
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
        };
    }, [peer]);

    return (
        <Box position="relative" bg="black" rounded="lg" overflow="hidden" h="150px">
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
    );
};
