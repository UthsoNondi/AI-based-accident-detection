import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ControlPanel } from './components/ControlPanel';
import { PromptModal } from './components/PromptModal';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { PROMPT_TEXT } from './constants';
import {
  SensorData,
  generateInitialSensorData,
  updateSensorData,
  calculateRisk,
  getRandomSound,
  createBlockchainEntry,
} from './utils/simulation';
import { useHardwareConnector } from './hooks/useHardwareConnector';
import { AccidentLog } from './types';

const DATA_HISTORY_LENGTH = 30; // Keep last 30 data points for charts

const App: React.FC = () => {
  const [mode, setMode] = useState<'simulation' | 'live'>('simulation');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({ cameraUrl: '', sensorUrl: '' });
  
  const [sensorData, setSensorData] = useState<SensorData>(generateInitialSensorData());
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [accidentRisk, setAccidentRisk] = useState({ level: 'Low', value: 10 });
  const [currentSound, setCurrentSound] = useState('Engine Idle');
  const [accidentLog, setAccidentLog] = useState<AccidentLog[]>([]);
  const [rescueStatus, setRescueStatus] = useState<'idle' | 'calculating' | 'complete'>('idle');
  
  const { connect, disconnect, isConnected, latestData, connectionStatus } = useHardwareConnector(settings.sensorUrl);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationInterval = useRef<number | null>(null);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };
  
  const triggerAccident = useCallback(() => {
    console.log("Accident triggered!");
    // In live mode, the sensor data is already at crash levels
    // In simulation mode, we force it
    if (mode === 'simulation') {
        const crashData = updateSensorData(sensorData, true);
        setSensorData(crashData);
        setDataHistory(prev => [...prev.slice(-DATA_HISTORY_LENGTH + 1), crashData]);
    }
    setAccidentRisk({ level: 'CRITICAL', value: 100 });
    setCurrentSound('**CRASH DETECTED**');
    setRescueStatus('calculating');

    setTimeout(() => {
        const currentData = mode === 'live' && latestData ? latestData : sensorData;
        const newEntry = createBlockchainEntry(
          accidentLog.length > 0 ? accidentLog[accidentLog.length - 1].hash : '0',
          currentData
        );
        setAccidentLog(prev => [newEntry, ...prev]);
        setRescueStatus('complete');
    }, 3000);
  }, [accidentLog, sensorData, mode, latestData]);
  
  const updateStateWithNewData = (newData: SensorData) => {
    setSensorData(newData);
    setDataHistory(prev => [...prev.slice(-DATA_HISTORY_LENGTH + 1), newData]);
    const risk = calculateRisk(newData);
    setAccidentRisk(risk);
    
    // Check for accident trigger in live mode
    if (mode === 'live' && risk.level === 'High' && rescueStatus === 'idle') {
        triggerAccident();
    }
  }

  // Effect for handling live data
  useEffect(() => {
    if (mode === 'live' && latestData) {
      updateStateWithNewData(latestData);
    }
  }, [mode, latestData]);


  const runSimulationStep = useCallback(() => {
    if (rescueStatus !== 'idle') {
        if(rescueStatus === 'complete' && accidentRisk.level === 'CRITICAL'){
             setTimeout(() => {
                setRescueStatus('idle');
                const initialData = generateInitialSensorData();
                setSensorData(initialData);
                setDataHistory([]);
            }, 5000);
        }
        return;
    }
    
    // 1 in 100 chance of triggering an accident in simulation
    if (Math.random() < 0.01) {
      triggerAccident();
    } else {
      const newSensorData = updateSensorData(sensorData);
      updateStateWithNewData(newSensorData);

      if (Math.random() < 0.1) {
          setCurrentSound(getRandomSound());
      }
    }
  }, [sensorData, triggerAccident, rescueStatus, accidentRisk, mode]);

  useEffect(() => {
    if (mode === 'simulation' && isSimulating) {
      simulationInterval.current = window.setInterval(runSimulationStep, 1000);
    } else {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    }
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [isSimulating, runSimulationStep, mode]);

  const handleToggleConnection = () => {
    if (mode === 'simulation') {
        setIsSimulating(prev => !prev);
    } else {
        if(isConnected) {
            disconnect();
        } else {
            connect();
        }
    }
  };
  
  const handleReset = () => {
    setIsSimulating(false);
    if(isConnected) disconnect();
    setSensorData(generateInitialSensorData());
    setDataHistory([]);
    setAccidentRisk({ level: 'Low', value: 10 });
    setCurrentSound('Engine Idle');
    setAccidentLog([]);
    setRescueStatus('idle');
  }

  const isRunning = mode === 'simulation' ? isSimulating : isConnected;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans antialiased">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Header onShowPrompt={() => setIsModalOpen(true)} onShowSettings={() => setIsSettingsOpen(true)} />
        <ControlPanel
          isRunning={isRunning}
          onToggleConnection={handleToggleConnection}
          onReset={handleReset}
          mode={mode}
          setMode={setMode}
          connectionStatus={connectionStatus}
        />
        <Dashboard
          sensorData={sensorData}
          dataHistory={dataHistory}
          accidentRisk={accidentRisk}
          currentSound={currentSound}
          accidentLog={accidentLog}
          rescueStatus={rescueStatus}
          cameraUrl={settings.cameraUrl}
          mode={mode}
        />
      </main>
      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promptText={PROMPT_TEXT}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
       />
    </div>
  );
};

export default App;