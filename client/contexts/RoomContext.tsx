import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RoomContextType {
  currentRoomId: string | null;
  currentRoomName: string | null;
  setCurrentRoom: (roomId: string, roomName: string) => void;
  clearCurrentRoom: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);

  const setCurrentRoom = (roomId: string, roomName: string) => {
    setCurrentRoomId(roomId);
    setCurrentRoomName(roomName);
  };

  const clearCurrentRoom = () => {
    setCurrentRoomId(null);
    setCurrentRoomName(null);
  };

  const value: RoomContextType = {
    currentRoomId,
    currentRoomName,
    setCurrentRoom,
    clearCurrentRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
