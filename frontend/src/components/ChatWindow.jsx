import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Image, Mic, Phone, Video, MoreVertical, 
  Paperclip, X, Play, Pause, MessageSquare, User as UserIcon 
} from 'lucide-react';
import { sendMessage, uploadChatMedia, getProperty, BACKEND_URL } from '../services/api';
import { io } from 'socket.io-client';

const socket = io(BACKEND_URL);

const ChatWindow = ({ activeUser, currentUser, messages = [], setMessages, initialPropertyId }) => {
  const [content, setContent] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [referencedProperty, setReferencedProperty] = useState(null);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (initialPropertyId) {
      const fetchProp = async () => {
        try {
          const { data } = await getProperty(initialPropertyId);
          setReferencedProperty(data);
        } catch (err) {
          console.error('Failed to fetch property context', err);
        }
      };
      fetchProp();
    }
  }, [initialPropertyId]);
  
  const scrollRef = useRef();
  const mediaInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit('join', currentUser._id);
    }

    const handleMessage = (message) => {
      if (message?.sender?._id === activeUser?._id || message?.sender === activeUser?._id) {
        setMessages((prev) => [...(prev || []), message]);
      }
    };

    socket.on('messageReceived', handleMessage);

    return () => {
      socket.off('messageReceived', handleMessage);
    };
  }, [currentUser, activeUser, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() && !mediaFile && !audioBlob) return;
    if (!activeUser?._id) return;

    let mediaUrl = '';
    let messageType = 'text';

    try {
      if (mediaFile || audioBlob) {
        const formData = new FormData();
        formData.append('media', mediaFile || audioBlob);
        const { data } = await uploadChatMedia(formData);
        mediaUrl = data;
        messageType = mediaFile ? 'image' : 'voice';
      }

      const messageData = {
        recipientId: activeUser._id,
        content: content.trim(),
        messageType,
        mediaUrl,
        propertyId: referencedProperty?._id || null,
      };

      const { data } = await sendMessage(messageData);
      
      socket.emit('sendMessage', { ...data, recipient: activeUser._id });

      setMessages((prev) => [...(prev || []), data]);
      setContent('');
      setMediaPreview(null);
      setMediaFile(null);
      setAudioBlob(null);
      setReferencedProperty(null);
      setError(null);
    } catch (error) {
      console.error('Failed to send message', error);
      setError('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setMediaPreview('voice_note');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording failed', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingTime(0);
  };

  if (!activeUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-on-surface-variant p-10 text-center relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -z-10"
        />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-outline"
        >
           <MessageSquare size={48} className="text-primary" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black text-on-surface mb-3 tracking-tighter uppercase"
        >
          رسائلك في مكان واحد
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.4 }}
          className="max-w-xs font-bold leading-relaxed"
        >
          اختر محادثة من القائمة الجانبية للبدء في التواصل مع أصحاب العقارات والباحثين عن كراء بشكل آمن ومباشر.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-20 bg-surface/80 backdrop-blur-xl border-b border-outline flex items-center justify-between px-6 z-20 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl overflow-hidden bg-background border border-outline shadow-md"
          >
            {activeUser?.avatar ? (
              <img 
                src={activeUser.avatar.startsWith('http') ? activeUser.avatar : `${BACKEND_URL}${activeUser.avatar}`} 
                className="w-full h-full object-cover" 
                alt={activeUser.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-20"><UserIcon size={24} /></div>
            )}
          </motion.div>
          <div>
            <h3 className="font-black text-base text-on-surface tracking-tight uppercase">{activeUser?.name || 'مستخدم'}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">متصل الآن</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} className="p-3 rounded-xl hover:bg-background text-on-surface-variant hover:text-primary transition-all"><Video size={20} /></motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="p-3 rounded-xl hover:bg-background text-on-surface-variant hover:text-primary transition-all"><Phone size={20} /></motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="p-3 rounded-xl hover:bg-background text-on-surface-variant hover:text-primary transition-all"><MoreVertical size={20} /></motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_15%)] bg-opacity-5">
        <AnimatePresence initial={false}>
          {(messages || []).map((msg, i) => {
            if (!msg) return null;
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === currentUser?._id;
            
            return (
              <motion.div 
                key={msg._id || i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl shadow-xl relative border ${
                  isMe 
                  ? 'bg-primary text-white border-transparent rounded-tl-none' 
                  : 'bg-surface text-on-surface border-outline rounded-tr-none'
                }`}>
                  {msg.property && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`mb-3 p-3 rounded-2xl flex items-center gap-4 border ${isMe ? 'bg-white/10 border-white/20' : 'bg-background border-outline'}`}
                    >
                       <img 
                          src={msg.property?.images?.[0] ? (msg.property.images[0].startsWith('http') ? msg.property.images[0] : `${BACKEND_URL}${msg.property.images[0]}`) : 'https://via.placeholder.com/100'} 
                          className="w-12 h-12 rounded-xl object-cover shadow-lg" 
                          alt="property"
                       />
                       <div className="min-w-0">
                          <p className={`text-[10px] font-black uppercase tracking-tight truncate ${isMe ? 'text-white' : 'text-on-surface'}`}>{msg.property?.title || 'عقار'}</p>
                          <p className={`text-[9px] font-bold ${isMe ? 'text-white/70' : 'text-primary'}`}>{msg.property?.price || 0} TND</p>
                       </div>
                    </motion.div>
                  )}

                  {msg.messageType === 'image' && msg.mediaUrl && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-black/10 shadow-inner bg-black/5">
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${BACKEND_URL}${msg.mediaUrl}`} 
                        className="w-full max-h-[400px] object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                        alt="chat" 
                      />
                    </div>
                  )}
                  
                  {msg.messageType === 'voice' && (
                    <div className={`flex items-center gap-4 py-2 px-3 min-w-[220px] rounded-2xl ${isMe ? 'bg-white/10' : 'bg-background border border-outline'}`}>
                       <motion.button whileTap={{ scale: 0.9 }} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isMe ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                          <Play size={16} fill="currentColor" />
                       </motion.button>
                       <div className="flex-1 space-y-1">
                          <div className={`h-1.5 rounded-full relative ${isMe ? 'bg-white/20' : 'bg-outline-variant'}`}>
                             <div className={`absolute left-0 top-0 h-full w-1/3 rounded-full ${isMe ? 'bg-white' : 'bg-primary'}`}></div>
                          </div>
                          <div className="flex justify-between items-center px-1">
                             <span className={`text-[9px] font-bold ${isMe ? 'text-white/60' : 'text-on-surface-variant opacity-60'}`}>0:12</span>
                             <Mic size={12} className={isMe ? 'text-white/60' : 'text-primary'} />
                          </div>
                       </div>
                    </div>
                  )}

                  <p className={`text-sm font-bold leading-relaxed px-1 ${isMe ? 'text-white' : 'text-on-surface'}`}>{msg.content}</p>
                  
                  <div className={`flex items-center justify-end gap-1 mt-2 opacity-40 text-[9px] font-black uppercase tracking-tighter ${isMe ? 'text-white' : 'text-on-surface-variant'}`} dir="ltr">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    {isMe && <span className="ml-1 text-[12px]">✓✓</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-surface/50 backdrop-blur-xl border-t border-outline flex items-center gap-3 z-30">
        <div className="flex items-center gap-1">
           <input type="file" ref={mediaInputRef} onChange={handleMediaChange} className="hidden" accept="image/*" />
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => mediaInputRef.current?.click()} className="p-3 rounded-2xl hover:bg-background text-on-surface-variant hover:text-primary transition-all">
              <Paperclip size={22} />
           </motion.button>
        </div>

        <div className="flex-1 relative">
           <AnimatePresence>
             {referencedProperty && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-full left-0 right-0 mb-4 bg-surface p-4 rounded-3xl shadow-2xl border border-outline flex items-center justify-between z-40"
                >
                   <div className="flex items-center gap-4">
                      <img src={referencedProperty.images?.[0] ? (referencedProperty.images[0].startsWith('http') ? referencedProperty.images[0] : `${BACKEND_URL}${referencedProperty.images[0]}`) : 'https://via.placeholder.com/100'} className="w-14 h-14 rounded-2xl object-cover shadow-xl" alt="prop" />
                      <div>
                         <p className="text-xs font-black text-on-surface uppercase tracking-tight">{referencedProperty.title}</p>
                         <p className="text-[10px] text-primary font-black">{referencedProperty.price} TND</p>
                      </div>
                   </div>
                   <button onClick={() => setReferencedProperty(null)} className="p-2 bg-background hover:bg-outline-variant text-on-surface-variant rounded-xl transition-all"><X size={18} /></button>
                </motion.div>
             )}
             
             {mediaPreview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute bottom-full left-0 mb-6 bg-surface p-3 rounded-3xl shadow-2xl border border-outline flex items-center gap-4 min-w-[240px] z-40"
                >
                   {mediaPreview === 'voice_note' ? (
                      <div className="flex items-center gap-4 text-primary font-black px-3 py-2 bg-background rounded-2xl border border-primary/10">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse"><Mic size={20} /></div>
                         <span className="text-xs uppercase tracking-widest">ملاحظة صوتية جاهزة</span>
                      </div>
                   ) : (
                      <img src={mediaPreview} className="w-20 h-20 rounded-2xl object-cover shadow-2xl border border-outline" alt="preview" />
                   )}
                   <button onClick={() => { setMediaPreview(null); setMediaFile(null); setAudioBlob(null); }} className="p-2 bg-background hover:bg-red-500 hover:text-white text-on-surface-variant rounded-xl transition-all"><X size={18} /></button>
                </motion.div>
             )}
           </AnimatePresence>

           {isRecording ? (
              <div className="w-full h-14 bg-background rounded-2xl flex items-center justify-between px-6 border border-primary/30 shadow-inner">
                 <div className="flex items-center gap-4 text-primary font-black">
                    <div className="w-3 h-3 rounded-full bg-primary animate-ping"></div>
                    <span className="font-mono text-lg">{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
                 </div>
                 <button onClick={stopRecording} className="text-xs font-black uppercase tracking-widest text-primary hover:brightness-125 transition-all">إيقاف الترسيل</button>
              </div>
           ) : (
              <form onSubmit={handleSend} className="w-full">
                <input 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-14 px-8 rounded-2xl bg-background border border-transparent focus:border-primary/30 focus:shadow-lg outline-none text-sm font-bold text-on-surface transition-all placeholder:text-on-surface-variant/30"
                  placeholder="اكتب رسالة..."
                />
              </form>
           )}
        </div>

        <div className="flex items-center">
          <AnimatePresence mode="wait">
            {content.trim() || mediaFile || audioBlob ? (
              <motion.button 
                key="send"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleSend} 
                className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
              >
                 <Send size={24} className="mr-1" />
              </motion.button>
            ) : (
              <motion.button 
                key="mic"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${isRecording ? 'bg-red-500 scale-125 shadow-red-500/50' : 'bg-surface border border-outline hover:border-primary/50 text-on-surface-variant hover:text-primary'} `}
              >
                 <Mic size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
