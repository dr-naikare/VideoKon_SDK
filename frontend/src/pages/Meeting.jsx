import { useState, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhone } from 'react-icons/fa';
import { Button } from '../components/ui/button';

const VideoKon = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);

  const toggleMute = () => setIsMuted(!isMuted);

  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        // Request video access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setLocalStream(stream);
        setIsVideoOn(true);

        // Display the video preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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
    // End meeting logic, then redirect
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
            ref={videoRef}
            autoPlay
            playsInline
            className={`rounded-full w-36 h-36 mx-auto mb-4 ${isVideoOn ? '' : 'hidden'}`}
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

export default VideoKon;