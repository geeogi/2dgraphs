import { VALUES } from "./Data/data";
import { initializeGraph } from "./Graph";
import { drawGraph2DCanvas } from "./Graph/2DCanvas/index";
import { drawGraphWebGL } from "./Graph/WebGL/index";
import { GraphInitializeMethod } from "./types";

/**
 *
 * This file manages the DOM and render state.
 * See ./Graph for graph drawing logic.
 *
 */

// State
let currentCanvasId: string;
let currentNoOfDataPoints: number = 3000;
const redrawMethods: {
  canvasId: string;
  onRescale: (noOfPoints: number) => void;
}[] = [];

/**
 * Fetch and show the canvas by ID
 * Hides the previous canvas
 * @param canvasId
 */
export const showCanvasById = (canvasId: string) => {
  // DOM: Hide current canvas if the canvasId has changed
  if (currentCanvasId && canvasId !== currentCanvasId) {
    const currentCanvas = document.getElementById(currentCanvasId);
    currentCanvas.setAttribute("style", "display: none;");
  }

  // DOM: Fetch and show canvas element
  const canvas: HTMLCanvasElement = document.getElementById(canvasId) as any;
  canvas.setAttribute("style", "display: block;");

  // Update state
  currentCanvasId = canvasId;

  return canvas;
};

/**
 * Calls the graph initialize method
 * Updates canvas visibility
 * Updates render variable cache
 * @param canvasId
 * @param drawingMethod
 * @param noOfDataPoints
 */
export const setupGraph = (
  canvasId: string,
  drawingMethod: GraphInitializeMethod,
  noOfDataPoints: number = currentNoOfDataPoints
) => {
  const canvas: HTMLCanvasElement = document.getElementById(canvasId) as any;

  // Initialize the graph
  const { onRescale } = initializeGraph(canvas, drawingMethod, VALUES);

  // Update state
  currentNoOfDataPoints = noOfDataPoints;
  redrawMethods.push({ canvasId, onRescale });

  return onRescale;
};

/**
 *
 * Attach event listeners to index.html and initialize the graph on window load
 *
 */
window.onload = () => {
  // Initialize the WebGL graph on page load
  showCanvasById("line-graph-webgl");
  setupGraph("line-graph-webgl", drawGraphWebGL, VALUES.length);

  // Attach button listener
  document.getElementById("render-2d-canvas-button").onclick = () => {
    const id = "line-graph-2d-canvas";
    const redraw = redrawMethods.find(({ canvasId }) => canvasId === id);
    showCanvasById(id);
    if (redraw) {
      redraw.onRescale(currentNoOfDataPoints);
    } else {
      setupGraph(id, drawGraph2DCanvas)(currentNoOfDataPoints);
    }
  };

  // Attach button listener
  document.getElementById("render-webgl-button").onclick = () => {
    const id = "line-graph-webgl";
    const redraw = redrawMethods.find(({ canvasId }) => canvasId === id);
    showCanvasById(id);
    if (redraw) {
      redraw.onRescale(currentNoOfDataPoints);
    } else {
      setupGraph(id, drawGraph2DCanvas);
    }
  };

  // Attach range input listener
  document.getElementById("data-points-slider").oninput = e => {
    const newNoOfDataPoints = parseInt((e.target as HTMLInputElement).value);

    // Rescale graph
    const redraw = redrawMethods.find(
      ({ canvasId }) => canvasId === currentCanvasId
    );
    redraw.onRescale(newNoOfDataPoints);

    // Update the cache
    currentNoOfDataPoints = newNoOfDataPoints;

    // Update data points label
    const dataPointsPreviewEl = document.getElementById("data-points-preview");
    dataPointsPreviewEl.innerText = newNoOfDataPoints.toString();
  };
};
