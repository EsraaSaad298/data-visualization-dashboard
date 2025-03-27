import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { BlurFilter } from '@pixi/filter-blur';
import { DisplacementFilter } from '@pixi/filter-displacement';
import gsap from 'gsap';
import { DataPacket } from '../services/WebSocketService';

interface Props {
  height: number;
  data: DataPacket[];
  layoutMode: 'clustered' | 'freeform';
  onNodeClick?: (node: DataPacket) => void;
  onFpsUpdate?: (fps: number) => void;
}

const VisualizationManager: React.FC<Props> = ({
  height,
  data,
  layoutMode,
  onNodeClick,
  onFpsUpdate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(1150);
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const containerRef = useRef<PIXI.Container | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const nodeMapRef = useRef<Map<string, PIXI.Sprite>>(new Map());

  useEffect(() => {
    if (!canvasRef.current) return;

    const resize = () => {
      setCanvasWidth(canvasRef.current?.offsetWidth ?? 1150);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app: any = new PIXI.Application({
      width: canvasWidth,
      height,
      backgroundColor: 0x0f172a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(app.view);
    setApp(app);

    // Stage & container
    const stage = new PIXI.Container();
    const container = new PIXI.Container();
    stage.addChild(container);
    app.stage.addChild(stage);
    containerRef.current = container;

    // Pan & zoom
    let dragging = false;
    let lastPos = { x: 0, y: 0 };
    stage.eventMode = 'static';

    stage.on('pointerdown', (e) => {
      dragging = true;
      lastPos = { x: e.global.x, y: e.global.y };
    });
    stage.on('pointerup', () => (dragging = false));
    stage.on('pointerupoutside', () => (dragging = false));
    stage.on('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.global.x - lastPos.x;
      const dy = e.global.y - lastPos.y;
      stage.x += dx;
      stage.y += dy;
      lastPos = { x: e.global.x, y: e.global.y };
    });

    app.view.addEventListener('wheel', (e: any) => {
      const scale = Math.max(0.5, Math.min(2.5, stage.scale.x - e.deltaY * 0.001));
      stage.scale.set(scale);
    });

    // Ripple effect
    const rippleTexture = PIXI.Texture.from('https://pixijs.io/examples/examples/assets/displacement_map_repeat.jpg');
    const ripple = new PIXI.Sprite(rippleTexture);
    ripple.anchor.set(0.5);
    ripple.alpha = 0.1;
    ripple.scale.set(2);
    ripple.x = canvasWidth / 2;
    ripple.y = height / 2;

    const displace = new DisplacementFilter(ripple);
    app.stage.addChild(ripple);
    app.stage.filters = [displace];

    app.ticker.add(() => {
      ripple.x += 0.4;
      ripple.y += 0.4;
    });

    // FPS tracking
    let frameCount = 0;
    let lastTime = performance.now();

    app.ticker.add(() => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        onFpsUpdate?.(frameCount);
        frameCount = 0;
        lastTime = now;
      }
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'fixed z-50 px-3 py-2 text-xs bg-gray-800 text-white rounded shadow-md pointer-events-none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    return () => {
      app.destroy(true, { children: true });
      document.body.removeChild(tooltip);
    };
  }, [canvasWidth, height]);

  useEffect(() => {
    if (!app || !containerRef.current) return;

    const container = containerRef.current;
    const existingNodes = nodeMapRef.current;
    const newIds = new Set(data.map((d) => d.id));

    const spacing = 36;
    const rowTracker = { Sensor: 60, System: 60, Event: 60 };
    const columnWidth = canvasWidth / 3;
    const clusterShift = columnWidth * 0.05;

    const layoutZones = {
      Sensor: columnWidth * 0.5 - clusterShift,
      System: columnWidth * 1.5 - clusterShift,
      Event: columnWidth * 2.5 - clusterShift,
    };

    // Remove deleted
    existingNodes.forEach((sprite, id) => {
      if (!newIds.has(id)) {
        container.removeChild(sprite);
        existingNodes.delete(id);
      }
    });

    // Add or update
    data.forEach((point) => {
      let node = existingNodes.get(point.id);
      const radius = Math.max(5, point.value / 6);
      const padding = 10;
      const texSize = radius * 2 + padding * 2;

      if (!node) {
        const g = new PIXI.Graphics();
        g.beginFill(
          point.category === 'Sensor'
            ? 0x4ecdc4
            : point.category === 'System'
            ? 0xff6b6b
            : 0xf9c74f
        );
        g.drawCircle(texSize / 2, texSize / 2, radius);
        g.endFill();

        const texture = app.renderer.generateTexture(g, {
          resolution: 1,
          region: new PIXI.Rectangle(0, 0, texSize, texSize),
        });

        node = new PIXI.Sprite(texture);
        node.anchor.set(0.5);
        node.interactive = true;
        node.cursor = 'pointer';

        // Filters
        if (point.status === 'critical') {
          node.filters = [new GlowFilter({ color: 0xff0000 })];
        } else if (point.status === 'idle') {
          node.filters = [new BlurFilter(2)];
        }

        // Events
        node.on('pointerover', (e) => {
          if (tooltipRef.current) {
            tooltipRef.current.innerHTML = `
              <strong>${point.name}</strong><br/>
              Category: ${point.category}<br/>
              Value: ${point.value.toFixed(2)}<br/>
              Status: ${point.status}
            `;
            tooltipRef.current.style.left = `${e.clientX + 12}px`;
            tooltipRef.current.style.top = `${e.clientY + 8}px`;
            tooltipRef.current.style.display = 'block';
          }
          node.scale.set(1.4);
        });

        node.on('pointermove', (e) => {
          if (tooltipRef.current && tooltipRef.current.style.display === 'block') {
            tooltipRef.current.style.left = `${e.clientX + 12}px`;
            tooltipRef.current.style.top = `${e.clientY + 8}px`;
          }
        });

        node.on('pointerout', () => {
          tooltipRef.current!.style.display = 'none';
          node.scale.set(1);
        });

        node.on('pointerdown', () => {
          onNodeClick?.(point);
        });

        container.addChild(node);
        existingNodes.set(point.id, node);
      }

      let x = point.x;
      let y = point.y;

      if (layoutMode === 'clustered') {
        x = layoutZones[point.category] ?? canvasWidth / 2;
        y = rowTracker[point.category] ?? 80;
        rowTracker[point.category] += spacing;
      }

      gsap.to(node, {
        x,
        y,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  }, [data, layoutMode, app]);

  return (
    <div
      ref={canvasRef}
      className="overflow-hidden"
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '12px',
        border: '1px solid #333',
        backgroundColor: '#0f172a',
        position: 'relative',
      }}
    />
  );
};

export default VisualizationManager;
