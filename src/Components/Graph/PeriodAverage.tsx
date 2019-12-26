import React, { memo, useCallback, useEffect, useRef } from "react";
import { Canvas } from "../Canvas";
import { getRenderMethod } from "./PeriodAverage/renderMethod";
import { getInteractivityHandlers } from "./Utils/interactivityUtils";

const PeriodAverageBase = (props: {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  // Fetch render method
  const renderMethod = getRenderMethod(props);

  // Create render method React callback
  const callbackRenderMethod = useCallback(renderMethod, [props]);

  // Fetch interactivity event listeners
  const eventHandlers = getInteractivityHandlers(renderMethod);

  // Create canvas element React reference
  const canvasElementRef = useRef();

  // Define rendering React effect
  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;

    // Define resize method
    const onResize = () => callbackRenderMethod({ canvasElement });

    if (canvasElement) {
      // Render on mount
      callbackRenderMethod({ canvasElement });

      // Attach resize listener
      window.addEventListener("resize", onResize);
    }

    // Cleanup function removes resize listener
    return () => window.removeEventListener("resize", onResize);
  }, [callbackRenderMethod]);

  return (
    <Canvas
      ref={canvasElementRef as any}
      onMouseDown={eventHandlers.handleMouseDown}
      onMouseLeave={eventHandlers.handleMouseLeave}
      onMouseMove={eventHandlers.handleMouseMove}
      onTouchEnd={eventHandlers.handleTouchEnd}
      onTouchMove={eventHandlers.handleTouchMove}
      onTouchStart={eventHandlers.handleTouchStart}
    />
  );
};

export const PeriodAverage = memo(PeriodAverageBase);
