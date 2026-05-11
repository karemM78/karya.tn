import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Lock, Building2, UserCircle, Loader2 } from 'lucide-react';

const Signup = () => {
  const { login: setAuth } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await signup(formData);
      setAuth(data);
      showNotification('✅ تم إنشاء الحساب بنجاح! مرحباً بك.');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.message || 
                      (error.message === 'Network Error' ? '❌ فشل الاتصال بالخادم، تأكد من تشغيل الـ Backend' : '❌ حدث خطأ أثناء التسجيل، حاول مرة أخرى');
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background py-16 px-6" dir="rtl">
      <div className="max-w-[500px] w-full bg-surface p-10 md:p-14 rounded-[3rem] shadow-sm border border-outline space-y-12 animate-in fade-in slide-in-from-bottom-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000"></div>
        
        <div className="text-center space-y-4">
           <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                 <UserCircle size={32} />
              </div>
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tight">إنشاء حساب</h1>
           <p className="text-on-surface-variant font-medium opacity-50 text-lg">انضم إلى مجتمع karya.tn اليوم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex gap-4 p-2 bg-background/50 rounded-2xl border border-outline shadow-inner">
             <button 
               type="button" 
               onClick={() => setFormData({...formData, role: 'client'})}
               className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-sm ${formData.role === 'client' ? 'bg-surface shadow-sm text-primary border border-outline' : 'text-on-surface-variant opacity-40 hover:opacity-60'}`}
             >
                <UserCircle size={20} />
                باحث عن كراء
             </button>
             <button 
               type="button" 
               onClick={() => setFormData({...formData, role: 'owner'})}
               className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-sm ${formData.role === 'owner' ? 'bg-surface shadow-sm text-primary border border-outline' : 'text-on-surface-variant opacity-40 hover:opacity-60'}`}
             >
                <Building2 size={20} />
                صاحب عقار
             </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">الاسم الكامل</label>
              <div className="relative group/input">
                <User className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={20} />
                <input 
                  required 
                  name="name" 
                  placeholder="محمد بن علي" 
                  onChange={handleChange} 
                  className="w-full h-16 md:h-20 pr-16 pl-8 rounded-2xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg placeholder:opacity-20" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">البريد الإلكتروني</label>
              <div className="relative group/input">
                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={20} />
                <input 
                  required 
                  type="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  onChange={handleChange} 
                  className="w-full h-16 md:h-20 pr-16 pl-8 rounded-2xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg placeholder:opacity-20" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">كلمة المرور</label>
              <div className="relative group/input">
                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={20} />
                <input 
                  required 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  onChange={handleChange} 
                  className="w-full h-16 md:h-20 pr-16 pl-8 rounded-2xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg placeholder:opacity-20" 
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="btn-primary w-full flex items-center justify-center gap-4 disabled:opacity-50 py-6 text-xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-outline/50">
          <p className="text-base text-on-surface-variant font-medium opacity-60">
            لديك حساب بالفعل؟ <Link to="/login" className="text-primary font-bold hover:opacity-80 transition-all">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
