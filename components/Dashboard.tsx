import React, { useState, useEffect, useRef } from 'react';
import { SensorData } from '../utils/simulation';
import {
  SensorIcon,
  GaugeIcon,
  SoundIcon,
  MapPinIcon,
  CubeIcon,
  RouteIcon,
  HeartIcon,
  ChartBarIcon
} from './Icons';
import { AccidentLog } from '../types';

// Declare Chart and L (Leaflet) from the global scope for TypeScript
declare const Chart: any;
declare const L: any;

interface DashboardProps {
  sensorData: SensorData;
  dataHistory: SensorData[];
  accidentRisk: { level: string; value: number };
  currentSound: string;
  accidentLog: AccidentLog[];
  rescueStatus: 'idle' | 'calculating' | 'complete';
  cameraUrl: string;
  mode: 'simulation' | 'live';
}

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
  <div className={`bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg flex flex-col ${className}`}>
    <div className="flex items-center gap-3 p-4 border-b border-gray-700">
      {icon}
      <h3 className="font-bold text-lg text-gray-200">{title}</h3>
    </div>
    <div className="p-4 flex-grow">{children}</div>
  </div>
);

const RiskGauge: React.FC<{ value: number, level: string }> = ({ value, level }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;
    
    let colorClass = "stroke-cyan-400";
    if (level === 'Medium') colorClass = "stroke-yellow-400";
    if (level === 'High') colorClass = "stroke-orange-500";
    if (level === 'CRITICAL') colorClass = "stroke-red-600";
  
    return (
      <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="gauge-bg" cx="50" cy="50" r="45" />
          <circle 
            className={`gauge-fg ${colorClass}`}
            cx="50" cy="50" r="45"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute text-center">
            <div className={`text-4xl font-bold ${colorClass.replace('stroke-', 'text-')}`}>{value}</div>
            <div className="text-sm text-gray-400">{level}</div>
        </div>
      </div>
    );
};

const SensorBar: React.FC<{ label: string, value: number; max: number; thresholds: { warn: number; danger: number }; unit: string }> = ({ label, value, max, thresholds, unit }) => {
    const percentage = Math.min((value / max) * 100, 100);
    let barColor = 'bg-cyan-500';
    if (value > thresholds.danger) {
        barColor = 'bg-red-500 animate-pulse';
    } else if (value > thresholds.warn) {
        barColor = 'bg-yellow-400';
    }

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-gray-400 text-sm font-medium">{label}</span>
                <span className="font-mono font-bold text-lg text-gray-100">{value.toFixed(1)} <span className="text-xs text-gray-400 font-sans">{unit}</span></span>
            </div>
            <div className="w-full bg-gray-900/50 rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentage}%`, transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out' }}></div>
            </div>
        </div>
    );
};


const CameraFeed: React.FC<{ cameraUrl: string }> = ({ cameraUrl }) => {
    const [imgError, setImgError] = useState(false);

    if (!cameraUrl) {
        return <div className="text-gray-500 flex items-center justify-center h-full">Camera URL not set.</div>;
    }

    return (
        <div className="w-full h-full bg-black rounded-lg overflow-hidden">
            {imgError ? (
                <div className="w-full h-full flex items-center justify-center text-red-500">
                    Error loading video stream.
                </div>
            ) : (
                <img 
                    src={cameraUrl}
                    alt="Live Camera Feed"
                    className="object-cover w-full h-full"
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    );
};

const MapView: React.FC<{ gps: { lat: string; lng: string } }> = ({ gps }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const { lat, lng } = gps;
            const map = L.map(mapContainerRef.current).setView([parseFloat(lat), parseFloat(lng)], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            mapInstanceRef.current = map;

            const carIcon = L.divIcon({
                html: '️🚗',
                className: 'text-2xl',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { icon: carIcon }).addTo(map);
        }
    }, []); // Run only once

    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            const { lat, lng } = gps;
            const newLatLng = L.latLng(parseFloat(lat), parseFloat(lng));
            markerRef.current.setLatLng(newLatLng);
            mapInstanceRef.current.panTo(newLatLng);
        }
    }, [gps]);

    return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
};


const RealtimeChart: React.FC<{ data: SensorData[] }> = ({ data }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (!chartInstanceRef.current) {
            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Velocity (km/h)',
                            data: [],
                            borderColor: 'rgb(56, 189, 248)',
                            backgroundColor: 'rgba(56, 189, 248, 0.5)',
                            yAxisID: 'y',
                            tension: 0.3
                        },
                        {
                            label: 'Sound (dB)',
                            data: [],
                            borderColor: 'rgb(34, 211, 238)',
                            backgroundColor: 'rgba(34, 211, 238, 0.5)',
                            yAxisID: 'y1',
                            tension: 0.3
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 200 },
                    scales: {
                        x: { display: false },
                        y: { type: 'linear', position: 'left', min: 0, max: 200, ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } },
                        y1: { type: 'linear', position: 'right', min: 0, max: 150, ticks: { color: '#9ca3af' }, grid: { drawOnChartArea: false } },
                    },
                    plugins: { legend: { labels: { color: '#d1d5db' } } }
                }
            });
        }

        // Update chart data
        const chart = chartInstanceRef.current;
        chart.data.labels = data.map((_, i) => i);
        chart.data.datasets[0].data = data.map(d => d.velocity);
        chart.data.datasets[1].data = data.map(d => d.soundAmplitude);
        chart.update();

    }, [data]);

    return <canvas ref={chartRef}></canvas>;
};


export const Dashboard: React.FC<DashboardProps> = ({ sensorData, dataHistory, accidentRisk, currentSound, accidentLog, rescueStatus, cameraUrl, mode }) => {
  const { driverHealth } = sensorData;
  let fatigueColor = 'text-green-400';
  if (driverHealth.fatigueLevel === 'Drowsy') fatigueColor = 'text-yellow-400';
  if (driverHealth.fatigueLevel === 'High') fatigueColor = 'text-red-500 animate-pulse';

  const sensorConfigs = {
    velocity: { label: 'Velocity', unit: 'km/h', max: 150, thresholds: { warn: 110, danger: 130 } },
    gForce: { label: 'G-Force', unit: 'g', max: 2, thresholds: { warn: 1.0, danger: 1.2 } },
    vibration: { label: 'Vibration', unit: 'Hz', max: 60, thresholds: { warn: 40, danger: 50 } },
    soundAmplitude: { label: 'Sound Amp.', unit: 'dB', max: 120, thresholds: { warn: 95, danger: 105 } },
    temperature: { label: 'Temperature', unit: '°C', max: 50, thresholds: { warn: 35, danger: 40 } },
    gasLevel: { label: 'Gas Level', unit: 'ppm', max: 500, thresholds: { warn: 350, danger: 400 } },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Live Sensor Feed" icon={<SensorIcon className="w-6 h-6 text-cyan-400" />}>
        <div className="space-y-4">
          {Object.entries(sensorConfigs).map(([key, config]) => {
            const value = sensorData[key as keyof typeof sensorConfigs];
            if (typeof value !== 'number') return null;
            return (
              <SensorBar
                key={key}
                label={config.label}
                value={value}
                max={config.max}
                thresholds={config.thresholds}
                unit={config.unit}
              />
            )
          })}
        </div>
      </Card>
      
      <Card title="AI Accident Risk" icon={<GaugeIcon className="w-6 h-6 text-cyan-400" />}>
        <RiskGauge value={accidentRisk.value} level={accidentRisk.level}/>
      </Card>

      <Card title="Driver Health" icon={<HeartIcon className="w-6 h-6 text-cyan-400" />}>
        <div className="flex flex-col justify-center h-full space-y-4 text-center">
            <div>
                <div className="text-gray-400 text-sm">Heart Rate</div>
                <div className="text-4xl font-bold text-red-400">{driverHealth.heartRate} <span className="text-lg">BPM</span></div>
            </div>
            <div>
                <div className="text-gray-400 text-sm">Fatigue Level</div>
                <div className={`text-2xl font-bold ${fatigueColor}`}>{driverHealth.fatigueLevel}</div>
            </div>
        </div>
      </Card>
      
      <Card title="Sound Classification" icon={<SoundIcon className="w-6 h-6 text-cyan-400" />}>
         <div className="flex items-center justify-center h-full">
            <p className={`text-2xl font-bold text-center ${currentSound.includes('CRASH') ? 'text-red-500 animate-pulse' : 'text-teal-300'}`}>
                {currentSound.replace(/\*/g, '')}
            </p>
         </div>
      </Card>

      <Card title="Live Camera Feed & Map" icon={<MapPinIcon className="w-6 h-6 text-cyan-400" />} className="lg:col-span-2 min-h-[300px]">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
             <div className="h-full flex items-center justify-center bg-gray-900/50 rounded-lg min-h-[250px]">
                {mode === 'live' ? <CameraFeed cameraUrl={cameraUrl} /> : <div className="text-gray-500">Live camera available in Live Data mode.</div>}
             </div>
             <div className="h-full rounded-lg min-h-[250px] lg:min-h-0">
                <MapView gps={sensorData.gps} />
             </div>
         </div>
      </Card>
      
      <Card title="Real-time Analytics" icon={<ChartBarIcon className="w-6 h-6 text-cyan-400"/>} className="lg:col-span-2 min-h-[300px]">
        <div className="w-full h-full">
            <RealtimeChart data={dataHistory} />
        </div>
      </Card>

      <Card title="Blockchain Accident Log" icon={<CubeIcon className="w-6 h-6 text-cyan-400" />} className="lg:col-span-3">
        <div className="space-y-2 h-48 overflow-y-auto pr-2">
            {accidentLog.length > 0 ? accidentLog.map(entry => (
                <div key={entry.hash} className="bg-gray-900/70 p-2 rounded-md text-xs font-mono">
                    <p><span className="text-gray-400">Time:</span> {entry.timestamp}</p>
                    <p className="truncate"><span className="text-gray-400">Hash:</span> <span className="text-yellow-400">{entry.hash}</span></p>
                    <p><span className="text-gray-400">Impact Speed:</span> <span className="text-red-400 font-bold">{entry.velocityAtImpact.toFixed(1)} km/h</span></p>
                </div>
            )) : <p className="text-gray-500 text-center pt-16">No accidents recorded.</p>}
        </div>
      </Card>

      <Card title="Quantum Rescue Route" icon={<RouteIcon className="w-6 h-6 text-cyan-400" />}>
        <div className="flex flex-col items-center justify-center h-full text-center">
            {rescueStatus === 'idle' && <p className="text-gray-500">Awaiting accident detection...</p>}
            {rescueStatus === 'calculating' && <p className="text-yellow-400 animate-pulse text-lg">Calculating optimal route...</p>}
            {rescueStatus === 'complete' && <div className="text-green-400">
                <p className="text-lg font-bold">Route Optimized!</p>
                <p>Nearest Hospital: 3.2km</p>
                <p>ETA: 4 minutes</p>
            </div>}
        </div>
      </Card>
    </div>
  );
};
