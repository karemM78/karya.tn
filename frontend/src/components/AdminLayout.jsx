import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  User
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Listings', path: '/admin/listings', icon: <Home size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background transition-theme">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-surface border-l border-outline-variant transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        dir="rtl"
      >
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-outline-variant flex items-center justify-between">
            <Link to="/" className="font-manrope text-2xl font-black text-primary">karya.tn</Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-on-surface-variant">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-primary/5 text-primary' : 'text-on-surface-variant hover:bg-background hover:text-on-surface'}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-outline-variant">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold text-primary hover:bg-primary/5 transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-surface border-b border-outline-variant flex items-center justify-between px-8 transition-theme">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-on-surface-variant">
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden md:flex items-center bg-background border border-outline-variant rounded-2xl px-4 py-2 w-96 group focus-within:border-primary transition-all">
            <Search size={18} className="text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium pr-3" 
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary border-2 border-surface rounded-full"></span>
            </button>

            <div className="flex items-center gap-4 border-r border-outline-variant pr-6">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-on-surface line-clamp-1">{user?.name}</p>
                <p className="text-xs text-on-surface-variant">Admin Dashboard</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/5 border border-outline-variant flex items-center justify-center text-primary">
                 {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
