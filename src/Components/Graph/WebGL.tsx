import React, { useEffect, useRef } from "react";
import { resizeGlCanvas } from "../../WebGL/canvasUtils";
import { getParentDimensions } from "./Utils/domUtils";
import { getRenderMethod } from "./WebGLRenderMethod";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "./PeriodAverage/constants";

export const WebGL = (props: {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>();

  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;
    if (canvasElement) {
      const gl = canvasElement.getContext("webgl");

      if (gl) {
        // Get render method
        const renderMethod = getRenderMethod(props, gl, canvasElement);

        // Initial render
        const { width, height } = getParentDimensions(canvasElement);
        resizeGlCanvas(gl, width, height);
        renderMethod([width, height], margin);

        // Resize handler
        const onResize = () => {
          const { width, height } = getParentDimensions(canvasElement);
          resizeGlCanvas(gl, width, height);
          renderMethod([width, height], margin);
        };

        // Attach event listener to render on resize
        window.addEventListener("resize", onResize);

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", onResize);
      }
    }
  });

  return <canvas ref={canvasElementRef as any} />;
};
