import React , { useCallback,useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhone } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import io from 'socket.io-client';


const Meeting = () => {
  console.log('Meeting component mounted');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const roomId = 'abc'; // Replace with dynamic room ID

  useEffect(() => {
    // Initialize the socket connection
    console.log('Connecting to socket server...\n');
    socketRef.current = io('http://localhost:5000');
    console.log('Connected to socket server by sending connection to server\n');

    // Join the room
    
    socketRef.current.on('connect', () => {
      console.log(`Joining room... where roomId = ${roomId} and socketRef.current.id = ${socketRef.current.id}`);
      socketRef.current.emit('join-room', roomId, socketRef.current.id);
    });
    

    // Handle when another user connects
    socketRef.current.on('user-connected', (userId) => {
      console.log('user connected recieved by client', userId);
      createOffer();
      console.log('Offer created\n');
    });

    // Handle receiving an offer
    socketRef.current.on('offer', async (data) => {
      console.log('Received offer: by client', data);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));

      const answer = await peerConnectionRef.current.createAnswer();
      console.log('Created answer: by client', answer);
      await peerConnectionRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { answer, roomId });
      console.log('Answer sent to server\n');
    });

    // Handle receiving an answer
    socketRef.current.on('answer', async (data) => {
      console.log('Received answer: by client', data);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    // Handle receiving an ICE candidate
    socketRef.current.on('ice-candidate', async (data) => {
      try {
        console.log('Received ICE candidate: by client', data);
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    // Clean up when component unmounts
    return () => {
      console.log('Disconnecting from socket server...');
      socketRef.current.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Initialize the RTCPeerConnection
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
        }
      ]
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { candidate: event.candidate, roomId });
        console.log('ICE candidate sent to server by client', event.candidate);
      }
    };

    // Handle receiving remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current = peerConnection;
  }, []);

  const createOffer = async () => {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    console.log('Created offer by client and sent to server', offer);
    socketRef.current.emit('offer', { offer, roomId });
  };

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
    }
  },[isMuted, localStream]);

  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        // Request video access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setIsVideoOn(true);

        // Display the video preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Add tracks to peer connection
        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
      } else {
        // Stop the video stream
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setIsVideoOn(false);
      }
    } catch (error) {
      console.error('Error accessing video:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(stream);
        setIsScreenSharing(true);

        // Display the screen share preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Add tracks to peer connection
        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
      } catch (error) {
        console.error('Error accessing screen share:', error);
      }
    } else {
      // Stop the screen share stream
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsScreenSharing(false);
    }
  };

  const endMeeting = () => {
    // End meeting logic, then redirect
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <div className="bg-blue-600 w-full py-4 text-center text-white">
        <h2 className="text-2xl font-semibold">Meeting</h2>
      </div>
      <div className="flex-1 flex justify-center items-center bg-gray-800 w-full">
        <div className="text-center text-white">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${isVideoOn ? '' : 'hidden'}`}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${remoteStream ? '' : 'hidden'}`}
          />
          <img
            src="https://via.placeholder.com/150"
            alt="User"
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${isVideoOn ? 'hidden' : ''}`}
          />
          <p>Waiting for other participants to join...</p>
        </div>
      </div>
      <div className="flex justify-around w-full max-w-md py-4 bg-white border-t border-gray-300">
        <Button variant="ghost" onClick={toggleMute}>
          {isMuted ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
        </Button>
        <Button variant="ghost" onClick={toggleVideo}>
          {isVideoOn ? <FaVideoSlash className="text-xl" /> : <FaVideo className="text-xl" />}
        </Button>
        <Button variant="ghost" onClick={toggleScreenShare}>
          <FaDesktop className="text-xl" />
        </Button>
        <Button variant="destructive" onClick={endMeeting}>
          <FaPhone className="text-xl" />
        </Button>
      </div>
    </div>
  );
};

export default React.memo(Meeting);