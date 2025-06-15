import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { RoomProvider } from '@/context/RoomContext';
import { NetworkProvider } from '@/context/NetworkContext';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoomDetail from './pages/RoomDetail';
import Settings from './pages/Settings';
import ProtectedRoutes from './utils/ProtectedRoutes';
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <RoomProvider>
              <TooltipProvider>
                <AnimatePresence mode='wait'>
                  <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/' element={<ProtectedRoutes />}>
                      <Route path='' element={<Dashboard />} />
                      <Route path='rooms/:roomId' element={<RoomDetail />} />
                      <Route path='settings' element={<Settings />} />
                    </Route>
                    <Route path='*' element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
                <Toaster />
                <Sonner position='bottom-right' duration={2000} />
              </TooltipProvider>
            </RoomProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
