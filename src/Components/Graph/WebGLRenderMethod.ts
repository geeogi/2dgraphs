import { resizeGlCanvas } from "../../WebGL/canvasUtils";
import { getDrawAreaMethod } from "../../WebGL/drawArea";
import { getDrawHorizontalLineMethod } from "../../WebGL/drawLines";
import { getDrawPathMethod } from "../../WebGL/drawPath";
import { getParentDimensions } from "./Utils/domUtils";
import { dateToUnix, getDateLabels, getPriceLabels } from "./Utils/labelUtils";
import { getScaleMethod } from "./Utils/numberUtils";

// Margin helpers
const withMargin = (totalPx: number, marginPx: number, value: number) => {
  const totalPercentage = (value + 1) / 2;
  const margin = (marginPx / totalPx) * 2;
  const available = 2 - 2 * margin;
  return margin + totalPercentage * available - 1;
};

export const getRenderMethod = (
  props: {
    averagePrice: number;
    earliestDate: string;
    latestDate: string;
    maxPrice: number;
    minPrice: number;
    values: { dateTime: string; price: number }[];
  },
  gl: WebGLRenderingContext,
  canvasElement: HTMLCanvasElement
) => {
  const {
    averagePrice,
    earliestDate,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

  // Get x-axis labels
  const xConfig = getDateLabels(earliestDate, latestDate, 4);
  const { dateLabels: xLabels, displayFormat: xDisplayFormat } = xConfig;

  // Get y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels: yLabels } = yConfig;

  // Get x-axis scale helpers
  const unixMin = dateToUnix(earliestDate);
  const unixMax = dateToUnix(latestDate);
  const scaleUnixX = getScaleMethod(unixMin, unixMax, -1, 1);
  const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

  // Get y-axis scale helpers
  const scalePriceY = getScaleMethod(yLabels[0], maxPrice, -1, 1);

  // Cache width, height
  let initialWidth: number;
  let initialHeight: number;

  // Cache drawing methods
  let drawPrimaryPath: (width: number, height: number) => void;
  let drawPrimaryArea: (width: number, height: number) => void;
  let drawAxesLines: ((width: number, height: number) => void)[];

  const initializeDrawingMethods = (width: number, height: number) => {
    // Initialize canvas coordinates
    const linePoints: { x: number; y: number }[] = [];
    const areaPoints: { x: number; y: number }[] = [];

    // Populate coordinates
    values.forEach(value => {
      const x = withMargin(width, 150, scaleDateX(value.dateTime));
      const y = withMargin(height, 100, scalePriceY(value.price));
      linePoints.push({ x, y });
      areaPoints.push({ x, y });
      areaPoints.push({ x, y: withMargin(height, 100, -1) });
    });

    // Initialize drawing methods
    drawPrimaryPath = getDrawPathMethod(gl, linePoints, "(0,0,1.0,1)");
    drawPrimaryArea = getDrawAreaMethod(gl, areaPoints);
    drawAxesLines = yLabels.map(label =>
      getDrawHorizontalLineMethod(
        gl,
        [
          { x: -0.8, y: scalePriceY(label) },
          { x: 0.8, y: scalePriceY(label) }
        ],
        "(0,0,0,0.2)"
      )
    );
  };
  
  initializeDrawingMethods(1000, 400);

  return () => {
    // Fetch the canvas size
    const { width, height } = getParentDimensions(canvasElement);

    // Initialize or re-initialize drawing setup if necessary
    if (
      !initialWidth ||
      initialWidth !== width ||
      !initialHeight ||
      initialHeight !== height
    ) {
      resizeGlCanvas(gl, width, height);
      initializeDrawingMethods(width, height);
      console.log("initializing");
    }

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the view port
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);

    // Draw the elements
    drawPrimaryPath(width, height);
    drawAxesLines.forEach(f => f(width, height));
    drawPrimaryArea(width, height);
  };
};
