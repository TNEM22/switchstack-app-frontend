import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { House, Menu, Settings, LogOut, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <House className='w-5 h-5' /> },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings className='w-5 h-5' />,
    },
  ];

  return (
    <nav className='border-b py-2 px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        <div className='flex items-center'>
          <Link to='/' className='font-bold text-lg flex items-center'>
            <span className='text-primary'>Switch</span>
            <span>Stack</span>
          </Link>

          {/* Desktop menu */}
          <div className='hidden md:flex ml-8 space-x-2'>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={
                  location.pathname === item.path ? 'secondary' : 'ghost'
                }
                size='sm'
                className='flex items-center gap-1'
                asChild
              >
                <Link to={item.path}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <ThemeToggle />

          {/* Mobile menu trigger */}
          <div className='md:hidden'>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-[300px]'>
                <SheetHeader className='border-b pb-4'>
                  <SheetTitle className='text-primary'>SwitchStack</SheetTitle>
                </SheetHeader>
                <div className='mt-6 space-y-1'>
                  <AnimatePresence>
                    {menuItems.map((item) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant={
                            location.pathname === item.path
                              ? 'secondary'
                              : 'ghost'
                          }
                          className='w-full justify-start gap-2'
                          onClick={() => {
                            setMobileMenuOpen(false);
                          }}
                          asChild
                        >
                          <Link to={item.path}>
                            {item.icon}
                            {item.label}
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        variant='ghost'
                        className='w-full justify-start mt-6 gap-2 text-destructive hover:text-destructive'
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className='w-5 h-5' />
                        Log Out
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <div className='flex items-center justify-start gap-2 p-2'>
                <div className='flex flex-col space-y-1 leading-none'>
                  {user?.name && <p className='font-medium'>{user.name}</p>}
                  {user?.email && (
                    <p className='w-[200px] truncate text-sm text-muted-foreground'>
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  to='/settings'
                  className='cursor-pointer flex w-full items-center'
                >
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer'
                onClick={logout}
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
