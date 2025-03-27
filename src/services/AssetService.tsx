import { useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';

interface AssetConfig {
  name: string;
  path: string;
}

export const useAssetLoader = () => {
  const [loadedAssets, setLoadedAssets] = useState<Map<string, PIXI.Texture>>(new Map());

  const loadAsset = useCallback(async (name: string, path: string) => {
    // Check if already loaded
    if (loadedAssets.has(name)) {
      return loadedAssets.get(name)!;
    }

    try {
      PIXI.Assets.add({ alias: name, src: path });
      const texture = await PIXI.Assets.load(name);
      setLoadedAssets(prev => new Map(prev).set(name, texture));
      return texture;
    } catch (error) {
      throw new Error(`Failed to load asset: ${name}`);
    }
  }, [loadedAssets]);

  const loadMultipleAssets = useCallback(async (assets: AssetConfig[]) => {
    const loadPromises = assets.map(asset => loadAsset(asset.name, asset.path));
    return Promise.all(loadPromises);
  }, [loadAsset]);

  const lazyLoadAsset = useCallback((name: string, path: string) => {
    return new Promise<PIXI.Texture>((resolve, reject) => {
      // Use requestAnimationFrame or any condition/event to trigger load later
      requestAnimationFrame(() => {
        loadAsset(name, path).then(resolve).catch(reject);
      });
    });
  }, [loadAsset]);

  const getTexture = useCallback((name: string) => {
    return loadedAssets.get(name) || null;
  }, [loadedAssets]);

  return {
    loadAsset,
    loadMultipleAssets,
    lazyLoadAsset,
    getTexture,
    loadedAssets
  };
};