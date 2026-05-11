import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, PlusSquare, MessageCircle, User } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadMessageCount } = useNotification();
  
  const navItems = user?.role === 'owner' ? [
    { label: 'الرئيسية', icon: Search, path: '/' },
    { label: 'أضف إعلان', icon: PlusSquare, path: '/post-ad' },
    { label: 'الرسائل', icon: MessageCircle, path: '/inbox' },
    { label: 'حسابي', icon: User, path: '/dashboard' },
  ] : [
    { label: 'الرئيسية', icon: Search, path: '/' },
    { label: 'الرسائل', icon: MessageCircle, path: '/inbox' },
    { label: 'حسابي', icon: User, path: '/dashboard' },
  ];

  return (
    <nav className="md:hidden fixed bottom-8 left-6 right-6 z-50 glass-morphism rounded-[2.5rem] border border-outline/20 flex justify-around items-center py-5 px-3 shadow-2xl transition-all duration-700 overflow-hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link 
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center relative px-4 transition-all duration-300 active:scale-90 ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="bottom-nav-active"
                className="absolute inset-0 bg-primary/5 rounded-2xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <div className={`p-1 transition-all relative z-10 ${isActive ? 'scale-110' : 'opacity-50'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.path === '/inbox' && unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface shadow-lg">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 relative z-10 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
