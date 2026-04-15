import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Clock, CheckCircle, User, Mail, Plus, Search, AlertCircle } from 'lucide-react';

export default function Support() {
  const { isAdmin, user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    try {
      const newReply = {
        sender: isAdmin ? 'Admin' : 'User',
        message: reply,
        timestamp: new Date().toISOString()
      };

      const updatedReplies = [...(selectedTicket.replies || []), newReply];
      
      await updateDoc(doc(db, 'tickets', selectedTicket.id), {
        replies: updatedReplies,
        status: isAdmin ? 'replied' : 'open'
      });

      setReply('');
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleCreateTestTicket = async () => {
    try {
      await addDoc(collection(db, 'tickets'), {
        userId: user?.uid,
        userEmail: user?.email,
        subject: 'Test Support Ticket',
        message: 'This is a test ticket to verify the support system is working.',
        status: 'open',
        replies: [],
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating test ticket:", error);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading tickets...</div>;

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
          <p className="text-slate-500 mt-1">Manage customer inquiries and website support tickets.</p>
        </div>
        <button
          onClick={handleCreateTestTicket}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Test Ticket
        </button>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Ticket List */}
        <div className="w-1/3 glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-900 dark:text-white">All Tickets</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${
                  selectedTicket?.id === ticket.id ? "bg-blue-500/5 dark:bg-blue-500/10 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {ticket.subject}
                  </span>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-[10px] text-slate-500 truncate">{ticket.userEmail}</p>
                <div className="flex items-center mt-2 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-500">{selectedTicket.userEmail}</p>
                  </div>
                </div>
                <StatusBadge status={selectedTicket.status} />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Original Message */}
                <div className="flex flex-col items-start">
                  <div className="max-w-[80%] bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                    <p className="text-sm text-slate-900 dark:text-white">{selectedTicket.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((r: any, idx: number) => (
                  <div key={idx} className={`flex flex-col ${r.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      r.sender === 'Admin' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                    }`}>
                      <p className="text-sm">{r.message}</p>
                      <span className={`text-[10px] mt-2 block ${r.sender === 'Admin' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(r.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                  />
                  <button type="submit" className="btn-primary flex items-center px-6">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p>Select a ticket to view conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    open: 'bg-red-500/10 text-red-500 border-red-500/20',
    replied: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    closed: 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}
