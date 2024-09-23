import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhone, FaUsers, FaComment, FaTimes } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom'; 

const VideoKon = () => {
  const [myAudio, setMyAudio] = useState(true);
  const [myVideo, setMyVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const { roomId } = useParams();
  const [activePanel, setActivePanel] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const participantsPerPage = 6;

  let currentUser;

  useEffect(() => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
        createOffer();
      })
      .catch(err => console.error("Error getting user media:", err));

    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      currentUser = socketRef.current.id;
      socketRef.current.emit('join-room', roomId, currentUser);
    });

    socketRef.current.on('existing-participants', (participants) => {
      setParticipants(participants);
    });

    socketRef.current.on('user-connected', userId => {
      setParticipants(prev => [...prev, { id: userId, video: true, audio: true }]);
    });

    socketRef.current.on('user-disconnected', userId => {
      setParticipants(prev => prev.filter(participant => participant.id !== userId));
    });

    socketRef.current.on('video-status', ({ userId, status }) => {
      setParticipants(prev => prev.map(participant => (
        participant.id === userId ? { ...participant, video: status } : participant
      )));
    });

    socketRef.current.on('audio-status', ({ userId, status }) => {
      setParticipants(prev => prev.map(participant => (
        participant.id === userId ? { ...participant, audio: status } : participant
      )));
    });

    peerConnectionRef.current.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };

    peerConnectionRef.current.ontrack = event => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    socketRef.current.on('offer', async data => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { answer, roomId, answerby: currentUser });
    });

    socketRef.current.on('answer', async data => {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socketRef.current.on('ice-candidate', async data => {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socketRef.current.on('chat-message', message => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      localStream?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
    };
  }, []);

  const createOffer = async () => {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socketRef.current.emit('offer', { offer, roomId, offerby: currentUser });
  };

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
      const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
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
      const tracks = localVideoRef.current?.srcObject?.getTracks();
      if (tracks) {
        tracks.forEach(track => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      setIsScreenSharing(false);
    }
  };

  const endMeeting = () => {
    socketRef.current.emit('User-disconnect', currentUser);
    socketRef.current.disconnect();
    localStream.getTracks().forEach(track => track.stop());
    peerConnectionRef.current.close();
    window.location.href = '/';
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
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`max-w-full max-h-full object-contain ${remoteStream ? '' : 'hidden'}`}
        />
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
        {!remoteStream && (
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
        <div className="participants-panel bg-white w-full max-w-md rounded-lg shadow-lg absolute top-20 right-4 z-10">
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
