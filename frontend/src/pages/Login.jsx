import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const { login: setAuth } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(formData.email, formData.password);
      setAuth(data);
      showNotification('✅ تم تسجيل الدخول بنجاح! مرحباً بك مرة أخرى.');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 
                      (error.message === 'Network Error' ? '❌ فشل الاتصال بالخادم، تأكد من تشغيل الـ Backend' : '❌ فشل تسجيل الدخول، تأكد من بياناتك');
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
                 <Lock size={32} />
              </div>
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tight">مرحباً بك</h1>
           <p className="text-on-surface-variant font-medium opacity-50 text-lg">سجل دخولك للمتابعة في karya.tn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
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
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">كلمة المرور</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-primary hover:opacity-80 transition-all uppercase tracking-[0.2em]">
                  نسيت كلمة المرور؟
                </Link>
              </div>
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
            {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-outline/50">
          <p className="text-base text-on-surface-variant font-medium opacity-60">
            ليس لديك حساب؟ <Link to="/signup" className="text-primary font-bold hover:opacity-80 transition-all">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
