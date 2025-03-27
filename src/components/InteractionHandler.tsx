// src/components/InteractionHandler.tsx
import React, { useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { FederatedPointerEvent } from '@pixi/events';
import { DisplayObject } from '@pixi/display';

export const useInteractionHandler = (app: PIXI.Application) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleZoom = useCallback((event: WheelEvent) => {
    const stage = app.stage;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const rect = app.view.getBoundingClientRect();
    const mouse = new PIXI.Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    stage.scale.x *= zoomFactor;
    stage.scale.y *= zoomFactor;

    stage.x = mouse.x - (mouse.x - stage.x) * zoomFactor;
    stage.y = mouse.y - (mouse.y - stage.y) * zoomFactor;
  }, [app]);

  const handlePan = useCallback(() => {
    let isDragging = false;
    let lastPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      app.stage.x += dx;
      app.stage.y += dy;
      lastPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    app.view.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      app.view.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [app]);

  const selectItem = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const applyHoverEffect = useCallback((item: DisplayObject) => {
    item.interactive = true;

    item.on('pointerover', () => {
      gsap.to(item.scale, { x: 1.4, y: 1.4, duration: 0.2 });
    });

    item.on('pointerout', () => {
      gsap.to(item.scale, { x: 1.0, y: 1.0, duration: 0.2 });
    });
  }, []);

  return {
    handleZoom,
    handlePan,
    selectItem,
    applyHoverEffect,
    selectedItems,
  };
};
