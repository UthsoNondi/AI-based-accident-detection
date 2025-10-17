import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './Icons';

export interface AppSettings {
    cameraUrl: string;
    sensorUrl: string;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
    currentSettings: AppSettings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
    const [settings, setSettings] = useState<AppSettings>(currentSettings);

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-800/80 border border-gray-700 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-lg flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                        Hardware Settings
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="cameraUrl" className="block text-sm font-medium text-gray-300 mb-2">
                            ESP32-CAM Stream URL
                        </label>
                        <input 
                            type="text"
                            id="cameraUrl"
                            value={settings.cameraUrl}
                            onChange={(e) => setSettings(s => ({...s, cameraUrl: e.target.value}))}
                            placeholder="e.g., http://192.168.1.10"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="sensorUrl" className="block text-sm font-medium text-gray-300 mb-2">
                            Arduino Sensor WebSocket URL
                        </label>
                        <input 
                            type="text"
                            id="sensorUrl"
                            value={settings.sensorUrl}
                            onChange={(e) => setSettings(s => ({...s, sensorUrl: e.target.value}))}
                            placeholder="e.g., ws://192.168.1.11/ws"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
