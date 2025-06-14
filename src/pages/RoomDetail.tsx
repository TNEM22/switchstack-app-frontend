import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { NavBar } from '@/components/NavBar';
import { useRooms } from '@/context/RoomContext';
import { SwitchItem } from '@/components/SwitchItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconSelector } from '@/components/IconSelector';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  ToggleRight,
  Move,
  Save,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';

export default function RoomDetail() {
  //   console.log('Rendering RoomDetail component');

  const { roomId } = useParams<{ roomId: string }>();
  //   console.log('Room ID from params:', roomId);

  // Debug if RoomContext is available
  const roomsContext = useRooms();
  //   console.log('RoomContext available:', roomsContext ? 'Yes' : 'No');

  const { rooms, deleteRoom, updateRoom, reorderSwitches } = roomsContext;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  //   console.log('Rooms from context:', rooms);

  const room = rooms.find((r) => r.esp_id === roomId);
  //   console.log('Room found:', room);

  //   const [isAddingSwitch, setIsAddingSwitch] = useState(false);
  //   const [newSwitchName, setNewSwitchName] = useState('');
  //   const [selectedIcon, setSelectedIcon] = useState('toggle-right');
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomName, setRoomName] = useState(room?.name || '');
  const [roomIcon, setRoomIcon] = useState(room?.icon || 'house');
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);
  //   const [draggedSwitchIndex, setDraggedSwitchIndex] = useState<number | null>(
  //     null
  //   );

  if (!room) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold'>Room not found</h2>
          <p className='mb-4'>The room you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  //   const handleAddSwitch = () => {
  //     if (newSwitchName.trim()) {
  //       addSwitch(roomId!, newSwitchName.trim(), selectedIcon);
  //       setNewSwitchName('');
  //       setSelectedIcon('toggle-right');
  //       setIsAddingSwitch(false);
  //     }
  //   };

  const handleUpdateRoom = () => {
    if (roomName.trim()) {
      updateRoom(roomId!, { name: roomName.trim(), icon: roomIcon });
      setIsEditingRoom(false);
    }
  };

  const handleDeleteRoom = () => {
    deleteRoom(roomId!);
    navigate('/');
  };

  const toggleDraggingMode = () => {
    setIsDraggingEnabled(!isDraggingEnabled);
    if (!isDraggingEnabled) {
      //   toast.info(
      //     'Drag mode enabled. Rearrange your switches by dragging them.'
      //   );
      toast.info('Drag mode enabled');
    } else {
      toast.success('Switch positions saved');
    }
  };

  const moveSwitch = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Check if the new index is valid
    if (newIndex >= 0 && newIndex < room.switches.length) {
      reorderSwitches(roomId!, index, newIndex);
      //   toast.success(`Switch ${direction === 'up' ? 'moved up' : 'moved down'}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <PageTransition>
      <div className='min-h-screen bg-background'>
        <NavBar />
        <div className='max-w-7xl mx-auto px-4 pb-6'>
          <div className='sticky top-[57px] bg-background/80 backdrop-blur-sm py-4 z-10 mb-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => navigate('/')}
                  className='rounded-full'
                >
                  <ArrowLeft className='h-5 w-5' />
                </Button>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <DynamicIcon
                      name={room.icon}
                      className='h-5 w-5 text-primary'
                    />
                  </div>
                  <h1 className='text-xl md:text-2xl font-bold truncate max-w-[180px] md:max-w-full'>
                    {room.name}
                  </h1>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 ml-11 md:ml-0'>
                <Dialog open={isEditingRoom} onOpenChange={setIsEditingRoom}>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='icon' className='h-9 w-9'>
                      <Edit className='h-4 w-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Room</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='room-name'>Room Name</Label>
                        <Input
                          id='room-name'
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label>Room Icon</Label>
                        <IconSelector
                          selectedIcon={roomIcon}
                          onSelectIcon={setRoomIcon}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setIsEditingRoom(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateRoom}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='icon' className='h-9 w-9'>
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Room</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete "{room.name}"? This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant='outline'>Cancel</Button>
                      <Button variant='destructive' onClick={handleDeleteRoom}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {room.switches.length > 1 && (
                  <Button
                    variant={isDraggingEnabled ? 'default' : 'outline'}
                    size={isMobile ? 'sm' : 'default'}
                    onClick={toggleDraggingMode}
                    className='flex gap-2 items-center'
                  >
                    {isDraggingEnabled ? (
                      <>
                        <Save className='h-4 w-4' />
                        {!isMobile && 'Save Positions'}
                      </>
                    ) : (
                      <>
                        <Move className='h-4 w-4' />
                        {!isMobile && 'Rearrange Switches'}
                      </>
                    )}
                  </Button>
                )}

                {/* <Button
                  onClick={() => setIsAddingSwitch(true)}
                  size={isMobile ? 'sm' : 'default'}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  {isMobile ? 'Add' : 'Add Switch'}
                </Button> */}
              </div>
            </div>
          </div>

          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='space-y-4'
          >
            <AnimatePresence>
              {room.switches.length > 0 ? (
                room.switches.map((switchItem, index) => (
                  <motion.div
                    key={switchItem._id}
                    variants={item}
                    layout
                    transition={{
                      layout: { type: 'spring', stiffness: 300, damping: 30 },
                    }}
                    className={isDraggingEnabled ? 'relative' : ''}
                  >
                    <div className='flex items-stretch'>
                      {/* Show arrows for both mobile and desktop when in reordering mode */}
                      {isDraggingEnabled && (
                        <div className='flex flex-col justify-center mr-2 space-y-1'>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 rounded-full hover:bg-transparent'
                            onClick={() => moveSwitch(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 rounded-full hover:bg-transparent'
                            onClick={() => moveSwitch(index, 'down')}
                            disabled={index === room.switches.length - 1}
                          >
                            <ArrowDown className='h-4 w-4' />
                          </Button>
                        </div>
                      )}
                      <div className='flex-1'>
                        <SwitchItem
                          roomId={room.esp_id}
                          switchItem={switchItem}
                          onEdit={() => {}}
                          isPadded={isDraggingEnabled}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  variants={item}
                  className='flex flex-col items-center justify-center p-12 text-center'
                >
                  <div className='rounded-full bg-primary/10 p-6 mb-4'>
                    <ToggleRight className='h-10 w-10 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold mb-2'>
                    No switches yet
                  </h3>
                  {/* <p className='text-muted-foreground mb-6'>
                    Add switches to control your devices in this room
                  </p> */}
                  {/* <Button onClick={() => setIsAddingSwitch(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Your First Switch
                  </Button> */}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {isDraggingEnabled && isMobile && room.switches.length > 1 && (
            <div className='fixed bottom-4 left-0 right-0 flex justify-center'>
              <Button
                size='lg'
                onClick={toggleDraggingMode}
                className='rounded-full shadow-lg'
              >
                <Save className='h-4 w-4 mr-2' />
                Save Positions
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Switch adding form/dialog */}
      {/* <Dialog open={isAddingSwitch} onOpenChange={setIsAddingSwitch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Switch</DialogTitle>
            <DialogDescription>
              Create a new switch for {room.name}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='switch-name'>Switch Name</Label>
              <Input
                id='switch-name'
                placeholder='Main Light, TV, Fan, etc.'
                value={newSwitchName}
                onChange={(e) => setNewSwitchName(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Select Icon</Label>
              <IconSelector
                selectedIcon={selectedIcon}
                onSelectIcon={setSelectedIcon}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddingSwitch(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSwitch}>Add Switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </PageTransition>
  );
}
