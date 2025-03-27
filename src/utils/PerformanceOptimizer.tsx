// src/utils/PerformanceOptimizer.tsx
import * as PIXI from 'pixi.js';
import { DisplayObject } from '@pixi/display';
import { useCallback } from 'react';

export const usePerformanceOptimizer = (app: PIXI.Application) => {
  const optimizeSpatialRendering = useCallback((stage: PIXI.Container) => {
    const screenBounds = {
      x: -app.stage.x / app.stage.scale.x,
      y: -app.stage.y / app.stage.scale.y,
      width: app.screen.width / app.stage.scale.x,
      height: app.screen.height / app.stage.scale.y
    };

    stage.children.forEach(child => {
      if (child instanceof DisplayObject) {
        const bounds = child.getBounds();
        const isVisible =
          bounds.x + bounds.width > screenBounds.x &&
          bounds.x < screenBounds.x + screenBounds.width &&
          bounds.y + bounds.height > screenBounds.y &&
          bounds.y < screenBounds.y + screenBounds.height;

        child.visible = isVisible;
      }
    });
  }, [app]);

  const setupBatchRendering = useCallback(() => {
    const batchContainer = new PIXI.Container();
    app.stage.addChild(batchContainer);
    return batchContainer;
  }, [app]);

  const applyLevelOfDetail = useCallback((objects: DisplayObject[], threshold = 1000) => {
    objects.forEach((obj, index) => {
      if (index > threshold) {
        if (obj instanceof PIXI.Graphics) {
          obj.alpha = 0.5;
          obj.scale.set(0.6);
        }
      }
    });
  }, []);

  return {
    optimizeSpatialRendering,
    setupBatchRendering,
    applyLevelOfDetail,
  };
};
