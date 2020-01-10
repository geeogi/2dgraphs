import moment from "moment";
import React, { useEffect, useRef } from "react";
import { Div } from "../../Base/Div";
import { ActiveLegend, AxisLabel } from "../AxisLegend";
import { Canvas } from "../Canvas";
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

  // Extract graph props
  const { earliestDate, latestDate, maxPrice, minPrice, values } = props;

  // Configure x-axis labels
  const xConfig = getDateLabels(earliestDate, latestDate, 4);
  const { dateLabels, displayFormat } = xConfig;

  // Configure y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels } = yConfig;

  // Configure x-axis scale helpers
  const unixMin = dateToUnix(earliestDate);
  const unixMax = dateToUnix(latestDate);
  const scaleUnixX = getScaleMethod(unixMin, unixMax, -1, 1);
  const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

  // Configure y-axis scale helpers
  const scalePriceY = getScaleMethod(priceLabels[0], maxPrice, -1, 1);

  // Configure axis grid lines in [-1,1] clip space
  const xGridLines = dateLabels.map(label => scaleUnixX(label / 1000));
  const yGridLines = priceLabels.map(label => scalePriceY(label));

  // Calculate point coordinates [-1,1] for each value
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
    priceLabels.forEach((label, index) => {
      const labelElement = document.getElementById(JSON.stringify(label));
      if (labelElement) {
        const yTopPercentage = 1 - (yGridLines[index] + 1) / 2;
        const yTop = yTopPercentage * (resolution[1] - 2 * margin[1]);
        labelElement.style.top = Math.floor(margin[1] + yTop - 18) + "px";
        labelElement.style.left = Math.floor(LABEL_MARGIN_X) + "px";
        labelElement.style.display = "block";
      }
    });

    // x-axis
    dateLabels.forEach((label, index) => {
      const labelElement = document.getElementById(JSON.stringify(label));
      if (labelElement) {
        const xLeftPercentage = (xGridLines[index] + 1) / 2;
        const xLeft = xLeftPercentage * (resolution[0] - 2 * margin[0]);
        labelElement.style.left = Math.floor(xLeft - 10) + "px";
        labelElement.style.top = Math.floor(resolution[1] - 19) + "px";
        labelElement.style.display = "block";
      }
    });
  };

  /* DRAW GRAPH AND ATTACH LISTENERS ON FIRST RENDER */
  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;
    const gl = canvasElement && canvasElement.getContext("webgl");

    if (canvasElement && gl) {
      // Initialize GL render method
      const renderGLCanvas = getRenderMethod(
        {
          xGridLines,
          yGridLines,
          points
        },
        gl,
        margin
      );

      // Define full render method
      const renderGraph = (args?: { activeX?: number; activeY?: number }) => {
        // Extract render args
        const { activeX } = args || {};

        // Calculate canvas resolution
        const resolution: [number, number] = [
          canvasElement.offsetWidth,
          canvasElement.offsetHeight
        ];

        // Calculate graph width and height in px
        const graphWidth = resolution[0] - 2 * margin[0];
        const graphHeight = resolution[1] - 2 * margin[1];

        // Scale activeX to [-1,1] clip space
        const clipSpaceActiveX = activeX
          ? ((activeX - margin[0]) / graphWidth) * 2 - 1
          : undefined;

        // Call WebGL render method
        renderGLCanvas(resolution, clipSpaceActiveX);

        // Show or hide active legend
        const activeLegendElement = document.getElementById(ACTIVE_LEGEND_ID);
        if (activeLegendElement) {
          if (activeX && clipSpaceActiveX) {
            // Fetch nearest point to activeX
            const [{ x, y, dateTime, price }] = points.sort((a, b) => {
              return (
                Math.abs(a.x - clipSpaceActiveX) -
                Math.abs(b.x - clipSpaceActiveX)
              );
            });

            // Scale x from [-1,1] clip space to screen resolution
            const nearXGraphX = margin[0] + ((x + 1) / 2) * graphWidth;
            const rawLegendX = nearXGraphX - ACTIVE_LEGEND_WIDTH / 2;
            const legendLeftMax = 0;
            const legendRightMax = resolution[0] - ACTIVE_LEGEND_WIDTH;
            const legendX = clamp(rawLegendX, legendLeftMax, legendRightMax);

            // Scale y from [-1,1] clip space to screen resolution
            const nearYGraphY = margin[1] + ((y + 1) / 2) * graphHeight;
            const baseLegendY = resolution[1] - (margin[1] + 2 * SPACING_UNIT);
            const altLegendY = nearYGraphY - 5 * SPACING_UNIT;
            const useBase = baseLegendY > nearYGraphY;
            const legendY = useBase ? baseLegendY : altLegendY;

            // Format display variables
            const displayPrice = Math.round(price);
            const displayDate = moment(dateTime).format("DD MMM YY");

            // Update active legend DOM element
            activeLegendElement.style.left = legendX + "px";
            activeLegendElement.style.top = resolution[1] - legendY + "px";
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
        handleMouseMove,
        handleTouchMove,
        handleTouchStart
      } = getWebGLInteractivityHandlers(renderGraph);

      // Attach interactivity event listeners
      canvasElement.addEventListener("mousedown", handleMouseDown);
      canvasElement.addEventListener("mousemove", handleMouseMove);
      canvasElement.addEventListener("touchmove", handleTouchMove);
      canvasElement.addEventListener("touchstart", handleTouchStart);

      // Render and position labels on page load
      renderGraph();
      positionLabels(canvasElement);

      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener("resize", onResize);
        canvasElement.removeEventListener("mousedown", handleMouseDown);
        canvasElement.removeEventListener("mousemove", handleMouseMove);
        canvasElement.removeEventListener("touchmove", handleTouchMove);
        canvasElement.removeEventListener("touchstart", handleTouchStart);
      };
    }
  });

  return (
    <Div position="relative">
      <Canvas ref={canvasElementRef as any} />
      {priceLabels.map(label => (
        <AxisLabel id={JSON.stringify(label)} style={{ display: "none" }}>
          ${label}
        </AxisLabel>
      ))}
      {dateLabels.map(label => (
        <AxisLabel id={JSON.stringify(label)} style={{ display: "none" }}>
          {moment(label).format(displayFormat)}
        </AxisLabel>
      ))}
      <ActiveLegend
        id={ACTIVE_LEGEND_ID}
        width={ACTIVE_LEGEND_WIDTH}
        style={{ display: "none" }}
      />
    </Div>
  );
};
