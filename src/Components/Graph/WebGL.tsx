import React, { useEffect, useRef } from "react";
import { getDrawAreaMethod } from "../../WebGL/drawArea";
import { getDrawLineMethod } from "../../WebGL/drawLine";
import { getParentDimensions } from "./Utils/domUtils";
import { resizeGlCanvas } from "../../WebGL/canvasUtils";

export const WebGL = (props: {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>();

  const {
    averagePrice,
    earliestDate,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

  // Initialize canvas coordinates
  const linePoints: { x: number; y: number; z: number }[] = [];
  const areaPoints: { x: number; y: number; z: number }[] = [];

  // Populate coordinates
  values.forEach((value, index) => {
    const x = (index / values.length) * 2 - 1;
    const y = ((value.price - minPrice) / (maxPrice - minPrice)) * 2 - 1;
    const z = 0.5;
    linePoints.push({ x, y, z });
    areaPoints.push({ x, y, z });
    areaPoints.push({ x, y: -1, z });
  });

  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;
    if (canvasElement) {
      const gl = canvasElement.getContext("webgl");

      if (gl) {
        const drawPrimaryLine = getDrawLineMethod(gl, linePoints);
        const drawPrimaryArea = getDrawAreaMethod(gl, areaPoints);

        const renderMethod = () => {
          // Size the canvas
          const { width, height } = getParentDimensions(canvasElement);
          resizeGlCanvas(gl, width, height);

          // Clear the canvas
          gl.clearColor(0, 0, 0, 0);

          // Enable the depth test
          gl.enable(gl.DEPTH_TEST);

          // Clear the color and depth buffer
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

          // Set the view port
          gl.viewport(0, 0, canvasElement.width, canvasElement.height);

          // Draw elements
          drawPrimaryLine();
          drawPrimaryArea();
        };

        // Initial render
        renderMethod();

        // Attach event listener to render on resize
        window.addEventListener("resize", renderMethod);

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", renderMethod);
      }
    }
  });

  return <canvas ref={canvasElementRef as any} />;
};
