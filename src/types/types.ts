// Shared DataPoint interface used across multiple modules
export interface DataPoint {
    id: string;
    x: number;
    y: number;
    value: number;
    category: string;
    timestamp: number;
  }
  
  // You can add other shared types here, for example:
  
  export interface AssetConfig {
    name: string;
    path: string;
  }
  
  export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  