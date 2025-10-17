import { SensorData } from './utils/simulation';

export interface AccidentLog {
  timestamp: string;
  hash: string;
  previousHash: string;
  data: SensorData;
  velocityAtImpact: number;
}
