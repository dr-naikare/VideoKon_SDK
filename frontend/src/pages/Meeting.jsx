import { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhone,
  FaUsers,
  FaComment,
  FaTimes,
} from "react-icons/fa";
import { Button } from "../components/ui/button";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const VideoKon = () => {
  const [myAudio, setMyAudio] = useState(true);
  const [myVideo, setMyVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const peerConnectionsRef = useRef({});
  const socketRef = useRef(null);
  const { roomId } = useParams();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [activePanel, setActivePanel] = useState(null);
  const currentUser = 'User';

  useEffect(() => {
    let localStream;

    const createPeerConnection = (userId) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            roomId,
            userId: socketRef.current.id,
            targetUserId: userId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        setRemoteStreams((prevStreams) => ({
          ...prevStreams,
          [userId]: event.streams[0],
        }));
      };

      return peerConnection;
    };

    const startWebRTC = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        socketRef.current = io("http://localhost:5000");

        socketRef.current.on("connect", () => {
          socketRef.current.emit("join-room", roomId, socketRef.current.id);
        });

        socketRef.current.on("user-connected", async (userId) => {
          console.log(`User connected: ${userId}`);
          const peerConnection = createPeerConnection(userId);
          peerConnectionsRef.current[userId] = peerConnection;

          localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          socketRef.current.emit("offer", {
            offer: peerConnection.localDescription,
            roomId,
            userId: socketRef.current.id,
            targetUserId: userId,
          });
        });

        socketRef.current.on("user-disconnected", (userId) => {
          if (peerConnectionsRef.current[userId]) {
            peerConnectionsRef.current[userId].close();
            delete peerConnectionsRef.current[userId];
            setRemoteStreams((prevStreams) => {
              const newStreams = { ...prevStreams };
              delete newStreams[userId];
              return newStreams;
            });
          }
        });

        socketRef.current.on("offer", async ({ offer, userId }) => {
          console.log(`Offer received from ${userId}`);
          const peerConnection = createPeerConnection(userId);
          peerConnectionsRef.current[userId] = peerConnection;

          localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socketRef.current.emit("answer", {
            answer: peerConnection.localDescription,
            roomId,
            userId: socketRef.current.id,
            targetUserId: userId,
          });
        });

        socketRef.current.on("answer", async ({ answer, userId }) => {
          console.log(`Answer received from ${userId}`);
          const peerConnection = peerConnectionsRef.current[userId];
          if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socketRef.current.on("ice-candidate", async ({ candidate, userId }) => {
          const peerConnection = peerConnectionsRef.current[userId];
          if (peerConnection) {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
              console.error("Error adding ICE candidate:", error);
            }
          }
        });
      } catch (error) {
        console.error("Error starting WebRTC:", error);
      }
    };

    startWebRTC();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("user-disconnect", socketRef.current.id);
        socketRef.current.disconnect();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(peerConnectionsRef.current).forEach((peerConnection) =>
        peerConnection.close()
      );
    };
  }, [roomId]);

  useEffect(() => {
    Object.keys(remoteStreams).forEach((userId) => {
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = remoteStreams[userId];
      }
    });
  }, [remoteStreams]);

  const toggleMute = () => {
    setMyAudio(!myAudio);
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
  };

  const toggleVideo = () => {
    setMyVideo(!myVideo);
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionsRef.current.getSenders().find(s => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(screenTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      screenTrack.onended = () => {
        const videoTrack = localStream.getVideoTracks()[0];
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      };
      setIsScreenSharing(true);
    } else {
      console.log("Stop screen sharing...");
    }
    setIsScreenSharing(!isScreenSharing);
  };

  const endMeeting = () => {
    if (socketRef.current) {
      socketRef.current.emit("User-disconnect", socketRef.current.id);
      socketRef.current.disconnect();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    Object.values(peerConnectionsRef.current).forEach((peerConnection) =>
      peerConnection.close()
    );
    window.location.href = "/";
  };

  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const message = { text: currentMessage, sender: currentUser, timestamp: new Date() };
      socketRef.current.emit('chat-message', message);
      setMessages(prevMessages => [...prevMessages, message]);
      setCurrentMessage('');
    }
  };

  const totalPages = Math.ceil(participants.length / participantsPerPage);
  const startIndex = currentPage * participantsPerPage;
  const currentParticipants = participants.slice(startIndex, startIndex + participantsPerPage);

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 relative">
      <div className="bg-blue-600 w-full py-4 text-center text-white">
        <h2 className="text-2xl font-semibold">VideoKon</h2>
      </div>
      <div className="main-video-container flex-1 flex justify-center items-center bg-gray-800 w-full relative">
      {Object.keys(remoteStreams).map((userId, index) => (
            <video
              key={index}
              ref={(el) => (remoteVideoRefs.current[userId] = el)}
              autoPlay
              playsInline
              className={`rounded-full w-36 h-36 mx-auto mb-4`}
            />
          ))}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute bottom-4 left-4 w-36 h-36 rounded-lg border-2 border-white ${myVideo ? '' : 'hidden'}`}
        />
        {!myVideo && (
          <img
            src="https://via.placeholder.com/150"
            alt="User"
            className="absolute bottom-4 left-4 w-36 h-36 rounded-lg border-2 border-white"
          />
        )}
        {!remoteStreams && (
          <p className="absolute text-white text-lg">Waiting for other participants to join...</p>
        )}
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
        <Button variant="ghost" onClick={() => setActivePanel('participants')}>
          <FaUsers className="text-xl" />
        </Button>
        <Button variant="ghost" onClick={() => setActivePanel('chat')}>
          <FaComment className="text-xl" />
        </Button>
        <Button variant="ghost" onClick={endMeeting}>
          <FaPhone className="text-xl text-red-600" />
        </Button>
      </div>
      {activePanel === 'participants' && (
        <div className="participant-panel bg-white w-full max-w-md rounded-lg shadow-lg absolute top-20 right-4 z-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Participants</h3>
            <Button onClick={() => setActivePanel(null)}><FaTimes /></Button>
          </div>
          <div className="p-4">
            {currentParticipants.map(participant => (
              <div key={participant.id} className="flex justify-between items-center py-2">
                <span>{participant.id}</span>
                <span>{participant.video ? '🎥' : '📵'}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <Button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      {activePanel === 'chat' && (
        <div className="chat-panel bg-white w-full max-w-md rounded-lg shadow-lg absolute top-20 left-4 z-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Chat</h3>
            <Button onClick={() => setActivePanel(null)}><FaTimes /></Button>
          </div>
          <div className="p-4 max-h-60 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="py-1">
                <strong>{msg.sender}: </strong>{msg.text}
              </div>
            ))}
          </div>
          <div className="p-4 flex">
            <input
              type="text"
              value={currentMessage}
              onChange={handleMessageChange}
              className="flex-1 border border-gray-300 p-2 rounded"
              placeholder="Type a message..."
            />
            <Button onClick={handleSendMessage} className="ml-2">Send</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoKon;
