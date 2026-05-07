import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, query, where, getDocs, setDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Clock, MapPin, CheckCircle2, CircleDashed, Plus, LogOut, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [taskDescription, setTaskDescription] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    fetchTodayData();
  }, [user]);

  const fetchTodayData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch Attendance
      const attendanceRef = collection(db, `users/${user.uid}/attendance`);
      const qAtt = query(attendanceRef, where('date', '==', todayStr));
      const attSnap = await getDocs(qAtt);
      
      if (!attSnap.empty) {
        setCurrentLog({ id: attSnap.docs[0].id, ...attSnap.docs[0].data() });
      } else {
        setCurrentLog(null);
      }

      // Fetch Tasks
      const tasksRef = collection(db, `users/${user.uid}/tasks`);
      const qTasks = query(tasksRef, where('date', '==', todayStr), orderBy('createdAt', 'desc'));
      const tasksSnap = await getDocs(qTasks);
      setTasks(tasksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err: any) {
      if (err.message?.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/...`);
      } else {
         console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Geolocation not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => resolve("Location denied")
      );
    });
  };

  const handleClockIn = async () => {
    if (!user) return;
    const locationStr = await getLocation();
    const newDocRef = doc(collection(db, `users/${user.uid}/attendance`));
    
    const payloadData = {
      date: todayStr,
      clockIn: serverTimestamp(),
      clockInLocation: locationStr,
      status: 'working',
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(newDocRef, payloadData);
      await fetchTodayData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, newDocRef.path);
    }
  };

  const handleClockOut = async () => {
    if (!user || !currentLog) return;
    const locationStr = await getLocation();
    const docRef = doc(db, `users/${user.uid}/attendance`, currentLog.id);
    
    const payloadData = {
      clockOut: serverTimestamp(),
      clockOutLocation: locationStr,
      status: 'present',
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(docRef, payloadData);
      await fetchTodayData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docRef.path);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskDescription.trim()) return;
    setSubmittingTask(true);

    const newDocRef = doc(collection(db, `users/${user.uid}/tasks`));
    const payloadData = {
      date: todayStr,
      description: taskDescription.trim(),
      status: 'completed', // Defaults to completed for quick logging
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(newDocRef, payloadData);
      setTaskDescription('');
      await fetchTodayData();
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, newDocRef.path);
    } finally {
      setSubmittingTask(false);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4">
      <div className="h-32 bg-stone-200 rounded-xl"></div>
      <div className="h-64 bg-stone-200 rounded-xl"></div>
    </div>;
  }

  const isClockedIn = !!currentLog;
  const hasClockedOut = isClockedIn && !!currentLog.clockOut;

  return (
    <div className="space-y-8">
      <section className="bg-[#1e293b] rounded-3xl p-8 lg:p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
           <div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">Current Status</p>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-4">
                 {!isClockedIn ? 'Not Started' : (!hasClockedOut ? 'Shift Active' : 'Completed')}
              </h2>
           </div>
           {isClockedIn && currentLog?.clockInLocation && (
              <div className="hidden sm:flex items-center gap-2">
                 <span className="px-3 sm:px-4 py-2 bg-white/10 text-white/60 text-[10px] sm:text-xs font-black uppercase rounded-full tracking-widest">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Logged
                 </span>
              </div>
           )}
        </div>
        
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-end justify-between relative z-10">
           {!isClockedIn ? (
              <button
                onClick={handleClockIn}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl shadow-lg transition-colors w-full sm:w-auto"
              >
                Start Shift (Clock In)
              </button>
           ) : !hasClockedOut ? (
               <button
                  onClick={handleClockOut}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl shadow-lg transition-colors w-full sm:w-auto"
                >
                  Mark Attendance Out
                </button>
           ) : (
             <div className="px-6 py-5 bg-white/10 text-white rounded-2xl w-full flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h3 className="font-bold text-sm tracking-widest uppercase">Shift Completed</h3>
             </div>
           )}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-sm">
        <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Productivity Tasks</p>

        <form onSubmit={handleAddTask} className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="What task did you complete?"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="flex-1 border-2 border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-800 transition-all font-medium text-slate-900"
            disabled={submittingTask || (!isClockedIn || hasClockedOut)}
          />
          <button 
            type="submit" 
            disabled={submittingTask || !taskDescription.trim() || (!isClockedIn || hasClockedOut)}
            className="bg-[#1e293b] hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-200 text-white px-6 rounded-2xl transition-colors shadow-md"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        {(!isClockedIn || hasClockedOut) && (
          <p className="text-xs font-bold text-amber-600 bg-amber-50 px-4 py-3 rounded-xl mb-6 uppercase tracking-wider">
            Active shift required to log tasks
          </p>
        )}

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 font-medium text-center italic">No tasks logged today.</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
                <span className="text-sm font-bold text-slate-800">{task.description}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 sm:mt-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Completed
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
