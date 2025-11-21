import React from 'react';
import { Settings as SettingsIcon, Moon, Bell, Lock, User } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
         <h1 className="text-2xl font-bold text-sage-800">Settings</h1>
         <p className="text-sage-500 text-sm">Manage your application preferences.</p>
      </div>

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
    </div>
  );
};

export default Settings;