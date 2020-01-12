import PRICE_DATA from "./allTime.json";
import { drawGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { positionActiveLegend } from "./Components/Graph/Universal/positionActiveLegend";
import { positionLabels } from "./Components/Graph/Universal/positionLabels";
import { setupValues } from "./Components/Graph/Universal/setupValues";
import { drawGraphWebGL } from "./Components/Graph/WebGL";

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
let currentGraphType: string = "2dcanvas";

// Cache cleanup function to be called if graph is re-rendered
let cleanup: () => void;

/* MAIN DRAWING METHOD */
export const drawGraph = (
  noOfDataPoints: number = currentNoOfDataPoints,
  graphType: string = currentGraphType
) => {
  // Fetch canvas element
  let canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];

  // Replace canvas element if graph type has changed
  if (graphType !== currentGraphType) {
    const newCanvasElement = document.createElement("canvas");
    newCanvasElement.setAttribute("style", CANVAS_STYLE);
    canvas.insertAdjacentElement("afterend", newCanvasElement);
    canvas.remove();
    canvas = newCanvasElement;
  }

  // Update render variables cache
  currentGraphType = graphType;
  currentNoOfDataPoints = noOfDataPoints;

  // Calculate graph coordinates, grid lines and label values
  const {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin
  } = setupValues([...values], noOfDataPoints);

  // Call clean up function if applicable
  if (cleanup) {
    cleanup();
  }

  // Decide which drawing method to use
  const draw = graphType === "webgl" ? drawGraphWebGL : drawGraph2DCanvas;

  // Draw the graph
  cleanup = draw({
    canvasElement: canvas,
    points,
    xGridLines,
    yGridLines,
    onRender: (canvasElement: HTMLCanvasElement) => {
      positionLabels(
        canvasElement,
        dateLabels,
        priceLabels,
        xGridLines,
        yGridLines,
        margin
      );
    },
    onInteraction: (
      canvasElement: HTMLCanvasElement,
      activeX: number | undefined
    ) => {
      positionActiveLegend(canvasElement, activeX, margin, points);
    }
  });
};
