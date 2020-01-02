import React, { useEffect, useRef } from "react";
import { CanvasGL } from "../Canvas";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "./PeriodAverage/constants";
import { dateToUnix, getDateLabels, getPriceLabels } from "./Utils/labelUtils";
import { getScaleMethod } from "./Utils/numberUtils";
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
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Extract props
  const { earliestDate, latestDate, maxPrice, minPrice, values } = props;

  // Get x-axis labels
  const xConfig = getDateLabels(earliestDate, latestDate, 4);
  const { dateLabels: xLabels } = xConfig;

  // Get y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels: yLabels } = yConfig;

  // Get x-axis scale helpers
  const unixMin = dateToUnix(earliestDate);
  const unixMax = dateToUnix(latestDate);
  const scaleUnixX = getScaleMethod(unixMin, unixMax, -1, 1);
  const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

  // Get y-axis scale helpers
  const scalePriceY = getScaleMethod(yLabels[0], maxPrice, -1, 1);

  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;
    const gl = canvasElement && canvasElement.getContext("webgl");

    if (canvasElement && gl) {
      // Initialize render method
      const renderProps = {
        scaleDateX,
        scaleUnixX,
        scalePriceY,
        xLabels,
        yLabels,
        values
      };
      const renderGLCanvas = getRenderMethod(renderProps, gl, canvasElement);

      // Define render method with provided arguments
      const render = () => {
        // Calculate resolution
        const resolution: [number, number] = [
          canvasElement.offsetWidth,
          canvasElement.offsetHeight
        ];

        // Call render method
        renderGLCanvas(resolution, margin);
      };

      // Render on page load
      render();

      // Attach event listener to render on resize event
      window.addEventListener("resize", render);

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", render);
    }
  });

  return <CanvasGL ref={canvasElementRef as any} />;
};
