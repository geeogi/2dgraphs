import {
  CANVAS_2D_CANVAS_ID,
  CANVAS_2D_RENDER_BUTTON,
  DATA_POINTS_PREVIEW,
  DATA_POINTS_SLIDER,
  WEB_GL_CANVAS_ID,
  WEB_GL_RENDER_BUTTON
} from "./Config/constants";
import { VALUES } from "./Data/data";
import { initialize2DCanvasGraph } from "./Graph/2dcanvas";
import { initializeWebGLGraph } from "./Graph/webgl";

/**
 *
 * This file manages the DOM and render state.
 * See ./Graph for graph drawing logic.
 *
 */

// Types
type GraphRedrawMethod = {
  canvasId: string;
  rescaleByNumberOfPoints: (noOfPoints: number) => void;
};

// State
let currentCanvasId: string;
let currentNoOfDataPoints: number = 3000;
const redrawMethods: GraphRedrawMethod[] = [];

/**
 * Fetch and show the canvas by ID
 * Hides the previous canvas
 * @param canvasId
 */
export const showCanvasById = (canvasId: string) => {
  // Hide the current canvas
  if (currentCanvasId && canvasId !== currentCanvasId) {
    const currentCanvas = document.getElementById(currentCanvasId);
    currentCanvas.setAttribute("style", "display: none;");
  }

  // Fetch and show canvas element
  const canvas: HTMLCanvasElement = document.getElementById(canvasId) as any;
  canvas.setAttribute("style", "display: block;");

  // Update state
  currentCanvasId = canvasId;

  return canvas;
};

/**
 *
 * Attach event listeners to index.html and initialize the graph on window load
 *
 */
window.onload = () => {
  // Initialize the WebGL graph on page load
  showCanvasById(WEB_GL_CANVAS_ID);
  const canvas = document.getElementById(WEB_GL_CANVAS_ID) as HTMLCanvasElement;
  const rescaleByNumberOfPoints = initializeWebGLGraph(canvas, VALUES);

  // Update state
  currentNoOfDataPoints = VALUES.length;
  redrawMethods.push({ canvasId: WEB_GL_CANVAS_ID, rescaleByNumberOfPoints });

  // Attach button listener (2D Canvas)
  document.getElementById(CANVAS_2D_RENDER_BUTTON).onclick = () => {
    const id = CANVAS_2D_CANVAS_ID;
    const redraw = redrawMethods.find(({ canvasId }) => canvasId === id);
    showCanvasById(id);
    if (redraw) {
      redraw.rescaleByNumberOfPoints(currentNoOfDataPoints);
    } else {
      const canvas: HTMLCanvasElement = document.getElementById(id) as any;
      const rescaleByNumberOfPoints = initialize2DCanvasGraph(canvas, VALUES);
      rescaleByNumberOfPoints(currentNoOfDataPoints);

      // Update state
      currentNoOfDataPoints = currentNoOfDataPoints;
      redrawMethods.push({ canvasId: id, rescaleByNumberOfPoints });
    }
  };

  // Attach button listener (WebGL)
  document.getElementById(WEB_GL_RENDER_BUTTON).onclick = () => {
    const id = WEB_GL_CANVAS_ID;
    const redraw = redrawMethods.find(({ canvasId }) => canvasId === id);
    showCanvasById(id);
    redraw.rescaleByNumberOfPoints(currentNoOfDataPoints);
  };

  // Attach range input listener
  document.getElementById(DATA_POINTS_SLIDER).oninput = e => {
    const newNoOfDataPoints = parseInt((e.target as HTMLInputElement).value);
    const redraw = redrawMethods.find(
      ({ canvasId }) => canvasId === currentCanvasId
    );
    redraw.rescaleByNumberOfPoints(newNoOfDataPoints);

    // Update the state
    currentNoOfDataPoints = newNoOfDataPoints;

    // Update data points label
    const dataPointsPreviewEl = document.getElementById(DATA_POINTS_PREVIEW);
    dataPointsPreviewEl.innerText = newNoOfDataPoints.toString();
  };
};
