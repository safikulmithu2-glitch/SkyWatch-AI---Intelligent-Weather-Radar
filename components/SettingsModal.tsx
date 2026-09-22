import React, { useState } from 'react';
import { X, Shield, FileText, Settings as SettingsIcon, Bell } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationPermission?: 'default' | 'granted' | 'denied';
  onRequestNotificationPermission?: () => void;
  pressureUnit: 'hPa' | 'inHg';
  setPressureUnit: (unit: 'hPa' | 'inHg') => void;
  distanceUnit: 'km' | 'mi';
  setDistanceUnit: (unit: 'km' | 'mi') => void;
}

type Tab = 'general' | 'security' | 'terms';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  notificationPermission, 
  onRequestNotificationPermission,
  pressureUnit,
  setPressureUnit,
  distanceUnit,
  setDistanceUnit
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl rounded-2xl flex overflow-hidden relative animate-in fade-in zoom-in duration-200 h-[600px] max-h-[90vh]">
        
        {/* Sidebar */}
        <div className="w-48 bg-slate-900/50 border-r border-slate-700/50 p-4 flex flex-col gap-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Settings</h2>
          
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <SettingsIcon className="w-4 h-4" />
            General
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Shield className="w-4 h-4" />
            Security Policy
          </button>
          
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'terms' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <FileText className="w-4 h-4" />
            Terms of Condition
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {activeTab === 'general' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Push Notifications</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Alert me when severe weather is detected in my area.</p>
                      </div>
                    </div>
                    <button 
                      onClick={onRequestNotificationPermission}
                      disabled={notificationPermission === 'granted' || notificationPermission === 'denied'}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        notificationPermission === 'granted' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : notificationPermission === 'denied'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked' : 'Enable'}
                    </button>
                  </div>
                  {notificationPermission === 'denied' && (
                    <p className="text-xs text-red-400 mt-3 border-t border-slate-700/50 pt-3">
                      Notifications are blocked. Please enable them in your browser settings.
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Unit Preferences</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Customize specific units for pressure and distance.</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                      <span className="text-sm text-slate-300 font-medium">Pressure</span>
                      <div className="flex bg-slate-900 rounded-lg p-1">
                        <button
                          onClick={() => setPressureUnit('hPa')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            pressureUnit === 'hPa' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          hPa
                        </button>
                        <button
                          onClick={() => setPressureUnit('inHg')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            pressureUnit === 'inHg' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          inHg
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                      <span className="text-sm text-slate-300 font-medium">Distance</span>
                      <div className="flex bg-slate-900 rounded-lg p-1">
                        <button
                          onClick={() => setDistanceUnit('km')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            distanceUnit === 'km' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          Kilometers
                        </button>
                        <button
                          onClick={() => setDistanceUnit('mi')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            distanceUnit === 'mi' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          Miles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-slate-300 space-y-4">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Security Policy
              </h3>
              <div className="space-y-4 text-sm leading-relaxed">
                <p><strong>1. Data Protection:</strong> We employ industry-standard encryption to protect your personal information during transit and at rest. Your passwords are securely hashed and never stored in plain text.</p>
                <p><strong>2. Firebase Authentication:</strong> We use Google Firebase for secure user authentication, supporting sign-in via email/password and Google OAuth.</p>
                <p><strong>3. Use of Location Data:</strong> Your location data is used exclusively to fetch weather information and is not persistently stored or shared with third-party advertisers.</p>
                <p><strong>4. Vulnerability Disclosure:</strong> If you believe you have found a security vulnerability in our system, please report it immediately.</p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-slate-300 space-y-4">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                Terms of Condition
              </h3>
              <div className="space-y-4 text-sm leading-relaxed">
                <p><strong>1. Acceptance of Terms:</strong> By accessing and using SkyWatch AI, you accept and agree to be bound by the terms and provision of this agreement.</p>
                <p><strong>2. API Usage:</strong> This application utilizes the Google Gemini API for weather insights. Automated scraping or abusive requests that drain our quota are strictly prohibited.</p>
                <p><strong>3. Accuracy of Information:</strong> While we strive for accuracy, weather predictions and AI insights are inherently probabilistic. We are not liable for any decisions made based on this weather data.</p>
                <p><strong>4. Changes to Terms:</strong> We reserve the right to modify these terms at any time. Your continued use of the application signifies your acceptance of any adjusted terms.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
