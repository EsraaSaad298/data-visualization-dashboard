// src/components/PixiCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { usePerformanceOptimizer } from '../utils/PerformanceOptimizer';

interface DataPoint {
  id: string;
  x: number;
  y: number;
  value: number;
  category: string;
}

interface PixiCanvasProps {
  width: number;
  height: number;
  initialData: DataPoint[];
}

const PixiCanvas: React.FC<PixiCanvasProps> = ({ 
  width, 
  height, 
  initialData 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const [nodeContainer, setNodeContainer] = useState<PIXI.Container | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const pixiApp = new PIXI.Application({
      width,
      height,
      backgroundColor: 'white', // dark slate
      resolution: window.devicePixelRatio || 1,
      antialias: true,
      autoDensity: true
    });

    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(pixiApp.view as unknown as Node);
    setApp(pixiApp);

    const container = new PIXI.Container();
    pixiApp.stage.addChild(container);
    setNodeContainer(container);

    const { optimizeSpatialRendering } = usePerformanceOptimizer(pixiApp);
    pixiApp.ticker.add(() => {
      optimizeSpatialRendering(container);
    });

    return () => {
      pixiApp.destroy(true, { children: true });
    };
  }, [width, height]);

  useEffect(() => {
    if (!nodeContainer || !app) return;

    nodeContainer.removeChildren();

    initialData.forEach(point => {
      const categoryColors: Record<string, number> = {
        A: 0xff6b6b,
        B: 0x4ecdc4,
        C: 0x45b7d1,
      };

      const node = new PIXI.Graphics();
      node.beginFill(categoryColors[point.category] || 0xffffff);
      node.drawCircle(0, 0, Math.max(5, point.value / 5));
      node.endFill();

      node.x = point.x;
      node.y = point.y;
      node.alpha = 0;

      node.interactive = true;
      node.cursor = 'pointer';

      node.on('pointerover', () => {
        gsap.to(node.scale, { x: 1.5, y: 1.5, duration: 0.2 });
      });
      node.on('pointerout', () => {
        gsap.to(node.scale, { x: 1, y: 1, duration: 0.2 });
      });

      nodeContainer.addChild(node);

      // Animate fade-in
      gsap.to(node, { alpha: 1, duration: 0.5, ease: 'power2.out' });
    });

    // Zooming
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      nodeContainer.scale.set(
        nodeContainer.scale.x * scaleFactor,
        nodeContainer.scale.y * scaleFactor
      );
    };

    app.view.addEventListener('wheel', handleWheel);

    return () => {
      app.view.removeEventListener('wheel', handleWheel);
    };
  }, [initialData, nodeContainer, app]);

  return (
    <div
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #333',
        borderRadius: '8px',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
      }}
    />
  );
};

export default PixiCanvas;
