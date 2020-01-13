import PRICE_DATA from "./src/example.json";
import { drawGraph2DCanvas } from "./src/Graph/2DCanvas/index";
import { getGraphConfig } from "./src/Graph/Universal/getGraphConfig";
import { positionActiveLegend } from "./src/Graph/Universal/positionActiveLegend";
import { positionLabels } from "./src/Graph/Universal/positionLabels";
import { drawGraphWebGL } from "./src/Graph/WebGL/index";
import { getWebGLInteractivityHandlers } from "./src/Graph/WebGL/WebGLUtils/eventUtils";

console.log(drawGraphWebGL, drawGraph2DCanvas);

// Parse values from JSON file
const values: { dateTime: string; price: number }[] = PRICE_DATA.map(value => ({
  dateTime: value.date,
  price: value["price(USD)"]
}));

// Render variable cache
let previousCanvasId: string;
let previousDrawingMethod: (args: {
  canvasElement: HTMLCanvasElement;
  points: { x: number; y: number; price: number; dateTime: string }[];
  xGridLines: number[];
  yGridLines: number[];
}) => () => void;
let previousNoOfDataPoints: number = 400;

// Cache cleanup function to be called if graph is re-rendered
let cleanup: () => void;

export const drawGraph = (
  canvasId: string,
  drawingMethod: (args: {
    canvasElement: HTMLCanvasElement;
    points: { x: number; y: number; price: number; dateTime: string }[];
    xGridLines: number[];
    yGridLines: number[];
  }) => () => void,
  noOfDataPoints: number = previousNoOfDataPoints
) => {
  // Hide previous canvas if the canvasId has changed
  if (canvasId !== previousCanvasId) {
    const previousCanvas = document.getElementById(previousCanvasId);
    if (previousCanvas) {
      previousCanvas.setAttribute("style", "display: none;");
    }
  }

  // Fetch canvas element
  const canvas: HTMLCanvasElement = document.getElementById(canvasId) as any;

  // Show canvas
  canvas.setAttribute("style", "display: block;");

  // Get graph configuration
  const {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin
  } = getGraphConfig([...values], noOfDataPoints);

  // Call clean up function if applicable
  if (cleanup) {
    cleanup();
  }

  // Define method to be called on graph interaction
  const onInteraction = (args: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => positionActiveLegend(canvas, args.activeX, margin, points);

  // Draw the graph
  const onGraphResize = drawingMethod({
    canvasElement: canvas,
    points,
    xGridLines,
    yGridLines
  });

  // Position graph labels
  positionLabels(
    canvas,
    dateLabels,
    priceLabels,
    xGridLines,
    yGridLines,
    margin
  );

  // Clear interactive legend
  onInteraction({});

  // Fetch interactivity event listeners
  const {
    handleMouseDown,
    handleMouseMove,
    handleTouchMove,
    handleTouchStart
  } = getWebGLInteractivityHandlers(onInteraction);

  // Define resize handler
  const onResize = () => {
    onInteraction({});
    onGraphResize();
    positionLabels(
      canvas,
      dateLabels,
      priceLabels,
      xGridLines,
      yGridLines,
      margin
    );
  };

  // Attach event listeners
  window.addEventListener("resize", onResize);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchstart", handleTouchStart);

  // Remove event listeners during cleanup
  cleanup = () => {
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchstart", handleTouchStart);
  };

  // Cache render variables
  previousNoOfDataPoints = noOfDataPoints;
  previousDrawingMethod = drawingMethod;
  previousCanvasId = canvasId;
};

// Method to update data points and re-render graph
export const updateDataPoints = (newNoOfDataPoints: number) => {
  const dataPointsEl = document.getElementById("data-points-preview");
  if (dataPointsEl) {
    dataPointsEl.innerText = newNoOfDataPoints.toString();
  }
  drawGraph(previousCanvasId, previousDrawingMethod, newNoOfDataPoints);
};
