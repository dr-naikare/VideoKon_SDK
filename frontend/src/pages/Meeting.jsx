import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhone } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom'; 

const VideoKon = () => {
  console.log("meeting page rendered");
  const [myAudio, setMyAudio] = useState(true);
  const [myVideo, setMyVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const { roomId } = useParams(); // Extract roomId from URL
  let currentUser;

  // This is for first connecting to the server using socket.io
  useEffect(() => {
    // Create a new RTCPeerConnection instance
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
        }
      ]
    });

    // Get user media (audio and video)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

        // Create offer immediately
        createOffer();
      })
      .catch(err => {
        console.error("Error getting user media:", err);
      });

    // Connect to the socket server
    socketRef.current = io('http://localhost:5000');

    // Handle connection event
    socketRef.current.on('connect', () => {
      currentUser = socketRef.current.id;
      console.log(`${currentUser} is connected to the server`);
      socketRef.current.emit('join-room', roomId, currentUser);
    });

    // Handle user connected event
    socketRef.current.on('user-connected', userId => {
      console.log(`${userId} connected to the room`);
      // No need to create an offer here, it's already created for the first user
    });

    // Handle ICE candidate event
    peerConnectionRef.current.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { candidate: event.candidate, roomId });
        console.log('ICE candidate sent to server by client', event.candidate);
      }
    };

    // Handle remote stream track event (This will be triggered during offer creation)
    peerConnectionRef.current.ontrack = event => {
      console.log(`Remote stream received by ${currentUser}`);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }

      // Handle track removal
      event.streams[0].getTracks().forEach(track => {
        track.onremovetrack = () => {
          console.log(`Remote stream removed by ${currentUser}`);
          setRemoteStream(null); // Update the state when the track is removed
          remoteVideoRef.current.srcObject = null; 
        };
      });
    };

    socketRef.current.on('user-disconnected', userId => {
      console.log(`${userId} disconnected from the room`);
      if (userId !== currentUser) {
        console.log(`Remote stream removed by ${currentUser}`);
        setRemoteStream(null); // Update the state when the track is removed
        remoteVideoRef.current.srcObject = null; 
      }
    });

    // Handle offer event
    socketRef.current.on('offer', async data => {
      console.log(`Offer received from ${data.offerby} by ${currentUser}`);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer)).then(
        async () => {
          await peerConnectionRef.current.createAnswer().then(
            async answer => {
              await peerConnectionRef.current.setLocalDescription(answer).then(
                () => {
                  console.log('Local description set successfully');
                  socketRef.current.emit('answer', { answer, roomId, answerby: currentUser });
                  console.log(`Answer sent to the server by ${currentUser}`);
                }
              );
            }
          );
        }
      );
    });

    // Handle answer event
    socketRef.current.on('answer', async data => {
      console.log(`Answer received from ${data.answerby} by ${currentUser}`);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log(`Remote description set successfully and the signaling state is ${peerConnectionRef.current.signalingState}`);
    });

    // Handle ICE candidate event (from server)
    socketRef.current.on('ice-candidate', async data => {
      try {
        console.log('Received ICE candidate: by client', data);
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    // Clean up resources on component unmount
    return () => {
      console.log('Disconnecting from socket server...');
      if (socketRef.current) {
        socketRef.current.emit('disconnect', currentUser);
        socketRef.current.disconnect();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Create an offer to start the connection (Call this immediately after getting user media)
  const createOffer = async () => {
    await peerConnectionRef.current.createOffer().then(
      async offer => {
        await peerConnectionRef.current.setLocalDescription(offer).then(
          () => {
            console.log('Local description set successfully');
            socketRef.current.emit('offer', { offer, roomId, offerby: currentUser });
            console.log(`Offer sent to the server by ${currentUser}`);
          }
        );
      }
    );
  };

  // useEffect to log audio and video states
  useEffect(() => {
    console.log("audio is", myAudio);
    console.log("video is", myVideo);
  }, [myAudio, myVideo]);

  // Toggle mute functionality
  const toggleMute = () => {
    setMyAudio(!myAudio);
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  // Toggle video functionality
  const toggleVideo = () => {
    setMyVideo(!myVideo);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  // Toggle screen share functionality (not implemented yet)
  const toggleScreenShare = () => {
    if (!isScreenSharing) {
      // Start screen share logic
      console.log("Start screen sharing...");
    } else {
      // Stop screen share logic
      console.log("Stop screen sharing...");
    }
    setIsScreenSharing(!isScreenSharing);
  };

  // End meeting functionality
  const endMeeting = () => {
    // End meeting logic, then redirect
    if (socketRef.current) {
      socketRef.current.emit('User-disconnect', currentUser);
      socketRef.current.disconnect();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <div className="bg-blue-600 w-full py-4 text-center text-white">
        <h2 className="text-2xl font-semibold">VideoKon</h2>
      </div>
      <div className="flex-1 flex justify-center items-center bg-gray-800 w-full">
        <div className="text-center text-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${myVideo ? '' : 'hidden'}`}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${remoteStream ? '' : 'hidden'}`}
          />
          <img
            src="https://via.placeholder.com/150"
            alt="User"
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${myVideo ? 'hidden' : ''}`}
          />
          <p>Waiting for other participants to join...</p>
        </div>
      </div>
      <div className="flex justify-around w-full max-w-md py-4 bg-white border-t border-gray-300">
        <Button variant="ghost" onClick={toggleMute}>
          {myAudio ? <FaMicrophone className="text-xl" /> : <FaMicrophoneSlash className="text-xl" />}
        </Button>
        <Button variant="ghost" onClick={toggleVideo}>
          {myVideo ? <FaVideo className="text-xl" /> : <FaVideoSlash className="text-xl" />}
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

export default VideoKon;