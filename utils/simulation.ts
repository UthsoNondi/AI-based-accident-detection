import { AccidentLog } from '../types';

export type FatigueLevel = 'Normal' | 'Drowsy' | 'High';

export interface SensorData {
  gForce: number;
  vibration: number;
  gps: { lat: string; lng: string };
  temperature: number;
  gasLevel: number;
  soundAmplitude: number;
  velocity: number;
  driverHealth: {
    heartRate: number;
    fatigueLevel: FatigueLevel;
  };
}

export const generateInitialSensorData = (): SensorData => ({
  gForce: 0.1,
  vibration: 15,
  gps: { lat: '37.7749', lng: '-122.4194' },
  temperature: 25,
  gasLevel: 300,
  soundAmplitude: 50,
  velocity: 0,
  driverHealth: {
    heartRate: 75,
    fatigueLevel: 'Normal',
  },
});

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const updateSensorData = (currentData: SensorData, isCrash = false): SensorData => {
  if (isCrash) {
    return {
      ...currentData,
      gForce: 8 + Math.random() * 7, // More intense G-force (8-15g)
      vibration: 250 + Math.random() * 50, // More intense vibration
      soundAmplitude: 130 + Math.random() * 10, // Loud crash noise
      velocity: 0, // Vehicle stops on crash
      driverHealth: {
        ...currentData.driverHealth,
        heartRate: clamp(currentData.driverHealth.heartRate + 50, 60, 180), // Sharp spike in heart rate
        fatigueLevel: 'High'
      }
    };
  }
  
  // Smoother velocity changes, slightly biased towards acceleration at low speeds
  const accelerationFactor = (130 - currentData.velocity) / 130; // Stronger acceleration when slower
  const newVelocity = clamp(currentData.velocity + (Math.random() - 0.4) * 4 * accelerationFactor, 0, 130);
  
  let newFatigueLevel = currentData.driverHealth.fatigueLevel;
  if(newFatigueLevel === 'Normal' && Math.random() < 0.005) {
      newFatigueLevel = 'Drowsy';
  } else if (newFatigueLevel === 'Drowsy' && Math.random() < 0.01) {
      newFatigueLevel = 'Normal'; // Can recover
  }


  return {
    gForce: clamp(0.1 + (newVelocity / 100) + (Math.random() - 0.5) * 0.2, 0.05, 1.5),
    // Vibration now linked to velocity
    vibration: clamp(10 + newVelocity / 5 + (Math.random() - 0.5) * 5, 10, 60),
    gps: {
      lat: (parseFloat(currentData.gps.lat) + (Math.random() - 0.5) * 0.0001 * (newVelocity/100)).toFixed(4),
      lng: (parseFloat(currentData.gps.lng) + (Math.random() - 0.5) * 0.0001 * (newVelocity/100)).toFixed(4),
    },
    temperature: clamp(currentData.temperature + (Math.random() - 0.5) * 0.5, 20, 40),
    gasLevel: clamp(currentData.gasLevel + (Math.random() - 0.5) * 10, 280, 400),
    // Sound linked to velocity
    soundAmplitude: clamp(40 + newVelocity / 2 + (Math.random() - 0.5) * 10, 40, 110),
    velocity: newVelocity,
    driverHealth: {
        heartRate: clamp(currentData.driverHealth.heartRate + (Math.random() - 0.5) * 2, 60, 110),
        fatigueLevel: newFatigueLevel,
    }
  };
};

export const calculateRisk = (data: SensorData): { level: string; value: number } => {
  let riskValue = 0;
  
  // G-force contribution (major factor)
  if (data.gForce > 1.2) riskValue += 40;
  if (data.gForce > 3) riskValue += 50;

  // Vibration contribution
  if (data.vibration > 40) riskValue += 15;
  if (data.vibration > 80) riskValue += 25;

  // Gas level (e.g., CO)
  if (data.gasLevel > 380) riskValue += 10;
  
  // Driver fatigue
  if (data.driverHealth.fatigueLevel === 'Drowsy') riskValue += 20;
  if (data.driverHealth.fatigueLevel === 'High') riskValue += 40;

  riskValue = clamp(riskValue, 0, 100);

  let level = 'Low';
  if (riskValue > 75) level = 'High';
  else if (riskValue > 40) level = 'Medium';
  
  return { level, value: Math.round(riskValue) };
};

const SOUNDS = ['Engine Idle', 'Road Noise', 'Horn Honk', 'Siren Nearby', 'Music Playing'];
export const getRandomSound = () => SOUNDS[Math.floor(Math.random() * SOUNDS.length)];


// Simple hash function for simulation (in a real app, use a proper crypto library)
const simpleHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
};


export const createBlockchainEntry = (previousHash: string, sensorData: SensorData): AccidentLog => {
    const timestamp = new Date().toISOString();
    const velocityAtImpact = sensorData.velocity;
    const dataToHash = JSON.stringify({
        timestamp,
        previousHash,
        sensorData,
        velocityAtImpact,
    });
    const hash = simpleHash(dataToHash);

    return { timestamp, hash, previousHash, data: sensorData, velocityAtImpact };
};
