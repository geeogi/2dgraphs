import React, { memo, useEffect, useRef, useState } from "react";
import { continueStatement } from "@babel/types";

const VALUES = [
  10,
  15,
  30,
  35,
  50,
  56,
  11,
  34,
  65,
  67,
  50,
  43,
  54,
  43,
  23,
  70,
  55,
  30,
  10,
  10,
  45,
  17,
  13,
  10
];
const AVERAGE_VALUE = VALUES.reduce((a, b) => a + b, 0) / VALUES.length;

const PeriodAverageBase = props => {
  const [hasSetup, setHasSetup] = useState();

  // Element: the <canvas> element
  const canvasElement = useRef();

  // Props
  const {
    disabled = false,
    canvasWidth = 1000,
    canvasDepth = 400,
    canvasResolutionScale = 4,
    canvasSpacingUnit = 8,
    graphMargin = 8 * 5,
    graphWidth = 920,
    graphDepth = 320
  } = props;

  useEffect(() => {
    // Method: Scale canvas resolution for retina displays
    const scaleCanvasResolution = context => {
      current.style.width = canvasWidth + "px";
      current.style.height = canvasDepth + "px";
      current.width = canvasWidth * 4;
      current.height = canvasDepth * 4;
      context.scale(canvasResolutionScale, canvasResolutionScale);
    };

    // Method: descale canvas
    const descaleCanvasResolution = context => {
      context.scale(1 / canvasResolutionScale, 1 / canvasResolutionScale);
    };

    // Method: Draw x,y axes and add labels
    const drawGraphAxes = context => {
      context.beginPath();
      context.setLineDash([]);
      context.fillStyle = "#fff";
      context.strokeStyle = "#fff";
      context.lineWidth = 1;
      context.font = "20px Arial";

      // Draw x-axis
      context.moveTo(graphMargin, graphDepth + graphMargin);
      context.lineTo(graphWidth + graphMargin, graphDepth + graphMargin);

      // Draw y-axis
      context.moveTo(graphMargin, graphMargin);
      context.lineTo(graphMargin, graphDepth + graphMargin);

      // Add x-axis labels
      context.textAlign = "center";

      // Add graph title
      context.fillText(
        "Period average",
        canvasWidth / 2,
        graphMargin - canvasSpacingUnit
      );

      context.stroke();
    };

    // Method: Draw frequency areas
    const drawFrequencyLine = context => {
      // Set fill gradient
      const fillGradient = context.createLinearGradient(
        graphMargin,
        graphMargin,
        graphMargin,
        graphMargin + graphDepth
      );
      fillGradient.addColorStop(
        1 - AVERAGE_VALUE / Math.max(...VALUES),
        "#09d3ac"
      );
      fillGradient.addColorStop(
        1.01 - AVERAGE_VALUE / Math.max(...VALUES),
        "rgba(0,0,0,0)"
      );
      context.fillStyle = fillGradient;

      // Set stroke gradient
      const strokeGradient = context.createLinearGradient(
        graphMargin,
        graphMargin,
        graphMargin,
        graphMargin + graphDepth
      );
      strokeGradient.addColorStop(
        1 - AVERAGE_VALUE / Math.max(...VALUES),
        "rgba(0,0,0,0)"
      );
      strokeGradient.addColorStop(
        1.01 - AVERAGE_VALUE / Math.max(...VALUES),
        "#09d3ac"
      );
      context.strokeStyle = strokeGradient;

      // Draw dashed path
      context.setLineDash([5, 5]);
      context.beginPath();
      VALUES.forEach((value, index) => {
        const graphX = index * (graphWidth / (VALUES.length - 1));
        const graphY = (value / Math.max(...VALUES)) * graphDepth;
        context.lineTo(graphMargin + graphX, graphMargin + graphDepth - graphY);
      });
      context.fill();
      context.stroke();

      // Draw average path
      context.setLineDash([]);
      context.strokeStyle = "#09d3ac";
      context.lineWidth = 2;
      context.beginPath();
      const graphY = (AVERAGE_VALUE / Math.max(...VALUES)) * graphDepth;
      context.moveTo(graphMargin, graphMargin + graphDepth - graphY);
      context.lineTo(
        graphMargin + graphWidth,
        graphMargin + graphDepth - graphY
      );
      context.stroke();
    };

    // Method: Clear the graph
    const clearCanvas = context => {
      context.clearRect(0, 0, canvasWidth, canvasDepth);
    };

    // Fetch canvas context
    const { current } = canvasElement;
    const context = current.getContext("2d");

    // Setup graph resolution
    if (!hasSetup) {
      scaleCanvasResolution(context, current);
      setHasSetup(true);
    } else {
      descaleCanvasResolution(context, current);
      scaleCanvasResolution(context, current);
    }

    // Draw graph
    if (!disabled) {
      drawFrequencyLine(context);
    }
    drawGraphAxes(context);

    // Clean up
    return () => clearCanvas(context);
  }, [
    hasSetup,
    canvasResolutionScale,
    disabled,
    graphMargin,
    graphDepth,
    graphWidth,
    canvasWidth,
    canvasDepth,
    canvasSpacingUnit
  ]);

  return (
    <canvas
      name="frequency"
      ref={canvasElement}
      width={canvasWidth + "px"}
      height={canvasDepth + "px"}
    />
  );
};

export const PeriodAverage = memo(PeriodAverageBase);
