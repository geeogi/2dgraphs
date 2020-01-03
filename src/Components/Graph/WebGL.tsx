import React, { useEffect, useRef } from "react";
import { getWebGLInteractivityHandlers } from "../../WebGL/eventUtils";
import { CanvasGL } from "../Canvas";
import { AbsoluteLabel, RelativeGraphContainer } from "../GraphContainer";
import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "./PeriodAverage/constants";
import { dateToUnix, getDateLabels, getPriceLabels } from "./Utils/labelUtils";
import { getScaleMethod } from "./Utils/numberUtils";
import { getRenderMethod } from "./WebGLRenderMethod";
import moment from "moment";

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
      const renderGLCanvas = getRenderMethod(
        renderProps,
        gl,
        canvasElement,
        margin
      );

      // Define render method with provided arguments
      const doRender = (args?: { activeX?: number; activeY?: number }) => {
        // Extract render args
        const { activeX, activeY } = args || {};

        // Calculate resolution
        const resolution: [number, number] = [
          canvasElement.offsetWidth,
          canvasElement.offsetHeight
        ];

        // Call render method
        renderGLCanvas(resolution, activeX, activeY);

        // Position labels
        yLabels.forEach(label => {
          const labelElement = document.getElementById(JSON.stringify(label));
          if (labelElement) {
            const yTopPercentage = 1 - (scalePriceY(label) + 1) / 2;
            const yTop = yTopPercentage * (resolution[1] - margin[1]);
            labelElement.style.top = Math.floor(yTop) + "px";
          }
        });
        xLabels.forEach(label => {
          const labelElement = document.getElementById(JSON.stringify(label));
          if (labelElement) {
            const xLeftPercentage = 1 - (scaleUnixX(label / 1000) + 1) / 2;
            const xLeft = xLeftPercentage * (resolution[0] - margin[0]);
            labelElement.style.left = Math.floor(xLeft) + "px";
            labelElement.style.top = Math.floor(resolution[1]) + "px";
          }
        });
      };

      // Render on page load
      doRender();

      // Define resize handler
      const onResize = () => doRender();

      // Attach event listener to render on resize event
      window.addEventListener("resize", onResize);

      // Fetch interactivity event listeners
      const {
        handleMouseDown,
        handleMouseLeave,
        handleMouseMove,
        handleTouchEnd,
        handleTouchMove,
        handleTouchStart
      } = getWebGLInteractivityHandlers(doRender);

      // Attach interactivity event listeners
      canvasElement.addEventListener("mousedown", handleMouseDown);
      canvasElement.addEventListener("mouseleave", handleMouseLeave);
      canvasElement.addEventListener("mousemove", handleMouseMove);
      canvasElement.addEventListener("touchend", handleTouchEnd);
      canvasElement.addEventListener("touchmove", handleTouchMove);
      canvasElement.addEventListener("touchstart", handleTouchStart);

      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener("resize", onResize);
        canvasElement.removeEventListener("mousedown", handleMouseDown);
        canvasElement.removeEventListener("mouseleave", handleMouseLeave);
        canvasElement.removeEventListener("mousemove", handleMouseMove);
        canvasElement.removeEventListener("touchend", handleTouchEnd);
        canvasElement.removeEventListener("touchmove", handleTouchMove);
        canvasElement.removeEventListener("touchstart", handleTouchStart);
      };
    }
  });

  return (
    <RelativeGraphContainer>
      <CanvasGL ref={canvasElementRef as any} />
      {yLabels.map(label => (
        <AbsoluteLabel id={JSON.stringify(label)}>${label}</AbsoluteLabel>
      ))}
      {xLabels.map(label => (
        <AbsoluteLabel id={JSON.stringify(label)}>
          {moment(label).format("MMM 'YY")}
        </AbsoluteLabel>
      ))}
    </RelativeGraphContainer>
  );
};
