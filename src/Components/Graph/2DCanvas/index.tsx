import React, { useCallback, useEffect, useRef } from "react";
import { Canvas } from "../../Canvas";
import { getPeriodAverageRenderMethod } from "./2DCanvasRenderMethod";
import { getInteractivityHandlers } from "./2DCanvasUtils/eventUtils";

export const LineGraph2DCanvas = (props: {
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  // Fetch render method
  const renderMethod = getPeriodAverageRenderMethod(props);

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
    <div>
      <Canvas
        ref={canvasElementRef as any}
        onMouseDown={eventHandlers.handleMouseDown}
        onMouseLeave={eventHandlers.handleMouseLeave}
        onMouseMove={eventHandlers.handleMouseMove}
        onTouchEnd={eventHandlers.handleTouchEnd}
        onTouchMove={eventHandlers.handleTouchMove}
        onTouchStart={eventHandlers.handleTouchStart}
      />
    </div>
  );
};
