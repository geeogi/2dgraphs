import PRICE_DATA from "./allTime.json";
import { getGraphConfig } from "./Components/Graph/Universal/getGraphConfig";
import { positionActiveLegend } from "./Components/Graph/Universal/positionActiveLegend";
import { positionLabels } from "./Components/Graph/Universal/positionLabels";
import { getWebGLInteractivityHandlers } from "./Components/Graph/WebGL/WebGLUtils/eventUtils";

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

export const setDataPoints = (noOfDataPoints: number) => {
  drawGraph(previousCanvasId, previousDrawingMethod, noOfDataPoints);
};
