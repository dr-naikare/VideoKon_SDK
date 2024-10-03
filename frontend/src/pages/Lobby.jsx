import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon } from "lucide-react";
import toast from "react-hot-toast";




const LobbyPage = () => {
  const [meetingCode, setMeetingCode] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (isCameraOn) {
      startVideoStream();
    } else {
      stopVideoStream();
    }
    return () => stopVideoStream();
  }, [isCameraOn]);

  useEffect(() => {
    if (isMicOn) {
      startAudioStream();
    } else {
      stopAudioStream();
    }
    return () => stopAudioStream();
  }, [isMicOn]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast.error("Please allow camera access.");
    }
  };

  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks().filter((track) => track.kind === "video");
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMicLevel = () => {
        analyser.getByteTimeDomainData(dataArray);
        const normalizedMicLevel = Math.max(...dataArray) / 128.0 - 1.0;
        setMicLevel(Math.abs(normalizedMicLevel));
        requestAnimationFrame(updateMicLevel);
      };

      updateMicLevel();
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Please allow microphone access.");
    }
  };

  const stopAudioStream = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
  };

  const handleNewMeeting = async () => {
    const roomId = uuidv4();
    // Make a request to your backend to create a room
    await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId }),
    });

    localStorage.setItem("cameraStatus", isCameraOn);
    localStorage.setItem("micStatus", isMicOn);
    window.location.href = `/meeting/${roomId}`;
  };

  const handleJoinMeeting = async () => {
    if (meetingCode) {
      // Check if the room exists
      const response = await fetch(`/api/rooms/${meetingCode}`);
      if (response.ok) {
        localStorage.setItem("cameraStatus", isCameraOn);
        localStorage.setItem("micStatus", isMicOn);
        // Join the room via Socket.IO
        socket.emit('joinRoom', meetingCode);
        window.location.href = `/meeting/${meetingCode}`;
      } else {
        toast.error("Room not found!");
      }
    } else {
      toast.error("Please enter a meeting code.");
    }
  };

  useEffect(() => {
    socket.on('userJoined', (userId) => {
      toast.success(`User ${userId} joined the room!`);
    });

    return () => {
      socket.off('userJoined');
    };
  }, []);

  const getMicLevelColor = () => {
    if (micLevel < 0.3) {
      return "bg-green-600";
    } else if (micLevel < 0.6) {
      return "bg-yellow-600";
    } else {
      return "bg-red-600";
    }
  };

  return (
    <div className="h-auto md:h-screen lg:overflow-hidden">
      <div className="p-5">
        <a href="/">
          <img src="/logo.jpg" alt="logo" className="w-10 h-10 mr-2 rounded-md" />
        </a>
      </div>
      <div className="lg:h-[90vh] h-auto flex flex-col-reverse lg:flex-row items-center justify-between p-8">
        <div className="lg:w-1/2 w-full mt-8 mx-5 lg:mt-0 flex justify-center items-center">
          <div className="relative w-full h-96 bg-gray-200 rounded-lg">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              muted
            ></video>
            <div className="w-full mt-4 text-center pb-4">
              <p className="text-lg mb-2">Mic Check:</p>
              <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getMicLevelColor()}`}
                  style={{ width: `${micLevel * 100}%` }}
                ></div>
              </div>
            </div>
            <Button
              variant="outline"
              className={`absolute bottom-4 left-4 ${isCameraOn ? "bg-green-600" : "bg-red-600"} text-white font-bold px-4 py-2`}
              onClick={() => setIsCameraOn(!isCameraOn)}
            >
              {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
            </Button>
            <Button
              variant="outline"
              className={`absolute bottom-4 right-4 ${isMicOn ? "bg-green-600" : "bg-red-600"} text-white font-bold px-4 py-2`}
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <MicIcon /> : <MicOffIcon />}
            </Button>
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex flex-col items-center lg:items-start">
          <h1 className="text-3xl font-semibold mb-4">Video calls and meetings for everyone</h1>
          <p className="mb-6 text-gray-600">Connect, collaborate, and celebrate from anywhere with Our Platform.</p>

          <div className="flex flex-col md:flex-row mb-6 md:space-x-2 justify-center items-center">
            <Button
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white font-bold px-4 py-2 mb-2 w-full md:w-auto"
              onClick={handleNewMeeting}
            >
              New Meeting
            </Button>

            <div className="flex space-x-2">
              <Input
                className="md:w-48 border md:px-4 py-2 mb-2 w-full"
                placeholder="Enter a code or link"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
              />
              <Button
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-4 py-2 mb-2"
                onClick={handleJoinMeeting}
              >
                Join
              </Button>
            </div>
          </div>

          <p className="text-blue-600 hover:underline cursor-pointer">Learn more about VideoKon</p>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
