import { useState, useCallback, useMemo } from 'react';

export interface DataPoint {
  id: string;
  x: number;
  y: number;
  value: number;
  category: string;
  timestamp: number;
}

interface DataLoaderOptions {
  maxDataPoints?: number;
  filterCategories?: string[];
}

export function useDataLoader(options: DataLoaderOptions = {}) {
  const [data, setData] = useState<DataPoint[]>([]);

  // Memoize options with defaults
  const loaderOptions = useMemo(() => ({
    maxDataPoints: 1000,
    filterCategories: [],
    ...options
  }), [options]);

  // Add a single data point
  const addDataPoint = useCallback((point: DataPoint) => {
    setData(prevData => {
      // Apply category filter
      if (loaderOptions.filterCategories.length && 
          !loaderOptions.filterCategories.includes(point.category)) {
        return prevData;
      }

      // Add new data point and trim to max points
      const newData = [...prevData, point];
      return newData.slice(-loaderOptions.maxDataPoints);
    });
  }, [loaderOptions]);

  // Add multiple data points
  const addMultipleDataPoints = useCallback((points: DataPoint[]) => {
    points.forEach(addDataPoint);
  }, [addDataPoint]);

  // Get filtered data
  const getData = useCallback((filter?: (point: DataPoint) => boolean) => {
    return filter ? data.filter(filter) : data;
  }, [data]);

  // Get data by time range
  const getDataByTimeRange = useCallback((start: number, end: number) => {
    return data.filter(
      point => point.timestamp >= start && point.timestamp <= end
    );
  }, [data]);

  // Get data by category
  const getDataByCategory = useCallback((category: string) => {
    return data.filter(point => point.category === category);
  }, [data]);

  // Clear all data
  const clear = useCallback(() => {
    setData([]);
  }, []);

  // Get data statistics
  const getStats = useMemo(() => {
    const categories: Record<string, number> = {};
    let min = Infinity;
    let max = -Infinity;

    data.forEach(point => {
      categories[point.category] = (categories[point.category] || 0) + 1;
      min = Math.min(min, point.value);
      max = Math.max(max, point.value);
    });

    return {
      totalPoints: data.length,
      categories,
      valueRange: { min, max }
    };
  }, [data]);

  return {
    data,
    addDataPoint,
    addMultipleDataPoints,
    getData,
    getDataByTimeRange,
    getDataByCategory,
    clear,
    stats: getStats
  };
}

export default useDataLoader;