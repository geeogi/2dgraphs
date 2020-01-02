import React, { useEffect, useRef } from "react";
import { getRenderMethod } from "./WebGLRenderMethod";

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

  // Margin helpers
  // const withMarginY = (heightPx: number, marginYPx: number, y: number) => {
  //   const yPercentage = (y + 1) / 2;
  //   const marginY = (marginYPx / heightPx) * 2; // 0.12
  //   const availableY = 2 - marginY;
  //   return marginY + yPercentage * availableY - 1;
  // };

  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;
    if (canvasElement) {
      const gl = canvasElement.getContext("webgl");

      if (gl) {
        // Initial render
        const renderMethod = getRenderMethod(
          averagePrice,
          earliestDate,
          latestDate,
          maxPrice,
          minPrice,
          values,
          gl,
          canvasElement
        );

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
