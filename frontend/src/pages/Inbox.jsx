import React, { useEffect, useState } from 'react';
import { getInbox, getConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MoreVertical, MessageSquare, Filter, User as UserIcon, ArrowRight } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { BACKEND_URL } from '../services/api';

const Inbox = () => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await getInbox();
        setConversations(data || []);
      } catch (error) {
        console.error('Failed to load inbox', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  const handleSelectConversation = async (user) => {
    if (!user?._id) return;
    setActiveUser(user);
    try {
      const { data } = await getConversation(user._id);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load conversation', error);
      setMessages([]);
    }
  };

  const filteredConversations = (conversations || []).filter(c => 
    c?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background gap-4">
       <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
       <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest opacity-40">جاري تحميل الرسائل...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex justify-center items-start pt-32 md:pt-48 pb-8 px-4 md:px-8" dir="rtl">
      <div className="w-full max-w-[1600px] h-[calc(100vh-180px)] md:h-[calc(100vh-220px)] bg-surface rounded-[2rem] md:rounded-[3.5rem] shadow-2xl flex overflow-hidden border border-outline relative transition-all duration-500 group/container">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 group-hover/container:bg-primary/10 transition-colors duration-1000"></div>
        
        {/* Left Sidebar: Conversations */}
        <div className={`w-full md:w-[450px] flex-shrink-0 flex flex-col border-l border-outline relative z-10 ${activeUser ? 'hidden md:flex' : 'flex'}`}>
           {/* Sidebar Header */}
           <div className="h-20 flex items-center justify-between px-8 border-b border-outline bg-surface/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-outline shadow-md ring-4 ring-primary/5">
                   {currentUser?.avatar ? (
                     <img 
                        src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `${BACKEND_URL}${currentUser.avatar}`} 
                        className="w-full h-full object-cover" 
                        alt="my profile"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-background text-on-surface-variant/20"><UserIcon size={20} /></div>
                   )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface tracking-tight line-clamp-1 leading-none mb-1.5">{currentUser?.name || 'مستخدم'}</p>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                     <p className="text-[9px] text-green-500 font-bold uppercase tracking-[0.2em]">متصل</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant/40">
                 <button className="hover:text-primary transition-colors p-2 hover:bg-background rounded-xl"><MessageSquare size={18} /></button>
                 <button className="hover:text-primary transition-colors p-2 hover:bg-background rounded-xl"><MoreVertical size={18} /></button>
              </div>
           </div>

           {/* Search */}
           <div className="p-6 border-b border-outline">
              <div className="relative group/input">
                 <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={18} />
                 <input 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full h-14 pr-14 pl-6 bg-background/50 rounded-2xl outline-none text-sm font-bold text-on-surface focus:ring-4 focus:ring-primary/5 border border-outline focus:border-primary transition-all placeholder:opacity-20"
                   placeholder="البحث في المحادثات..."
                 />
              </div>
           </div>

           {/* Conversation List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {filteredConversations.length === 0 ? (
                 <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto border border-dashed border-outline opacity-40">
                       <MessageSquare size={32} className="text-on-surface-variant" />
                    </div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-40">لا توجد محادثات نشطة</p>
                 </div>
              ) : (
                 <div className="space-y-2">
                   {filteredConversations.map(conv => (
                      <div 
                        key={conv?._id || Math.random()}
                        onClick={() => handleSelectConversation(conv)}
                        className={`flex items-center gap-5 p-5 cursor-pointer rounded-[2rem] transition-all border border-transparent group relative ${activeUser?._id === conv?._id ? 'bg-primary/5 border-primary/10 shadow-sm' : 'hover:bg-background/50'}`}
                      >
                         <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background flex-shrink-0 border border-outline shadow-sm group-hover:scale-105 transition-transform duration-500">
                            {conv?.avatar ? (
                              <img 
                                src={conv.avatar.startsWith('http') ? conv.avatar : `${BACKEND_URL}${conv.avatar}`} 
                                className="w-full h-full object-cover" 
                                alt={conv.name}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20"><UserIcon size={24} /></div>
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1.5">
                               <h4 className={`font-bold text-sm truncate tracking-tight transition-colors ${activeUser?._id === conv?._id ? 'text-primary' : 'text-on-surface'}`}>{conv?.name || 'مستخدم'}</h4>
                               <span className="text-[9px] font-bold text-on-surface-variant opacity-30 uppercase">--:--</span>
                            </div>
                            <p className="text-xs text-on-surface-variant font-medium truncate opacity-50">اضغط لمشاهدة الرسائل...</p>
                         </div>
                         {activeUser?._id === conv?._id && (
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                         )}
                      </div>
                   ))}
                 </div>
              )}
           </div>
        </div>

        {/* Right Pane: Chat Window */}
        <div className={`flex-1 min-w-0 flex flex-col relative z-20 bg-background/20 ${!activeUser ? 'hidden md:flex' : 'flex'}`}>
           {activeUser && (
              <button 
                onClick={() => setActiveUser(null)}
                className="md:hidden absolute top-6 right-6 z-50 bg-surface/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-outline text-on-surface hover:text-primary transition-all active:scale-95"
              >
                <ArrowRight size={24} />
              </button>
           )}
           <ChatWindow 
             activeUser={activeUser} 
             currentUser={currentUser} 
             messages={messages}
             setMessages={setMessages}
           />
        </div>
      </div>
    </div>
  );
};

export default Inbox;
