import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"; // Adjust based on your structure
import { Input } from "@/components/ui/input";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon } from "lucide-react";

const LobbyPage = () => {
  const [meetingCode, setMeetingCode] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const videoRef = useRef(null);

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
    }
  };

  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks().filter((track) => track.kind === 'video');
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tracks = stream.getTracks().filter(track => track.kind === 'audio');
      tracks.forEach(track => track.enabled = isMicOn);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopAudioStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks().filter((track) => track.kind === 'audio');
      tracks.forEach((track) => track.stop());
    }
  };

  const handleNewMeeting = () => {
    // Store the camera and mic status in localStorage or pass through URL params
    localStorage.setItem('cameraStatus', isCameraOn);
    localStorage.setItem('micStatus', isMicOn);

    // Redirect to the new meeting with settings
    window.location.href = `/meeting`;
  };

  const handleJoinMeeting = () => {
    if (meetingCode) {
      localStorage.setItem('cameraStatus', isCameraOn);
      localStorage.setItem('micStatus', isMicOn);

      window.location.href = `/meeting/${meetingCode}`;
    }
  };

  return (
    <>
    <div className="bg-gray-100 p-5">
        <img src="/logo.jpg" alt="logo" className="w-10 h-10 mr-2 rounded-md" />
    </div>
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-between bg-gray-100 p-8">
      {/* Left Section: Video Call and Inputs */}
      <div className="lg:w-1/2 w-full flex flex-col items-center lg:items-start">
        <h1 className="text-3xl font-semibold mb-4">Video calls and meetings for everyone</h1>
        <p className="mb-6 text-gray-600">Connect, collaborate, and celebrate from anywhere with your meeting tool.</p>

        {/* New Meeting and Join Form */}
        <div className="flex mb-6 space-x-2">
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white font-bold px-4 py-2"
            onClick={handleNewMeeting}
          >
            New Meeting
          </Button>

          <Input
            className="w-48 border px-4 py-2"
            placeholder="Enter a code or link"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
          />

          <Button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-4 py-2"
            onClick={handleJoinMeeting}
          >
            Join
          </Button>
        </div>

        {/* Learn more link */}
        <p className="text-blue-600 hover:underline cursor-pointer">Learn more about VideoKon</p>
      </div>

      {/* Right Section: Video and Audio Preview */}
      <div className="lg:w-1/2 w-full mt-8 lg:mt-0 flex justify-center items-center">
        <div className="relative w-full h-64 bg-gray-200 rounded-lg">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            muted
          ></video>

          {/* Camera Toggle */}
          <Button
            variant="outline"
            className={`absolute bottom-4 left-4 ${
              isCameraOn ? "bg-green-600" : "bg-red-600"
            } text-white font-bold px-4 py-2`}
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
          </Button>

          {/* Microphone Toggle */}
          <Button
            variant="outline"
            className={`absolute bottom-4 right-4 ${
              isMicOn ? "bg-green-600" : "bg-red-600"
            } text-white font-bold px-4 py-2`}
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <MicIcon /> : <MicOffIcon />}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default LobbyPage;
