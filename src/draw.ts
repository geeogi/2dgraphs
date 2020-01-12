import PRICE_DATA from "./allTime.json";
import { drawGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { positionActiveLegend } from "./Components/Graph/Universal/positionActiveLegend";
import { positionLabels } from "./Components/Graph/Universal/positionLabels";
import { setupValues } from "./Components/Graph/Universal/setupValues";
import { drawGraphWebGL } from "./Components/Graph/WebGL";

// Parse JSON values
const values: { dateTime: string; price: number }[] = PRICE_DATA.map(value => ({
  dateTime: value.date,
  price: value["price(USD)"]
}));

// Declare render variables
let noOfDataPoints = 400;
let currentGraphType: string = "2dcanvas";

// Cache cleanup function to be called if graph is re-rendered
let cleanup: () => void;

/* MAIN DRAWING METHOD */
export const triggerDraw = (
  newNoOfDataPoints: number = noOfDataPoints,
  graphType: string = currentGraphType
) => {
  // Fetch canvas element
  let canvasElement: HTMLCanvasElement = document.getElementsByTagName(
    "canvas"
  )[0];

  // Replace canvas element if graph type has changed
  if (graphType !== currentGraphType) {
    const newCanvasElement = document.createElement("canvas");
    newCanvasElement.setAttribute(
      "style",
      "user-select: none; touch-action: none; display: block; width: 100%; height: 400px;"
    );
    canvasElement.insertAdjacentElement("afterend", newCanvasElement);
    canvasElement.remove();
    canvasElement = newCanvasElement;
  }

  // Update render variables cache
  currentGraphType = graphType;
  noOfDataPoints = newNoOfDataPoints;

  // Calculate graph coordinates, grid lines and label values
  const {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin
  } = setupValues([...values], newNoOfDataPoints);

  // Call clean up function if applicable
  if (cleanup) {
    cleanup();
  }

  // Decide which drawing method to use
  const draw = graphType === "webgl" ? drawGraphWebGL : drawGraph2DCanvas;

  // Draw the canvas
  cleanup = draw({
    canvasElement,
    points,
    xGridLines,
    yGridLines,
    positionLabels: (canvasElement: HTMLCanvasElement) => {
      positionLabels(
        canvasElement,
        dateLabels,
        priceLabels,
        xGridLines,
        yGridLines,
        margin
      );
    },
    positionActiveLegend: (
      canvasElement: HTMLCanvasElement,
      activeX: number | undefined
    ) => {
      positionActiveLegend(canvasElement, activeX, margin, points);
    }
  });
};
