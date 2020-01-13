import PRICE_DATA from "./allTime.json";
import { positionActiveLegend } from "./Components/Graph/Universal/positionActiveLegend";
import { positionLabels } from "./Components/Graph/Universal/positionLabels";
import { setupValues } from "./Components/Graph/Universal/setupValues";
import { getWebGLInteractivityHandlers } from "./Components/Graph/WebGL/WebGLUtils/eventUtils";

const CANVAS_STYLE = [
  "user-select: none",
  "touch-action: none",
  "display: block",
  "width: 100%",
  "height: 400px"
].join(";");

// Parse values from JSON file
const values: { dateTime: string; price: number }[] = PRICE_DATA.map(value => ({
  dateTime: value.date,
  price: value["price(USD)"]
}));

// Declare render variables
let currentNoOfDataPoints = 400;
let currentDrawingMethod: any;

// Cache cleanup function to be called if graph is re-rendered
let cleanup: () => void;

/* MAIN DRAWING METHOD */
export const drawGraph = (
  noOfDataPoints: number = currentNoOfDataPoints,
  drawingMethod: (args: {
    canvasElement: HTMLCanvasElement;
    points: { x: number; y: number; price: number; dateTime: string }[];
    xGridLines: number[];
    yGridLines: number[];
  }) => () => void = currentDrawingMethod
) => {
  // Fetch canvas element
  let canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];

  // Replace canvas element if drawing method has changed
  if (drawingMethod !== currentDrawingMethod) {
    const newCanvasElement = document.createElement("canvas");
    newCanvasElement.setAttribute("style", CANVAS_STYLE);
    canvas.insertAdjacentElement("afterend", newCanvasElement);
    canvas.remove();
    canvas = newCanvasElement;
  }

  // Update render variables cache
  currentNoOfDataPoints = noOfDataPoints;
  currentDrawingMethod = drawingMethod;

  // Calculate graph coordinates, grid lines and label values
  const {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin
  } = setupValues([...values], currentNoOfDataPoints);

  // Call clean up function if applicable
  if (cleanup) {
    cleanup();
  }

  // Define method to be called on graph interaction
  const onInteraction = (args: {
    activeX?: number;
    activeY?: number;
    isClicked?: boolean;
  }) => {
    positionActiveLegend(canvas, args.activeX, margin, points);
  };

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

  // Attach interactivity event listeners
  window.addEventListener("resize", onResize);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchstart", handleTouchStart);

  // Cache cleanup method to be called before next render
  cleanup = () => {
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchstart", handleTouchStart);
  };
};
