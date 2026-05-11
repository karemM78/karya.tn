import React, { useEffect, useState } from 'react';
import { getAdminUsers, updateAdminUserRole, deleteAdminUser } from '../services/api';
import { Trash2, ShieldCheck, UserCog, MoreVertical, Search, ShieldAlert } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const fetchUsers = async () => {
    try {
      const { data } = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateAdminUserRole(id, newRole);
      showNotification(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      showNotification('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteAdminUser(id);
      showNotification('User deleted successfully');
      fetchUsers();
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">إدارة الصلاحيات</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tight">قاعدة المستخدمين</h1>
           <p className="text-on-surface-variant font-medium opacity-50 text-lg">التحكم في أدوار المستخدمين وإدارة الحسابات المسجلة.</p>
        </div>
        
        <div className="flex items-center bg-surface border border-outline rounded-2xl px-5 py-3 w-full md:w-96 group focus-within:border-primary/30 transition-all shadow-sm">
          <Search size={20} className="text-on-surface-variant/40" />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو البريد..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold pr-4 placeholder:text-on-surface-variant/20" 
          />
        </div>
      </div>

      <div className="bg-surface rounded-[2.5rem] border border-outline shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-background/20 border-b border-outline">
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">الاسم</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">البريد الإلكتروني</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">الدور</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {loading ? (
                <tr><td colSpan="4" className="py-24 text-center">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto opacity-20"></div>
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="py-24 text-center">
                   <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest opacity-20">لا توجد نتائج مطابقة</p>
                </td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-background/10 transition-colors">
                  <td className="px-10 py-6 font-bold text-on-surface tracking-tight">{user.name}</td>
                  <td className="px-10 py-6 text-on-surface-variant font-medium opacity-60">{user.email}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${user.role === 'admin' ? 'bg-primary/5 text-primary border-primary/10' : user.role === 'owner' ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' : 'bg-on-surface-variant/5 text-on-surface-variant border-outline'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-4">
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-background border border-outline rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/30 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="client">Client</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant/20 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
