import { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhone,
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
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  const toggleVideo = () => {
    setMyVideo(!myVideo);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

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
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${
              myVideo ? "" : "hidden"
            }`}
          />
          {Object.keys(remoteStreams).map((userId, index) => (
            <video
              key={index}
              ref={(el) => (remoteVideoRefs.current[userId] = el)}
              autoPlay
              playsInline
              className={`rounded-full w-36 h-36 mx-auto mb-4`}
            />
          ))}
          <img
            src="https://via.placeholder.com/150"
            alt="User"
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${
              myVideo ? "hidden" : ""
            }`}
          />
          <p>Waiting for other participants to join...</p>
        </div>
      </div>
      <div className="flex justify-around w-full max-w-md py-4 bg-white border-t border-gray-300">
        <Button variant="ghost" onClick={toggleMute}>
          {myAudio ? (
            <FaMicrophone className="text-xl " />
          ) : (
            <FaMicrophoneSlash className="text-xl" />
          )}
        </Button>
        <Button variant="ghost" onClick={toggleVideo}>
          {myVideo ? (
            <FaVideo className="text-xl" />
          ) : (
            <FaVideoSlash className="text-xl" />
          )}
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