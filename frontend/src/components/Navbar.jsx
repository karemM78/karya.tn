import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, PlusCircle, HelpCircle, Settings, ClipboardList, Moon, Sun, MessageCircle, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/logo.png';
import logoDark from '../assets/logo-dark.png';
import { BACKEND_URL } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { unreadCount, notifications, markRead, unreadMessageCount } = useNotification();
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'كيف يعمل؟', path: '/how-it-works' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'h-20 bg-surface/80 backdrop-blur-xl border-b border-outline/10 shadow-sm' : 'h-28 bg-transparent border-b border-transparent'}`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-6 h-full relative">
          {/* Left Side: Profile & Inbox */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={profileRef}>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-xl overflow-hidden transition-all duration-300 border flex items-center justify-center shadow-sm ${isScrolled ? 'bg-on-surface/5 border-on-surface/5 hover:border-primary/30' : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20'}`}
              >
                {user && user.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`} alt="الملف الشخصي" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={18} className={isScrolled ? "text-on-surface-variant" : "text-white"} />
                )}
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                    className="absolute left-0 mt-4 w-64 bg-surface rounded-[1.5rem] shadow-xl border border-outline py-2 z-50 overflow-hidden"
                  >
                    {user ? (
                      <>
                        <div className="px-5 py-4 border-b border-outline/50 bg-background/30">
                          <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                          <p className="text-[10px] text-on-surface-variant truncate font-bold uppercase opacity-50 tracking-widest mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {user && (user.role === 'owner' || user.role === 'admin') && (
                            <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-on-surface hover:bg-outline-variant transition-colors">
                              <LayoutDashboard size={16} className="text-primary opacity-80" />
                              لوحة التحكم
                            </Link>
                          )}
                          <Link to="/edit-profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-on-surface hover:bg-outline-variant transition-colors">
                            <Settings size={16} className="text-primary opacity-80" />
                            الإعدادات
                          </Link>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors border-t border-outline/50 mt-1">
                          <LogOut size={16} />
                          تسجيل الخروج
                        </button>
                      </>
                    ) : (
                      <div className="p-2 space-y-1">
                        <Link to="/login" onClick={() => setIsProfileOpen(false)} className="block px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-on-surface hover:bg-outline-variant rounded-xl transition-colors">تسجيل الدخول</Link>
                        <Link to="/signup" onClick={() => setIsProfileOpen(false)} className="block px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white bg-primary rounded-xl transition-all hover:brightness-110 shadow-lg shadow-primary/20">إنشاء حساب</Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <Link to="/inbox" className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 relative group shadow-sm ${isScrolled ? 'bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:text-primary' : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'}`}>
                  <MessageCircle size={20} className="group-hover:rotate-6 transition-transform" />
                  {unreadMessageCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface"
                    >
                      {unreadMessageCount}
                    </motion.span>
                  )}
                </Link>
                
                <div className="relative" ref={notifRef}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 relative shadow-sm ${isScrolled ? 'bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:text-primary' : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                        className="absolute left-0 mt-4 w-80 bg-surface rounded-[1.5rem] shadow-xl border border-outline py-2 z-[60] overflow-hidden" dir="rtl"
                      >
                        <h3 className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b border-outline/50 text-on-surface-variant">الإشعارات</h3>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? notifications.map(n => (
                            <div 
                              key={n._id} onClick={() => markRead(n._id)}
                              className={`px-5 py-4 hover:bg-outline-variant cursor-pointer flex gap-3 items-center transition-colors ${!n.read ? 'bg-primary/5 border-r-4 border-primary' : ''}`}
                            >
                               <div className="w-10 h-10 rounded-full overflow-hidden bg-outline-variant flex-shrink-0 border border-outline">
                                  {n.sender?.avatar ? <img src={n.sender.avatar.startsWith('http') ? n.sender.avatar : `${BACKEND_URL}${n.sender.avatar}`} className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-on-surface-variant" />}
                               </div>
                               <div className="flex-1">
                                  <p className="text-xs text-on-surface leading-snug"><span className="font-bold">{n.sender?.name}</span> {n.content}</p>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mt-1.5 opacity-40">{new Date(n.createdAt).toLocaleDateString('ar-TN')}</p>
                               </div>
                            </div>
                          )) : (
                            <p className="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-30">لا توجد إشعارات</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 active:scale-95">
            <motion.img 
              layoutId="logo"
              src={darkMode ? logoDark : logo} 
              alt="karya.tn" 
              className={`w-auto transition-all duration-500 ${isScrolled ? 'h-8' : 'h-10 md:h-12'}`} 
            />
          </Link>
          
          {/* Right Side: Desktop Nav */}
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ rotate: 180, scale: 0.8 }}
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl border transition-all duration-300 shadow-sm ${isScrolled ? 'bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:text-primary' : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'}`}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div key="sun" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}><Sun size={20} /></motion.div>
                ) : (
                  <motion.div key="moon" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}><Moon size={20} /></motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-1 transition-colors ${isScrolled ? 'text-on-surface' : 'text-white'}`}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`relative text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isScrolled ? (location.pathname === link.path ? 'text-primary' : 'text-on-surface-variant hover:text-primary') : 'text-white/80 hover:text-white'}`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(220,20,60,0.5)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              {user && (user.role === 'owner' || user.role === 'admin') && (
                <Link to="/post-ad" className="bg-primary text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all text-[10px] uppercase tracking-[0.2em] active:scale-[0.97]">أنشر إعلان</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-0 bg-surface z-[40] pt-24"
          >
            <div className="flex flex-col p-8 gap-4" dir="rtl">
              {[...navLinks, { name: 'لوحة التحكم', path: '/dashboard', icon: 'dashboard' }, { name: 'أنشر إعلان', path: '/post-ad', icon: 'add_circle', primary: true }].map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.path}
                >
                  <Link 
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between p-6 rounded-3xl transition-all ${link.primary ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-background text-on-surface border border-outline hover:border-primary/50'}`}
                  >
                    <span className="text-xl font-bold tracking-tight">{link.name}</span>
                    <span className="material-symbols-outlined">{link.icon || 'arrow_forward'}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Nav (Desktop Only) - Hidden when scrolled */}
      <motion.nav 
        animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -20 : 0 }}
        className="hidden md:flex justify-center gap-16 items-center bg-surface border-b border-outline shadow-sm py-4 z-40 fixed top-28 left-0 right-0 transition-all duration-500" dir="rtl"
      >
        <Link to="/" className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-all opacity-60 hover:opacity-100">البحث عن عقار</Link>
        <Link to="/how-it-works" className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-all opacity-60 hover:opacity-100">طريقة الاستخدام</Link>
        {user && (user.role === 'owner' || user.role === 'admin') && (
          <Link to="/post-ad" className="text-primary font-bold flex items-center gap-2 hover:brightness-110 transition-all uppercase tracking-widest text-[10px]">
             <PlusCircle size={16} />
             أضف إعلانك
          </Link>
        )}
      </motion.nav>

    </>
  );
};

export default Navbar;
