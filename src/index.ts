import PRICE_DATA from "./example.json";
import { drawGraph } from "./Graph";
import { drawGraph2DCanvas } from "./Graph/2DCanvas";
import { drawGraphWebGL } from "./Graph/WebGL/index";
import { GraphDrawingMethod } from "./types";

/**
 *
 * Note: this file is concerned with the DOM and cache.
 * See ./Graph for graph drawing logic.
 *
 */

// Declare render variables to be cached
let prevCanvasId: string;
let prevDrawingMethod: GraphDrawingMethod;
let prevNoOfDataPoints: number = 400;

// Method to call the drawing method, manipulate the DOM and cache variables
export const callDrawGraph = (
  canvasId: string,
  drawingMethod: GraphDrawingMethod,
  noOfDataPoints: number = prevNoOfDataPoints
) => {
  // DOM: Hide prev canvas if the canvasId has changed
  if (prevCanvasId && canvasId !== prevCanvasId) {
    const prevCanvas = document.getElementById(prevCanvasId);
    prevCanvas.setAttribute("style", "display: none;");
  }

  // DOM: Fetch canvas element
  const canvas: HTMLCanvasElement = document.getElementById(canvasId) as any;

  // DOM: Show canvas
  canvas.setAttribute("style", "display: block;");

  // Draw the graph
  drawGraph(canvas, drawingMethod, noOfDataPoints, values);

  // Cache render variables
  prevNoOfDataPoints = noOfDataPoints;
  prevDrawingMethod = drawingMethod;
  prevCanvasId = canvasId;
};

/**
 *
 * Immediately invoked methods.
 *
 */

// Parse values from JSON file
const values: { dateTime: string; price: number }[] = PRICE_DATA.map(
  (value: { date: string; ["price(USD)"]: number }) => ({
    dateTime: value.date,
    price: value["price(USD)"]
  })
);

// Draw graph and attach handlers to buttons and inputs on Window load
window.onload = () => {
  document.getElementById("render-2d-canvas-button").onclick = () =>
    callDrawGraph("line-graph-2d-canvas", drawGraph2DCanvas);

  document.getElementById("render-webgl-button").onclick = () =>
    callDrawGraph("line-graph-webgl", drawGraphWebGL);

  document.getElementById("data-points-slider").oninput = e => {
    const newNoOfDataPoints = (e.target as HTMLInputElement).value;
    const dataPointsElement = document.getElementById("data-points-preview");
    dataPointsElement.innerText = newNoOfDataPoints.toString();
    callDrawGraph(prevCanvasId, prevDrawingMethod, parseInt(newNoOfDataPoints));
  };

  callDrawGraph("line-graph-2d-canvas", drawGraph2DCanvas, 400);
};
