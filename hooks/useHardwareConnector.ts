import { useState, useRef, useCallback } from 'react';
import { SensorData } from '../utils/simulation';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export const useHardwareConnector = (url: string) => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
    const [latestData, setLatestData] = useState<SensorData | null>(null);
    const ws = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (!url || ws.current) {
            console.warn("WebSocket URL is not set or connection already exists.");
            if (!url) setConnectionStatus('error');
            return;
        }

        setConnectionStatus('connecting');
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log("WebSocket connection established");
            setConnectionStatus('connected');
        };

        ws.current.onmessage = (event) => {
            try {
                // Expects a JSON string with the SensorData structure, including velocity and driverHealth
                // e.g., {"gForce":0.2, "vibration":20, ..., "velocity": 60, "driverHealth": {"heartRate": 75, "fatigueLevel": "Normal"}}
                const data: SensorData = JSON.parse(event.data);
                // Basic validation
                if (data && typeof data.gForce === 'number' && typeof data.velocity === 'number') {
                    setLatestData(data);
                } else {
                    console.warn("Received malformed data:", data);
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            setConnectionStatus('error');
        };

        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
            setConnectionStatus('disconnected');
            ws.current = null;
        };

    }, [url]);

    const disconnect = useCallback(() => {
        if (ws.current) {
            ws.current.close();
        }
    }, []);

    return {
        connect,
        disconnect,
        isConnected: connectionStatus === 'connected',
        latestData,
        connectionStatus,
    };
};