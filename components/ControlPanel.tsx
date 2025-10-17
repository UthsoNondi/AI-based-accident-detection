import React from 'react';
import { PlayIcon, PauseIcon, RefreshIcon } from './Icons';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleConnection: () => void;
  onReset: () => void;
  mode: 'simulation' | 'live';
  setMode: (mode: 'simulation' | 'live') => void;
  connectionStatus: string;
}

const ModeToggle: React.FC<{ mode: 'simulation' | 'live', setMode: (mode: 'simulation' | 'live') => void, isRunning: boolean }> = ({ mode, setMode, isRunning }) => {
    return (
        <div className="flex items-center p-1 bg-gray-700 rounded-full">
            <button 
                onClick={() => !isRunning && setMode('simulation')}
                disabled={isRunning}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'simulation' ? 'bg-cyan-500 text-white' : 'text-gray-300'} ${isRunning ? 'cursor-not-allowed' : 'hover:bg-gray-600'}`}
            >
                Simulation
            </button>
            <button 
                onClick={() => !isRunning && setMode('live')}
                disabled={isRunning}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'live' ? 'bg-cyan-500 text-white' : 'text-gray-300'} ${isRunning ? 'cursor-not-allowed' : 'hover:bg-gray-600'}`}
            >
                Live Data
            </button>
        </div>
    );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ isRunning, onToggleConnection, onReset, mode, setMode, connectionStatus }) => {
  const getButtonText = () => {
    if (mode === 'live') {
        if (connectionStatus === 'connecting') return 'Connecting...';
        return isRunning ? 'Disconnect' : 'Connect';
    }
    return isRunning ? 'Pause Simulation' : 'Start Simulation';
  };
    
  return (
    <div className="flex flex-col justify-center items-center gap-4 my-8">
      <ModeToggle mode={mode} setMode={setMode} isRunning={isRunning} />
      <div className="flex items-center gap-4">
        <button
            onClick={onToggleConnection}
            disabled={mode === 'live' && connectionStatus === 'connecting'}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-white text-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 shadow-lg disabled:opacity-50 disabled:cursor-wait ${
            isRunning
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 focus:ring-orange-500/50'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 focus:ring-emerald-500/50'
            }`}
        >
            {isRunning ? (
            <PauseIcon className="w-6 h-6" />
            ) : (
            <PlayIcon className="w-6 h-6" />
            )}
            <span>{getButtonText()}</span>
        </button>
        <button 
            onClick={onReset}
            className="flex items-center gap-2 p-3 rounded-full font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500/50"
            title="Reset"
            >
            <RefreshIcon className="w-6 h-6"/>
        </button>
      </div>
      {mode === 'live' && connectionStatus !== 'idle' && <p className="text-sm text-gray-400 capitalize">Status: {connectionStatus}</p>}
    </div>
  );
};
