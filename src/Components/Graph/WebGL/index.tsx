import moment from "moment";
import React, { useEffect, useRef } from "react";
import { Canvas } from "../../Canvas";
import { ActiveLegend, AxisLabel } from "../../Graph";
import { Div } from "../../Base/Div";
import {
  ACTIVE_LEGEND,
  GRAPH_MARGIN_X,
  GRAPH_MARGIN_Y,
  LABEL_MARGIN_X,
  SPACING_UNIT
} from "../constants";
import { dateToUnix, getDateLabels, getPriceLabels } from "../labelUtils";
import { clamp, getScaleMethod } from "../numberUtils";
import { getRenderMethod } from "./WebGLRenderMethod";
import { getWebGLInteractivityHandlers } from "./WebGLUtils/eventUtils";

const ACTIVE_LEGEND_WIDTH = ACTIVE_LEGEND.WIDTH;
const ACTIVE_LEGEND_ID = "active-legend";

export const LineGraphWebGL = (props: {
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
  const { dateLabels: xLabels, displayFormat } = xConfig;

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

  // Calculate point coordinates for each value
  const points = values.map(value => ({
    x: scaleDateX(value.dateTime),
    y: scalePriceY(value.price),
    price: value.price,
    dateTime: value.dateTime
  }));

  // Define method to position axis labels
  const positionLabels = (canvasElement: HTMLCanvasElement) => {
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];

    // y-axis
    yLabels.forEach(label => {
      const labelElement = document.getElementById(JSON.stringify(label));
      if (labelElement) {
        const yTopPercentage = 1 - (scalePriceY(label) + 1) / 2;
        const yTop = yTopPercentage * (resolution[1] - 2 * margin[1]);
        labelElement.style.top = Math.floor(margin[1] + yTop - 18) + "px";
        labelElement.style.left = Math.floor(LABEL_MARGIN_X) + "px";
      }
    });

    // x-axis
    xLabels.forEach(label => {
      const labelElement = document.getElementById(JSON.stringify(label));
      if (labelElement) {
        const xLeftPercentage = (scaleUnixX(label / 1000) + 1) / 2;
        const xLeft = xLeftPercentage * (resolution[0] - 2 * margin[0]);
        labelElement.style.left = Math.floor(xLeft - 12) + "px";
        labelElement.style.top = Math.floor(resolution[1] - 20) + "px";
      }
    });
  };

  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;
    const gl = canvasElement && canvasElement.getContext("webgl");

    if (canvasElement && gl) {
      // Initialize GL render method
      const renderGLCanvas = getRenderMethod(
        {
          scaleDateX,
          scaleUnixX,
          scalePriceY,
          xLabels,
          yLabels,
          values
        },
        gl,
        margin
      );

      // Define full render method
      const renderGraph = (args?: { activeX?: number; activeY?: number }) => {
        // Extract render args
        const { activeX, activeY } = args || {};

        // Calculate resolution
        const resolution: [number, number] = [
          canvasElement.offsetWidth,
          canvasElement.offsetHeight
        ];

        // Get clip space scale helpers
        const scaleWidthToPx = getScaleMethod(-1, 1, 0, resolution[0]);
        const scaleWidthToClipSpace = getScaleMethod(0, resolution[0], -1, 1);
        const scaleHeightToPx = getScaleMethod(-1, 1, 0, resolution[1]);
        const scaleHeightToClipSpace = getScaleMethod(0, resolution[1], -1, 1);

        // Call render method
        renderGLCanvas(resolution, activeX, activeY);

        // Show or hide active legend
        const activeLegendElement = document.getElementById(ACTIVE_LEGEND_ID);
        if (activeLegendElement) {
          if (activeX) {
            // Scale activeX to [-1,1] clip space
            const clipSpaceX = scaleWidthToClipSpace(activeX);

            // Fetch nearest point to activeX
            const [{ x, y, dateTime, price }] = points.sort((a, b) => {
              return Math.abs(a.x - clipSpaceX) - Math.abs(b.x - clipSpaceX);
            });

            // Scale x from [-1,1] clip space to screen resolution
            const nearestX = scaleWidthToPx(x);
            const legendX = Math.floor(nearestX) - ACTIVE_LEGEND_WIDTH / 2;
            const clippedLegendX = clamp(
              margin[0] + legendX,
              0,
              resolution[0] - ACTIVE_LEGEND_WIDTH
            );

            // Scale y from [-1,1] clip space to screen resolution
            const nearestY = scaleHeightToPx(y);
            const legendY = resolution[1] - (margin[1] + 2 * SPACING_UNIT);
            const clippedLegendY =
              legendY > nearestY ? legendY : nearestY - 9 * SPACING_UNIT;

            // Format display variables
            const displayPrice = Math.round(price);
            const displayDate = moment(dateTime).format("DD MMM YY");

            // Update DOM element
            activeLegendElement.style.left = clippedLegendX + "px";
            activeLegendElement.style.top =
              resolution[1] - clippedLegendY + "px";
            activeLegendElement.textContent = `$${displayPrice} – ${displayDate}`;
            activeLegendElement.style.display = "block";
          } else {
            activeLegendElement.style.display = "none";
          }
        }
      };

      // Define resize handler
      const onResize = () => {
        renderGraph();
        positionLabels(canvasElement); // Labels need repositioning on resize
      };

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
      } = getWebGLInteractivityHandlers(renderGraph);

      // Attach interactivity event listeners
      canvasElement.addEventListener("mousedown", handleMouseDown);
      canvasElement.addEventListener("mouseleave", handleMouseLeave);
      canvasElement.addEventListener("mousemove", handleMouseMove);
      canvasElement.addEventListener("touchend", handleTouchEnd);
      canvasElement.addEventListener("touchmove", handleTouchMove);
      canvasElement.addEventListener("touchstart", handleTouchStart);

      // Render and position labels on page load
      renderGraph();
      positionLabels(canvasElement);

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
    <Div position="relative">
      <Canvas ref={canvasElementRef as any} />
      {yLabels.map(label => (
        <AxisLabel id={JSON.stringify(label)}>${label}</AxisLabel>
      ))}
      {xLabels.map(label => (
        <AxisLabel id={JSON.stringify(label)}>
          {moment(label).format(displayFormat)}
        </AxisLabel>
      ))}
      <ActiveLegend id={ACTIVE_LEGEND_ID} width={ACTIVE_LEGEND_WIDTH} />
    </Div>
  );
};
