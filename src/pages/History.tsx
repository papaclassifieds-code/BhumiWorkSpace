import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Calendar, UserCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function History() {
  const { user, dbUser } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const attendanceRef = collection(db, `users/${user!.uid}/attendance`);
      const q = query(attendanceRef, orderBy('date', 'desc'), limit(30));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err: any) {
      if (err.message?.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.LIST, `users/${user!.uid}/attendance`);
      } else {
         console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-200 rounded-xl" />)}
     </div>;
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-sm flex flex-col justify-between">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-slate-900" />
          My Profile
        </h2>
        <div className="grid grid-cols-2 gap-8">
           <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Name</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter">{dbUser?.displayName || 'N/A'}</p>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Role</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter capitalize">{dbUser?.role}</p>
           </div>
           <div className="col-span-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Email</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter">{dbUser?.email}</p>
           </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 lg:p-10 border-b border-slate-200">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <Calendar className="w-5 h-5 text-slate-900" />
             Past 30 Days Attendance
           </h2>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm font-medium italic">
             No attendance history found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 pb-2">
            {logs.map(log => (
              <div key={log.id} className="p-6 lg:px-10 py-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-black text-lg text-slate-900 tracking-tight">
                     {log.date}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                     In: {log.clockIn ? format(log.clockIn.toDate(), 'hh:mm a') : 'N/A'} • 
                     Out: {log.clockOut ? format(log.clockOut.toDate(), 'hh:mm a') : 'N/A'}
                  </p>
                </div>
                <div>
                   <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     log.status === 'working' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                     log.status === 'present' ? 'bg-green-100 text-green-700 border border-green-200' :
                     'bg-red-100 text-red-700 border border-red-200'
                   }`}>
                     {log.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
