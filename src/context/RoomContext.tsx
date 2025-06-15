import axios from 'axios';
import { toast } from '@/components/ui/sonner';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

import { SERVER_URL, USER_STORAGE_KEY, ROOMS_STORAGE_KEY } from '@/constants';

export interface Switch {
  _id: string;
  esp: string;
  name: string;
  state: boolean;
  icon: string;
  order?: number;
}

export interface Room {
  esp_id: string;
  name: string;
  icon: string;
  switches: Switch[];
  order: number;
  type?: 'demo'; // 'demo' for demo rooms, null for real rooms
}

interface RoomContextType {
  rooms: Room[];
  loading: boolean;
  addRoom: (
    name: string,
    device_id: string,
    icon: string,
    cb: () => void
  ) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  // addSwitch: (roomId: string, name: string, icon: string) => void;
  updateSwitch: (
    roomId: string,
    switchId: string,
    updates: Partial<Switch>
  ) => void;
  // deleteSwitch: (roomId: string, switchId: string) => void;
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

// const STORAGE_KEY = 'switchstack-rooms';

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  // console.log("RoomProvider rendered");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  /*const initializeDemoRooms = () => {
      // Initialize with demo data if no saved rooms
      const demoRooms: Room[] = [
        //   {
        //     id: 'room-1',
        //     name: 'Living Room',
        //     icon: 'house',
        //     order: 0,
        //     switches: [
        //       {
        //         id: 'switch-1',
        //         name: 'Main Light',
        //         isOn: false,
        //         icon: 'lightbulb',
        //       },
        //       { id: 'switch-2', name: 'TV', isOn: true, icon: 'monitor' },
        //     ],
        //   },
        //   {
        //     id: 'room-2',
        //     name: 'Bedroom',
        //     icon: 'bell',
        //     order: 1,
        //     switches: [
        //       {
        //         id: 'switch-3',
        //         name: 'Ceiling Light',
        //         isOn: false,
        //         icon: 'lightbulb',
        //       },
        //       { id: 'switch-4', name: 'Desk Lamp', isOn: false, icon: 'lamp' },
        //     ],
        //   },
      ];
      setRooms(demoRooms);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRooms));
    };*/

  // Initialize Rooms from localStorage and update from API
  useEffect(() => {
    console.log('RoomProvider useEffect running');
    if (!isAuthenticated) return; // Check if user is logged in

    // Set loading state to true at the beginning
    setLoading(true);
    // Show loading toast that will stay until dismissed
    const loadingToastId = toast.loading('Loading your rooms...');

    // Initially Load rooms from localStorage
    const savedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
    const parsedRooms = JSON.parse(savedRooms) ?? []; // Default to empty array if null
    // console.log('SavedRooms:', savedRooms);
    // console.log('ParsedRooms:', parsedRooms);
    setRooms(parsedRooms);

    // if (!parsedRooms || parsedRooms.length === 0) {
    //   // console.log("No saved rooms found, initializing demo rooms");
    //   initializeDemoRooms();
    // }

    // TODO: Update rooms from api
    const url = `${SERVER_URL}/api/v1/esps`;
    axios
      .get(url, { withCredentials: true })
      .then((response) => {
        // console.log(response);
        const data = response.data.data.esps;
        console.log('Data:', data);
        // Compare with localStorage
        if (!data || data.length === 0) {
          setRooms([]);
        } else {
          // If rooms are not found in localstorage set the rooms
          if (parsedRooms.length === 0) {
            setRooms(data);
          } else {
            // Filter, Update and Add rooms
            // Step 1: Filter out rooms that are already in localStorage
            const existingRooms = parsedRooms.filter((room: Room) =>
              data.find((r: Room) => r.esp_id === room.esp_id)
            );
            // console.log('Existing Rooms:', existingRooms);

            // Step 2: Update existing rooms with latest data
            const updatedRooms = existingRooms.map((room: Room) => {
              const apiRoom = data.find((r: Room) => r.esp_id === room.esp_id);
              if (apiRoom) {
                // Update the switches
                const updatedSwitches = apiRoom.switches.map((sw: Switch) => {
                  const existingSwitch = room.switches.find(
                    (s: Switch) => s._id === sw._id
                  );
                  // console.log('Existing Switch:', existingSwitch);
                  if (existingSwitch) {
                    // Update the switch
                    return {
                      ...existingSwitch,
                      name: sw.name,
                      icon: sw.icon,
                      state: sw.state,
                    };
                  } else {
                    // Add new switch if it doesn't exist
                    return sw;
                  }
                });
                return {
                  ...room,
                  name: apiRoom.name,
                  icon: apiRoom.icon,
                  switches: updatedSwitches,
                };
              }
              return room;
            });
            // console.log('Updated Rooms (Ori):', updatedRooms);

            // Step 3: Add remaining rooms if any
            if (updatedRooms.length < data.length) {
              data.forEach((room: Room) => {
                const found = updatedRooms.find(
                  (r: Room) => r.esp_id === room.esp_id
                );
                if (!found) {
                  // console.log('Not included Room:', room);
                  updatedRooms.push(room);
                }
              });
            }
            // console.log('Updated Rooms:', updatedRooms);

            // Step 4: Set Rooms
            setRooms(updatedRooms);
          }
        }

        // Set loading to false after rooms are fetched and updated
        setLoading(false);
        // Dismiss the loading toast and show success message
        toast.dismiss(loadingToastId);
        toast.success('Rooms loaded successfully');
      })
      .catch((error) => {
        console.error(error);

        // Set loading to false on error as well
        setLoading(false);
        // Dismiss the loading toast and show error message
        toast.dismiss(loadingToastId);
        toast.error('Failed to load rooms');
      });
  }, [isAuthenticated]);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    if (!isAuthenticated) return; // Check if user is logged in
    if (!loading) {
      // console.log("Saving rooms to localStorage:", rooms);
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    }
  }, [rooms, loading, isAuthenticated]);

  const addRoom = async (
    name: string,
    device_id: string,
    icon: string,
    cb: () => void
  ) => {
    const loadingToastId = toast.loading('Adding room...');
    let esp_id = device_id;
    let switches: Switch[] = [];
    if (esp_id === 'demo') {
      esp_id = `room-${Date.now()}`;
    } else {
      const url = `${SERVER_URL}/api/v1/esps/register`;
      try {
        const response = await axios.post(
          url,
          { esp_id, name, icon },
          { withCredentials: true }
        );
        const dd = response.data;
        // console.log('Added data:', dd);
        switches = dd.data.room.switches;
        // console.log('Added Switches:', switches);
        // dd.data.room.switches.map((sw) => console.log(sw));
      } catch (error) {
        // console.log(error);
        esp_id = null;
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Something went wrong!');
        }
      }
    }
    if (esp_id) {
      const newRoom: Room = {
        esp_id,
        name,
        icon,
        switches: switches,
        order: rooms.length,
      };
      // To check if switch is for demo purpose..
      if (device_id === 'demo') {
        newRoom.type = 'demo';
      }
      setRooms([...rooms, newRoom]);

      toast.dismiss(loadingToastId);
      toast.success(`Room "${name}" created successfully`);
      cb();
    } else {
      toast.dismiss(loadingToastId);
      toast.error('Failed to create room');
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    const loadingToastId = toast.loading('Updating room...');
    try {
      await axios.patch(
        `${SERVER_URL}/api/v1/esps/${roomId}`,
        {
          name: updates.name,
          icon: updates.icon,
        },
        {
          withCredentials: true,
        }
      );
      setRooms(
        rooms.map((room) =>
          room.esp_id === roomId ? { ...room, ...updates } : room
        )
      );

      toast.dismiss(loadingToastId);
      toast.success('Room updated successfully');
    } catch (error) {
      //   console.error('Error updating room:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to update room');
    }
  };

  const deleteRoom = (roomId: string) => {
    // const roomName = rooms.find((room) => room.esp_id === roomId)?.name;
    // setRooms(rooms.filter((room) => room.esp_id !== roomId));
    // toast.success(`Room "${roomName}" deleted successfully`);
    toast.warning('This feature is not available yet!');
  };

  //   const addSwitch = (roomId: string, name: string, icon: string) => {
  //     setRooms(
  //       rooms.map((room) => {
  //         if (room.esp_id === roomId) {
  //           return {
  //             ...room,
  //             switches: [
  //               ...room.switches,
  //               {
  //                 id: `switch-${Date.now()}`,
  //                 name,
  //                 isOn: false,
  //                 icon,
  //               },
  //             ],
  //           };
  //         }
  //         return room;
  //       })
  //     );
  //     toast.success(`Switch "${name}" added successfully`);
  //   };

  const updateSwitch = async (
    roomId: string,
    switchId: string,
    updates: Partial<Switch>
  ) => {
    // console.log(updates);
    const loadingToastId = toast.loading('Updating switch...');
    try {
      await axios.patch(
        `${SERVER_URL}/api/v1/esps/${roomId}/switch/${switchId}`,
        {
          name: updates.name,
          icon: updates.icon,
        },
        { withCredentials: true }
      );
      setRooms(
        rooms.map((room) => {
          if (room.esp_id === roomId) {
            return {
              ...room,
              switches: room.switches.map((sw) =>
                sw._id === switchId ? { ...sw, ...updates } : sw
              ),
            };
          }
          return room;
        })
      );

      toast.dismiss(loadingToastId);
      toast.success('Switch updated successfully');
    } catch (error) {
      //   console.log('Error updating switch:', error);

      toast.dismiss(loadingToastId);
      toast.error('Failed to update switch');
    }
  };

  //   const deleteSwitch = (roomId: string, switchId: string) => {
  //     setRooms(
  //       rooms.map((room) => {
  //         if (room.esp_id === roomId) {
  //           const switchName = room.switches.find(
  //             (sw) => sw._id === switchId
  //           )?.name;
  //           toast.success(`Switch "${switchName}" deleted successfully`);
  //           return {
  //             ...room,
  //             switches: room.switches.filter((sw) => sw._id !== switchId),
  //           };
  //         }
  //         return room;
  //       })
  //     );
  //   };

  const toggleSwitch = (roomId: string, switchId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.esp_id === roomId) {
          return {
            ...room,
            switches: room.switches.map((sw) => {
              if (sw._id === switchId) {
                const newState = !sw.state;
                return { ...sw, state: newState };
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
        if (room.esp_id === roomId) {
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
    // addSwitch,
    updateSwitch,
    // deleteSwitch,
    toggleSwitch,
    reorderRooms,
    reorderSwitches,
  };

  // console.log("RoomProvider providing context:", contextValue);

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
