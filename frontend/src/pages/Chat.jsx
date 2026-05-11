import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getConversation, getUserById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ArrowRight, UserCircle } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const { user: currentUser } = useAuth();
  const { fetchNotifications } = useNotification();
  
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [msgRes, userRes] = await Promise.all([
          getConversation(userId).catch(err => ({ data: [] })),
          getUserById(userId).catch(err => ({ data: null }))
        ]);
        setMessages(msgRes.data || []);
        setRecipient(userRes.data);
        if (!userRes.data) {
          setError('المستخدم غير موجود');
        } else {
          // Refresh counts as messages were marked read on backend
          fetchNotifications();
        }
      } catch (error) {
        console.error('Failed to load chat', error);
        setError('فشل تحميل المحادثة');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background gap-4">
       <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
       <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-40">جاري تحميل المحادثة...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background p-6 text-center">
       <div className="bg-surface p-10 md:p-16 rounded-[3rem] shadow-sm border border-outline space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto text-primary">
             <ArrowRight size={40} className="rotate-180" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">{error}</h2>
          <Link to="/inbox" className="btn-primary py-4 px-8 rounded-2xl flex items-center gap-3 justify-center text-sm">
             <ArrowRight size={18} />
             <span>العودة للبريد الوارد</span>
          </Link>
       </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] bg-background flex flex-col" dir="rtl">
       {/* Mobile Header (Standalone Chat) */}
       <div className="md:hidden h-20 bg-surface/80 backdrop-blur-xl border-b border-outline flex items-center px-6 gap-5 shadow-lg z-50">
          <Link to="/inbox" className="text-on-surface-variant hover:text-primary transition-colors">
             <ArrowRight size={28} />
          </Link>
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-background border border-outline shadow-sm">
             {recipient?.avatar ? <img src={recipient.avatar.startsWith('http') ? recipient.avatar : `${BACKEND_URL}${recipient.avatar}`} className="w-full h-full object-cover" alt={recipient.name} /> : <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20"><UserCircle size={24} /></div>}
          </div>
          <div className="min-w-0">
             <h2 className="font-bold text-on-surface text-lg tracking-tight truncate leading-none mb-1">{recipient?.name || 'مستخدم'}</h2>
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-[0.2em]">متصل</span>
             </div>
          </div>
       </div>

       <div className="flex-1 overflow-hidden max-w-[1600px] mx-auto w-full md:p-8 md:pt-4">
          <div className="h-full bg-surface md:rounded-[3rem] shadow-sm border border-outline overflow-hidden flex flex-col group relative">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000"></div>
             <ChatWindow 
               activeUser={recipient} 
               currentUser={currentUser} 
               messages={messages}
               setMessages={setMessages}
               initialPropertyId={propertyId}
             />
          </div>
       </div>
    </div>
  );
};

export default Chat;
