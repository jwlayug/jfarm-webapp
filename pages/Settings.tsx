
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Moon, Bell, User, Database, Download, Trash2, Upload, Loader2, AlertTriangle, CheckCircle, Cloud, Sprout } from 'lucide-react';
import { collection, getDocs, writeBatch, doc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFarmData } from '../context/FarmContext';
import { format } from 'date-fns';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const COLLECTIONS = [
  'employees', 
  'groups', 
  'travels', 
  'lands', 
  'plates', 
  'destinations', 
  'drivers', 
  'debts',
  'expenses',
  'loans'
];

const Settings: React.FC = () => {
  const { 
    activeFarmId, farms, removeFarm, isLoading: isDataLoading,
    employees, groups, travels, lands, plates, destinations, 
    drivers, debts, expenses, loans
  } = useFarmData();
  
  // State
  const [loading, setLoading] = useState<'backup' | 'deleteRoot' | 'restore' | 'backup2drive' | 'deleteFarm' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [driveFolderName, setDriveFolderName] = useState("JFARM Backups");
  
  // File Input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modals
  const [isDeleteFarmModalOpen, setIsDeleteFarmModalOpen] = useState(false);
  const [isDeleteRootModalOpen, setIsDeleteRootModalOpen] = useState(false);

  const activeFarmName = farms.find(f => f.id === activeFarmId)?.name || 'ROOT';

  // Helper: Get collection ref based on current context (Farm or Root)
  // Used for Delete All (Reset) to ensure we target the DB directly
  const getContextCollection = (colName: string) => {
    if (activeFarmId) {
      return collection(db, 'farms', activeFarmId, colName);
    }
    return collection(db, colName);
  };

  // Helper: Generate Backup Filename
  const generateBackupFilename = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const sanitizedName = activeFarmName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    return `${sanitizedName}_jfarm_backup_${dateStr}.json`;
  };

  // Helper: Construct Backup Data Object from Context
  const getBackupDataFromContext = () => {
    return {
      employees,
      groups,
      travels,
      lands,
      plates,
      destinations,
      drivers,
      debts,
      expenses,
      loans
    };
  };

  // ------------------------------------------------------------------
  // 🔹 GOOGLE DRIVE LOGIC
  // ------------------------------------------------------------------

  const getGoogleAccessToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Use (import.meta as any) to bypass TypeScript error if types are missing
      const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
      const currentPath = window.location.pathname.endsWith('/')
        ? window.location.pathname.slice(0, -1)
        : window.location.pathname;
      const REDIRECT_URI = window.location.origin + currentPath;
      const SCOPE = 'https://www.googleapis.com/auth/drive.file';

      if (!CLIENT_ID) {
        reject(new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID.'));
        return;
      }

      const storedToken = localStorage.getItem('google_drive_token');
      const tokenExpiry = localStorage.getItem('google_drive_token_expiry');

      if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        resolve(storedToken);
        return;
      }

      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('google_oauth_state', state);
      sessionStorage.setItem('google_oauth_pending', 'true');
      sessionStorage.setItem('google_oauth_redirect_uri', REDIRECT_URI);

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'token',
        scope: SCOPE,
        state: state,
        include_granted_scopes: 'true'
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      reject(new Error('Redirecting to Google OAuth...'));
    });
  };

  // Handle OAuth Callback
  useEffect(() => {
    const handleOAuthCallback = () => {
      const hash = window.location.hash.substring(1);
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const error = params.get('error');
      const returnedState = params.get('state');
      const storedState = sessionStorage.getItem('google_oauth_state');
      const isPending = sessionStorage.getItem('google_oauth_pending');

      if (!isPending) return;

      // Clear URL hash
      window.history.replaceState(null, '', window.location.pathname);

      if (error) {
        console.error('OAuth Error:', error);
        setStatusMsg({ type: 'error', text: `Google Auth Error: ${error}` });
        return;
      }

      if (returnedState !== storedState) return;

      if (accessToken) {
        const expiresIn = parseInt(params.get('expires_in') || '3600');
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('google_drive_token', accessToken);
        localStorage.setItem('google_drive_token_expiry', expiryTime.toString());
        
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_pending');
        sessionStorage.removeItem('google_oauth_redirect_uri');
        
        // Flag for auto-resume
        sessionStorage.setItem('google_oauth_just_completed', 'true');
      }
    };
    handleOAuthCallback();
  }, []);

  const findOrCreateFolder = async (folderName: string, accessToken: string, parentFolderId?: string): Promise<string> => {
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
      }
    }

    const folderMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) folderMetadata.parents = [parentFolderId];

    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(folderMetadata),
    });

    if (!createResponse.ok) throw new Error('Failed to create folder');
    const folderResult = await createResponse.json();
    return folderResult.id;
  };

  const checkFileExists = async (fileName: string, accessToken: string, parentFolderId?: string): Promise<string | null> => {
    let query = `name='${fileName}' and mimeType='application/json' and trashed=false`;
    if (parentFolderId) query += ` and '${parentFolderId}' in parents`;
    else query += ` and 'root' in parents`;

    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.files && searchResult.files.length > 0) return searchResult.files[0].id;
    }
    return null;
  };

  const uploadToGoogleDrive = useCallback(async (file: Blob, fileName: string, accessToken: string, folderName?: string, overwrite: boolean = false): Promise<void> => {
    let parentFolderId: string | undefined;

    if (folderName) {
      setLoadingMessage(`Locating folder '${folderName}'...`);
      parentFolderId = await findOrCreateFolder(folderName, accessToken);
    }

    const existingFileId = await checkFileExists(fileName, accessToken, parentFolderId);

    if (existingFileId && overwrite) {
      setLoadingMessage(`Updating '${fileName}'...`);
      const form = new FormData();
      form.append('file', file);
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: form,
      });
    } else {
      setLoadingMessage(`Uploading '${fileName}'...`);
      const metadata: any = { name: fileName, mimeType: 'application/json' };
      if (parentFolderId) metadata.parents = [parentFolderId];

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: form,
      });
    }
  }, []);

  const handleBackupToGoogleDrive = async () => {
    setLoading('backup2drive');
    setLoadingMessage("Preparing backup...");
    setStatusMsg(null);
    
    try {
      // Use Context Data instead of Querying Firestore to ensure "What you see is what you get"
      const backupData = getBackupDataFromContext();
      
      // Validate Data
      const totalRecords = Object.values(backupData).reduce((acc, arr) => acc + arr.length, 0);
      if (totalRecords === 0) {
         // We allow upload, but maybe log a warning
         console.warn("Backing up empty dataset.");
      }

      const fileName = generateBackupFilename();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });

      sessionStorage.setItem('pending_backup_data', JSON.stringify(backupData));
      sessionStorage.setItem('pending_backup_filename', fileName);
      if (driveFolderName) sessionStorage.setItem('pending_backup_folder', driveFolderName);

      setLoadingMessage("Authenticating...");
      
      const storedToken = localStorage.getItem('google_drive_token');
      const tokenExpiry = localStorage.getItem('google_drive_token_expiry');
      let accessToken: string;

      if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        accessToken = storedToken;
      } else {
        await getGoogleAccessToken();
        return; // Redirecting
      }

      await uploadToGoogleDrive(blob, fileName, accessToken, driveFolderName || undefined);
      setStatusMsg({ type: 'success', text: `Backup "${fileName}" uploaded to Drive successfully!` });

    } catch (err: any) {
      if (err.message !== 'Redirecting to Google OAuth...') {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to backup to Drive.' });
      }
    } finally {
      setLoading(null);
      setLoadingMessage("");
    }
  };

  // Auto-resume upload after OAuth redirect
  useEffect(() => {
    const uploadPendingBackup = async () => {
      const oauthJustCompleted = !sessionStorage.getItem('google_oauth_pending') &&
        sessionStorage.getItem('google_oauth_just_completed') === 'true';

      if (!oauthJustCompleted) {
        sessionStorage.removeItem('pending_backup_data');
        return;
      }

      const pendingData = sessionStorage.getItem('pending_backup_data');
      const pendingFilename = sessionStorage.getItem('pending_backup_filename');
      const accessToken = localStorage.getItem('google_drive_token');

      if (pendingData && pendingFilename && accessToken) {
        try {
          setLoading('backup2drive');
          setLoadingMessage("Resuming upload...");
          const backupData = JSON.parse(pendingData);
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
          const pendingFolderName = sessionStorage.getItem('pending_backup_folder');
          
          await uploadToGoogleDrive(blob, pendingFilename, accessToken, pendingFolderName || undefined);
          setStatusMsg({ type: 'success', text: `Backup "${pendingFilename}" uploaded successfully after auth!` });
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: 'Failed to resume upload.' });
        } finally {
          setLoading(null);
          setLoadingMessage("");
          sessionStorage.removeItem('pending_backup_data');
          sessionStorage.removeItem('google_oauth_just_completed');
        }
      }
    };
    uploadPendingBackup();
  }, [uploadToGoogleDrive]);

  // ------------------------------------------------------------------
  // 🔹 LOCAL BACKUP / RESTORE / DELETE
  // ------------------------------------------------------------------

  const handleLocalBackup = async () => {
    setLoading('backup');
    setStatusMsg(null);
    try {
      // Use Context Data directly
      const backupData = getBackupDataFromContext();
      
      // Validate empty backup
      const totalRecords = Object.values(backupData).reduce((acc, arr) => acc + arr.length, 0);
      if (totalRecords === 0) {
         setStatusMsg({ type: 'error', text: 'Warning: The generated backup is empty because there is no data in the current farm.' });
      } else {
         setStatusMsg({ type: 'success', text: `Backup downloaded with ${totalRecords} records.` });
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateBackupFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Failed to generate local backup.' });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    setLoading('deleteRoot');
    setStatusMsg(null);
    try {
      for (const colName of COLLECTIONS) {
        // Use Firestore directly for deletion to ensure thoroughness
        const q = query(getContextCollection(colName));
        const snapshot = await getDocs(q);
        const chunks = [];
        let currentChunk: any[] = [];
        snapshot.docs.forEach(doc => {
          currentChunk.push(doc);
          if (currentChunk.length === 450) {
            chunks.push([...currentChunk]);
            currentChunk = [];
          }
        });
        if (currentChunk.length > 0) chunks.push(currentChunk);

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach(docSnap => {
             batch.delete(docSnap.ref);
          });
          await batch.commit();
        }
      }
      setStatusMsg({ type: 'success', text: `All data for ${activeFarmName} has been reset.` });
      setIsDeleteRootModalOpen(false);
    } catch (error: any) {
      setStatusMsg({ type: 'error', text: `Failed to delete data: ${error.message}` });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteActiveFarm = async () => {
      if (!activeFarmId) return;
      setLoading('deleteFarm');
      try {
          await removeFarm(activeFarmId);
          setIsDeleteFarmModalOpen(false);
          setStatusMsg({ type: 'success', text: 'Farm deleted successfully.' });
      } catch (error) {
          setStatusMsg({ type: 'error', text: 'Failed to delete farm.' });
      } finally {
          setLoading(null);
      }
  };

  const handleRestore = async (file: File) => {
    if (!window.confirm(`This will restore data into "${activeFarmName}". Continue?`)) return;
    setLoading('restore');
    setStatusMsg(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Verify data exists
        let hasData = false;
        for (const key in json) {
            if (Array.isArray(json[key]) && json[key].length > 0) {
                hasData = true;
                break;
            }
        }

        if (!hasData) {
            throw new Error("The backup file contains no data records.");
        }

        for (const [colName, items] of Object.entries(json)) {
           if (!Array.isArray(items)) continue;
           const chunks = [];
           let currentChunk = [];
           for (const item of items) {
              currentChunk.push(item);
              if (currentChunk.length === 450) { chunks.push([...currentChunk]); currentChunk = []; }
           }
           if (currentChunk.length > 0) chunks.push(currentChunk);

           for (const chunk of chunks) {
             const batch = writeBatch(db);
             chunk.forEach((item: any) => {
                if (item.id) {
                   const { id, ...data } = item;
                   // Restore to Active Farm if set, otherwise Root
                   if (activeFarmId) batch.set(doc(db, 'farms', activeFarmId, colName, id), data);
                   else batch.set(doc(db, colName, id), data);
                }
             });
             await batch.commit();
           }
        }
        setStatusMsg({ type: 'success', text: `Data restored successfully to ${activeFarmName}.` });
      } catch (error: any) {
        setStatusMsg({ type: 'error', text: error.message || 'Invalid file or restore failed.' });
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
         <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-sage-700 flex items-center gap-2">
                <Database size={20} /> Database Management
            </h2>
            <span className="text-xs bg-sage-100 text-sage-600 px-2 py-1 rounded-full font-medium border border-sage-200">
                Scope: {activeFarmName}
            </span>
         </div>
         
         {statusMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 font-medium
              ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}
            `}>
              {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {statusMsg.text}
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Backup to Drive Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Cloud size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Backup to Drive</h3>
               <p className="text-xs text-sage-500 mb-4 flex-1">Upload {activeFarmName} backup to Google Drive.</p>
               
               <input
                type="text"
                placeholder="Folder (e.g. JFARM)"
                value={driveFolderName}
                onChange={(e) => setDriveFolderName(e.target.value)}
                className="mb-3 w-full text-center text-xs px-2 py-1 border border-sage-200 rounded focus:border-blue-400 outline-none"
                disabled={!!loading}
              />

               <button 
                 onClick={handleBackupToGoogleDrive}
                 disabled={!!loading || isDataLoading}
                 className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {loading === 'backup2drive' ? <Loader2 size={16} className="animate-spin" /> : 'Start Upload'}
               </button>
               {loading === 'backup2drive' && <p className="text-[10px] text-blue-500 mt-2 animate-pulse">{loadingMessage}</p>}
            </div>

            {/* Local Backup Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
               <div className="p-4 bg-sage-100 text-sage-600 rounded-full mb-4">
                  <Download size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Local Backup</h3>
               <p className="text-xs text-sage-500 mb-6 flex-1">Download .json file for {activeFarmName}.</p>
               <button 
                 onClick={handleLocalBackup}
                 disabled={!!loading || isDataLoading}
                 className="w-full py-2 px-4 bg-sage-600 hover:bg-sage-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {loading === 'backup' ? <Loader2 size={16} className="animate-spin" /> : 'Download'}
               </button>
            </div>

            {/* Restore Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
               <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-4">
                  <Upload size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Restore</h3>
               <p className="text-xs text-sage-500 mb-6 flex-1">Import data into {activeFarmName}.</p>
               
               <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleRestore(e.target.files[0])}
                  accept=".json"
                  className="hidden"
               />
               
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={!!loading}
                 className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {loading === 'restore' ? <Loader2 size={16} className="animate-spin" /> : 'Import Data'}
               </button>
            </div>

            {/* Reset Database Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
               <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                  <Trash2 size={32} />
               </div>
               <h3 className="font-bold text-sage-800 mb-2">Reset Database</h3>
               <p className="text-xs text-sage-500 mb-6 flex-1">Clear all data in {activeFarmName}.</p>
               <button 
                 onClick={() => setIsDeleteRootModalOpen(true)}
                 disabled={!!loading}
                 className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {loading === 'deleteRoot' ? <Loader2 size={16} className="animate-spin" /> : 'Clear Data'}
               </button>
            </div>

         </div>
      </section>

      {/* --- ACTIVE FARM MANAGEMENT --- */}
      {activeFarmId && (
          <section className="animate-in fade-in slide-in-from-bottom-4">
             <h2 className="text-lg font-bold text-sage-700 mb-4 flex items-center gap-2">
                <Sprout size={20} /> Current Farm Settings
             </h2>
             <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div>
                     <h3 className="font-bold text-red-800 text-lg">Delete "{activeFarmName}"</h3>
                     <p className="text-sm text-red-600 mt-1">Permanently remove this farm and all its sub-data (employees, travels, debts, etc.).</p>
                 </div>
                 <button 
                    onClick={() => setIsDeleteFarmModalOpen(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                 >
                    <Trash2 size={18} /> Delete Farm
                 </button>
             </div>
          </section>
      )}

      <div className="border-t border-sage-200 my-8"></div>

      {/* --- GENERAL SETTINGS --- */}
      <section>
         <h2 className="text-lg font-bold text-sage-700 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} /> General Preferences
         </h2>
         <div className="bg-white rounded-xl shadow-sm border border-sage-100 divide-y divide-sage-100">
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
            <div className="p-6 flex items-center justify-between hover:bg-sage-50 transition-colors">
                <div className="flex items-center gap-4">
                <div className="p-2 bg-sage-100 rounded-lg text-sage-600"><Bell size={20}/></div>
                <div>
                    <h3 className="font-medium text-sage-800">Notifications</h3>
                    <p className="text-xs text-sage-400">Alerts for new travels</p>
                </div>
                </div>
                <div className="w-12 h-6 bg-sage-600 rounded-full p-1 cursor-pointer flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>
         </div>
      </section>

      {/* Modal for Farm Deletion */}
      <DeleteConfirmationModal 
        isOpen={isDeleteFarmModalOpen}
        onClose={() => setIsDeleteFarmModalOpen(false)}
        onConfirm={handleDeleteActiveFarm}
        title="Delete Active Farm"
        message={`Are you sure you want to delete "${activeFarmName}"? ALL data will be lost permanently.`}
        isLoading={loading === 'deleteFarm'}
      />

      {/* Modal for Data Clearing */}
      <DeleteConfirmationModal 
        isOpen={isDeleteRootModalOpen}
        onClose={() => setIsDeleteRootModalOpen(false)}
        onConfirm={handleDeleteAll}
        title={`Clear Data for ${activeFarmName}`}
        message={`DANGER: This will permanently delete ALL records (employees, travels, etc.) within "${activeFarmName}". The farm itself will remain. This action cannot be undone.`}
        isLoading={loading === 'deleteRoot'}
      />
    </div>
  );
};

export default Settings;
