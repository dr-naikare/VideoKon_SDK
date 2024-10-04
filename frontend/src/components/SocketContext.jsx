import React, { createContext, useState, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const initializeSocket = () => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    return newSocket;
  };

  const closeSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, initializeSocket, closeSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
