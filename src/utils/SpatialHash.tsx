// src/utils/SpatialHash.tsx
import { useMemo } from 'react';

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SpatialHashable {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export function useSpatialHash<T extends SpatialHashable>(cellSize: number = 100) {
  const grid = useMemo(() => new Map<string, Set<T>>(), [cellSize]);

  const getCellKey = (x: number, y: number): string =>
    `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;

  const insert = (item: T): void => {
    const key = getCellKey(item.x, item.y);
    if (!grid.has(key)) grid.set(key, new Set());
    grid.get(key)!.add(item);
  };

  const remove = (item: T): void => {
    const key = getCellKey(item.x, item.y);
    grid.get(key)?.delete(item);
  };

  const query = (bounds: Bounds): T[] => {
    const results: T[] = [];
    const startX = Math.floor(bounds.x / cellSize);
    const endX = Math.floor((bounds.x + bounds.width) / cellSize);
    const startY = Math.floor(bounds.y / cellSize);
    const endY = Math.floor((bounds.y + bounds.height) / cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        const bucket = grid.get(key);
        if (bucket) {
          bucket.forEach(item => {
            if (intersects(item, bounds)) results.push(item);
          });
        }
      }
    }

    return results;
  };

  const intersects = (item: T, bounds: Bounds): boolean => {
    const w = item.width ?? 10;
    const h = item.height ?? 10;

    return !(
      item.x + w < bounds.x ||
      item.x > bounds.x + bounds.width ||
      item.y + h < bounds.y ||
      item.y > bounds.y + bounds.height
    );
  };

  const clear = (): void => {
    grid.clear();
  };

  return {
    insert,
    remove,
    query,
    clear,
  };
}

export default useSpatialHash;
