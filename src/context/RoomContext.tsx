import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

export interface Switch {
  id: string;
  name: string;
  isOn: boolean;
  icon: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  switches: Switch[];
  order: number;
}

interface RoomContextType {
  rooms: Room[];
  loading: boolean;
  addRoom: (name: string, icon: string) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addSwitch: (roomId: string, name: string, icon: string) => void;
  updateSwitch: (
    roomId: string,
    switchId: string,
    updates: Partial<Switch>
  ) => void;
  deleteSwitch: (roomId: string, switchId: string) => void;
  toggleSwitch: (roomId: string, switchId: string) => void;
  reorderRooms: (startIndex: number, endIndex: number) => void;
  reorderSwitches: (
    roomId: string,
    startIndex: number,
    endIndex: number
  ) => void;
}

// Create context with a more descriptive undefined check
const RoomContext = createContext<RoomContextType | undefined>(undefined);

const STORAGE_KEY = 'switchstack-rooms';

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  //   console.log("RoomProvider rendered");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeDemoRooms = () => {
    // Initialize with demo data if no saved rooms
    const demoRooms: Room[] = [
      {
        id: 'room-1',
        name: 'Living Room',
        icon: 'house',
        order: 0,
        switches: [
          {
            id: 'switch-1',
            name: 'Main Light',
            isOn: false,
            icon: 'lightbulb',
          },
          { id: 'switch-2', name: 'TV', isOn: true, icon: 'monitor' },
        ],
      },
      {
        id: 'room-2',
        name: 'Bedroom',
        icon: 'bell',
        order: 1,
        switches: [
          {
            id: 'switch-3',
            name: 'Ceiling Light',
            isOn: false,
            icon: 'lightbulb',
          },
          { id: 'switch-4', name: 'Desk Lamp', isOn: false, icon: 'lamp' },
        ],
      },
    ];
    setRooms(demoRooms);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRooms));
  };

  useEffect(() => {
    // console.log("RoomProvider useEffect - loading rooms");
    // Initially Load rooms from localStorage
    const savedRooms = localStorage.getItem(STORAGE_KEY);
    const parsedRooms = JSON.parse(savedRooms);
    // console.log("Loaded rooms from localStorage:", parsedRooms);
    setRooms(parsedRooms);

    // TODO: Update rooms from api

    setLoading(false);
  }, []);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      //   console.log("Saving rooms to localStorage:", rooms);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    }
  }, [rooms, loading]);

  const addRoom = (name: string, icon: string) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      icon,
      switches: [],
      order: rooms.length,
    };

    setRooms([...rooms, newRoom]);
    toast.success(`Room "${name}" created successfully`);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(
      rooms.map((room) => (room.id === id ? { ...room, ...updates } : room))
    );
    toast.success('Room updated successfully');
  };

  const deleteRoom = (id: string) => {
    const roomName = rooms.find((room) => room.id === id)?.name;
    setRooms(rooms.filter((room) => room.id !== id));
    toast.success(`Room "${roomName}" deleted successfully`);
  };

  const addSwitch = (roomId: string, name: string, icon: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            switches: [
              ...room.switches,
              {
                id: `switch-${Date.now()}`,
                name,
                isOn: false,
                icon,
              },
            ],
          };
        }
        return room;
      })
    );
    toast.success(`Switch "${name}" added successfully`);
  };

  const updateSwitch = (
    roomId: string,
    switchId: string,
    updates: Partial<Switch>
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            switches: room.switches.map((sw) =>
              sw.id === switchId ? { ...sw, ...updates } : sw
            ),
          };
        }
        return room;
      })
    );
    toast.success('Switch updated successfully');
  };

  const deleteSwitch = (roomId: string, switchId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const switchName = room.switches.find(
            (sw) => sw.id === switchId
          )?.name;
          toast.success(`Switch "${switchName}" deleted successfully`);
          return {
            ...room,
            switches: room.switches.filter((sw) => sw.id !== switchId),
          };
        }
        return room;
      })
    );
  };

  const toggleSwitch = (roomId: string, switchId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            switches: room.switches.map((sw) => {
              if (sw.id === switchId) {
                const newState = !sw.isOn;
                return { ...sw, isOn: newState };
              }
              return sw;
            }),
          };
        }
        return room;
      })
    );
  };

  const reorderRooms = (startIndex: number, endIndex: number) => {
    const result = Array.from(rooms);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order property
    const updatedRooms = result.map((room, index) => ({
      ...room,
      order: index,
    }));

    setRooms(updatedRooms);
  };

  const reorderSwitches = (
    roomId: string,
    startIndex: number,
    endIndex: number
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          const newSwitches = Array.from(room.switches);
          const [removed] = newSwitches.splice(startIndex, 1);
          newSwitches.splice(endIndex, 0, removed);
          return { ...room, switches: newSwitches };
        }
        return room;
      })
    );
  };

  const contextValue = {
    rooms,
    loading,
    addRoom,
    updateRoom,
    deleteRoom,
    addSwitch,
    updateSwitch,
    deleteSwitch,
    toggleSwitch,
    reorderRooms,
    reorderSwitches,
  };

  //   console.log("RoomProvider providing context:", contextValue);

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};

export const useRooms = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    console.error('useRooms must be used within a RoomProvider');
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
};
