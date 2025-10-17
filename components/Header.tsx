import React from 'react';
import { BrainIcon, CarIcon, DocumentTextIcon, CogIcon } from './Icons';

interface HeaderProps {
    onShowPrompt: () => void;
    onShowSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowPrompt, onShowSettings }) => {
  return (
    <header className="text-center relative">
      <div className="flex justify-center items-center gap-4">
        <BrainIcon className="w-10 h-10 text-cyan-400" />
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          AI Accident Detection System
        </h1>
        <CarIcon className="w-10 h-10 text-teal-300" />
      </div>
      <p className="mt-3 text-lg text-gray-400">
        Live Monitoring & Simulation Dashboard
      </p>
      <div className="absolute top-0 right-0 flex items-center gap-2">
         <button 
            onClick={onShowSettings}
            className="flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 rounded-lg text-sm transition-colors"
            title="Hardware Settings"
          >
            <CogIcon className="w-5 h-5"/>
          </button>
          <button 
            onClick={onShowPrompt}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 rounded-lg text-sm transition-colors"
            title="View Original Project Prompt"
          >
            <DocumentTextIcon className="w-5 h-5"/>
            <span className="hidden md:inline">View Prompt</span>
          </button>
      </div>
    </header>
  );
};
