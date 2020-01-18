import { VALUES } from "./Data/data";
import { drawGraph } from "./Graph";
import { drawGraph2DCanvas } from "./Graph/2DCanvas/index";
import { drawGraphWebGL } from "./Graph/WebGL/index";
import { GraphDrawingMethod } from "./types";

/**
 *
 * Note: this file is concerned with the DOM and state.
 * See ./Graph for graph drawing logic.
 *
 */

// Declare render variables to be cached
let prevCanvasId: string;
let prevDrawingMethod: GraphDrawingMethod;
let prevRescaleMethod: (numberOfDataPoints: number) => void;
let prevNoOfDataPoints: number = 400;

// Method to call the drawing method, manipulate the DOM and update cache state
export const callDrawGraph = (
  canvasId: string,
  drawingMethod: GraphDrawingMethod,
  noOfDataPoints: number = prevNoOfDataPoints
) => {
  // DOM: Fetch canvas element
  const canvas: HTMLCanvasElement = document.getElementById(canvasId) as any;

  // DOM: Hide prev canvas if the canvasId has changed
  if (prevCanvasId && canvasId !== prevCanvasId) {
    const prevCanvas = document.getElementById(prevCanvasId);
    prevCanvas.setAttribute("style", "display: none;");
  }

  // DOM: Show canvas
  canvas.setAttribute("style", "display: block;");

  // Draw the graph
  const { rescale } = drawGraph(canvas, drawingMethod, noOfDataPoints, VALUES);

  // Cache render variables
  prevNoOfDataPoints = noOfDataPoints;
  prevDrawingMethod = drawingMethod;
  prevRescaleMethod = rescale ? rescale : undefined;
  prevCanvasId = canvasId;
};

/**
 *
 * Immediately invoked methods.
 *
 */
// Draw graph and attach handlers to buttons and inputs on Window load
window.onload = () => {
  document.getElementById("render-2d-canvas-button").onclick = () =>
    callDrawGraph("line-graph-2d-canvas", drawGraph2DCanvas);

  document.getElementById("render-webgl-button").onclick = () =>
    callDrawGraph("line-graph-webgl", drawGraphWebGL);

  document.getElementById("data-points-slider").oninput = e => {
    const newNoOfDataPoints = parseInt((e.target as HTMLInputElement).value);
    const dataPointsElement = document.getElementById("data-points-preview");
    dataPointsElement.innerText = newNoOfDataPoints.toString();
    if (prevRescaleMethod) {
      prevNoOfDataPoints = newNoOfDataPoints;
      prevRescaleMethod(newNoOfDataPoints);
    } else {
      callDrawGraph(prevCanvasId, prevDrawingMethod, newNoOfDataPoints);
    }
  };

  callDrawGraph("line-graph-2d-canvas", drawGraph2DCanvas, 3000);
};
