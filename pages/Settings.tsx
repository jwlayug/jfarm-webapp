import React, { useRef, useState } from 'react';
import { Settings as SettingsIcon, Moon, Bell, Lock, User, Database, Download, Trash2, Upload, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { collection, getDocs, writeBatch, doc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTIONS = [
  'employees', 
  'groups', 
  'travels', 
  'lands', 
  'plates', 
  'destinations', 
  'drivers', 
  'debts',
  'expenses' // Assuming generic expenses might be stored here or under travels
];

const Settings: React.FC = () => {
  const [loading, setLoading] = useState<'backup' | 'delete' | 'restore' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BACKUP FUNCTION ---
  const handleBackup = async () => {
    setLoading('backup');
    setStatusMsg(null);
    try {
      const backupData: Record<string, any[]> = {};

      for (const colName of COLLECTIONS) {
        const querySnapshot = await getDocs(collection(db, colName));
        backupData[colName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jfarm_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatusMsg({ type: 'success', text: 'Backup downloaded successfully.' });
    } catch (error) {
      console.error("Backup failed", error);
      setStatusMsg({ type: 'error', text: 'Failed to generate backup.' });
    } finally {
      setLoading(null);
    }
  };

  // --- DELETE ALL FUNCTION ---
  const handleDeleteAll = async () => {
    if (!window.confirm('DANGER: This will permanently delete ALL data from the database. Are you sure?')) return;
    if (!window.confirm('Double Check: This action cannot be undone. Confirm deletion?')) return;

    setLoading('delete');
    setStatusMsg(null);
    try {
      for (const colName of COLLECTIONS) {
        const q = query(collection(db, colName));
        const snapshot = await getDocs(q);
        
        // Firestore batch limit is 500
        const chunks = [];
        let currentChunk = [];
        
        snapshot.docs.forEach(doc => {
          currentChunk.push(doc);
          if (currentChunk.length === 500) {
            chunks.push([...currentChunk]);
            currentChunk = [];
          }
        });
        if (currentChunk.length > 0) chunks.push(currentChunk);

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach(docSnap => {
             batch.delete(doc(db, colName, docSnap.id));
          });
          await batch.commit();
        }
      }
      setStatusMsg({ type: 'success', text: 'All data has been permanently deleted.' });
    } catch (error) {
      console.error("Delete failed", error);
      setStatusMsg({ type: 'error', text: 'Failed to delete data.' });
    } finally {
      setLoading(null);
    }
  };

  // --- RESTORE FUNCTION ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRestore(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestore = async (file: File) => {
    if (!window.confirm('This will import data and merge/overwrite existing records. Continue?')) return;

    setLoading('restore');
    setStatusMsg(null);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Iterate collections in the JSON
        for (const [colName, items] of Object.entries(json)) {
           if (!Array.isArray(items)) continue;

           // Batch writes (500 limit)
           const chunks = [];
           let currentChunk = [];
           for (const item of items) {
              currentChunk.push(item);
              if (currentChunk.length === 500) {
                chunks.push([...currentChunk]);
                currentChunk = [];
              }
           }
           if (currentChunk.length > 0) chunks.push(currentChunk);

           for (const chunk of chunks) {
             const batch = writeBatch(db);
             chunk.forEach((item: any) => {
                if (item.id) {
                   const { id, ...data } = item;
                   batch.set(doc(db, colName, id), data);
                }
             });
             await batch.commit();
           }
        }
        
        setStatusMsg({ type: 'success', text: 'Data restored successfully. Please refresh the page.' });
      } catch (error) {
        console.error("Restore failed", error);
        setStatusMsg({ type: 'error', text: 'Invalid backup file or upload failed.' });
      } finally {
        setLoading(null);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
         <h1 className="text-2xl font-bold text-sage-800">Settings</h1>
         <p className="text-sage-500 text-sm">Manage your application preferences and data.</p>
      </div>

      {/* --- DATABASE MANAGEMENT SECTION --- */}
      <section>
         <h2 className="text-lg font-bold text-sage-700 mb-4 flex items-center gap-2">
            <Database size={20} /> Database Management
         </h2>
         
         {statusMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 font-medium
              ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}
            `}>
              {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {statusMsg.text}
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Backup Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
               <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                  <Download size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Backup</h3>
               <p className="text-xs text-sage-500 mb-6 flex-1">Download all data as a JSON backup file to your local storage.</p>
               <button 
                 onClick={handleBackup}
                 disabled={!!loading}
                 className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
               >
                 {loading === 'backup' ? <Loader2 size={16} className="animate-spin" /> : 'Backup Now'}
               </button>
            </div>

            {/* Delete All Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
               <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                  <Trash2 size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Delete All</h3>
               <p className="text-xs text-sage-500 mb-6 flex-1">Permanently remove all collections and data from the database.</p>
               <button 
                 onClick={handleDeleteAll}
                 disabled={!!loading}
                 className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
               >
                 {loading === 'delete' ? <Loader2 size={16} className="animate-spin" /> : 'Delete All'}
               </button>
            </div>

            {/* Restore Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
               <div className="p-4 bg-sage-100 text-sage-600 rounded-full mb-4">
                  <Upload size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Restore</h3>
               <p className="text-xs text-sage-500 mb-6 flex-1">Restore data from a backup JSON file. Merges with existing data.</p>
               
               <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json"
                  className="hidden"
               />
               
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={!!loading}
                 className="w-full py-2 px-4 bg-sage-600 hover:bg-sage-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
               >
                 {loading === 'restore' ? <Loader2 size={16} className="animate-spin" /> : 'Restore Data'}
               </button>
            </div>

         </div>
      </section>

      <div className="border-t border-sage-200 my-8"></div>

      {/* --- GENERAL SETTINGS (Visual Only for now) --- */}
      <section>
         <h2 className="text-lg font-bold text-sage-700 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} /> General Preferences
         </h2>
         <div className="bg-white rounded-xl shadow-sm border border-sage-100 divide-y divide-sage-100">
            {/* Appearance */}
            <div className="p-6 flex items-center justify-between hover:bg-sage-50 transition-colors">
                <div className="flex items-center gap-4">
                <div className="p-2 bg-sage-100 rounded-lg text-sage-600"><Moon size={20}/></div>
                <div>
                    <h3 className="font-medium text-sage-800">Dark Mode</h3>
                    <p className="text-xs text-sage-400">Switch between light and dark themes</p>
                </div>
                </div>
                <div className="w-12 h-6 bg-sage-200 rounded-full p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>

            {/* Notifications */}
            <div className="p-6 flex items-center justify-between hover:bg-sage-50 transition-colors">
                <div className="flex items-center gap-4">
                <div className="p-2 bg-sage-100 rounded-lg text-sage-600"><Bell size={20}/></div>
                <div>
                    <h3 className="font-medium text-sage-800">Notifications</h3>
                    <p className="text-xs text-sage-400">Receive alerts for new travels</p>
                </div>
                </div>
                <div className="w-12 h-6 bg-sage-600 rounded-full p-1 cursor-pointer flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>

            {/* Account */}
            <div className="p-6 flex items-center justify-between hover:bg-sage-50 transition-colors">
                <div className="flex items-center gap-4">
                <div className="p-2 bg-sage-100 rounded-lg text-sage-600"><User size={20}/></div>
                <div>
                    <h3 className="font-medium text-sage-800">Account Settings</h3>
                    <p className="text-xs text-sage-400">Update profile details</p>
                </div>
                </div>
                <button className="text-sage-600 font-medium text-sm">Edit</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Settings;