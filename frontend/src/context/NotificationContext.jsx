import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadMessageCount } from '../services/api';

const NotificationContext = createContext();

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchNotifications = async () => {
    if (user) {
      try {
        const { data } = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
        
        const msgRes = await getUnreadMessageCount();
        setUnreadMessageCount(msgRes.data.count);
      } catch (error) {
        console.error('Failed to fetch notifications or messages');
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (user) {
      socket.emit('join', user._id);
      
      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        showNotification(`إشعار جديد: ${notif.content}`);
      };

      socket.on('notification', handleNewNotification);
      socket.on('messageReceived', (msg) => {
         showNotification(`رسالة جديدة من ${msg.senderName}`);
         setUnreadMessageCount(prev => prev + 1);
         fetchNotifications();
      });

      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('messageReceived');
      };
    }
  }, [user]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider value={{ 
      toast, 
      showNotification, 
      notifications, 
      unreadCount, 
      unreadMessageCount,
      setUnreadMessageCount,
      markRead, 
      markAllRead,
      fetchNotifications 
    }}>
      {children}
      {toast && (
        <div className={`fixed top-0 left-0 w-full z-[100] py-4 px-6 text-center text-white font-bold shadow-lg transform transition-all duration-500 animate-in slide-in-from-top ${
          toast.type === 'error' ? 'bg-error' : 'bg-primary-container'
        }`}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-3">
             <span className="material-symbols-outlined">
               {toast.type === 'error' ? 'error' : 'check_circle'}
             </span>
             {toast.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
