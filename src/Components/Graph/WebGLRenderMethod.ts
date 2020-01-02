import { resizeGlCanvas } from "../../WebGL/canvasUtils";
import { getDrawAreaMethod } from "../../WebGL/drawArea";
import { getDrawHorizontalLineMethod } from "../../WebGL/drawLines";
import { getDrawPathMethod } from "../../WebGL/drawPath";
import { getParentDimensions } from "./Utils/domUtils";
import { dateToUnix, getDateLabels, getPriceLabels } from "./Utils/labelUtils";
import { getScaleMethod } from "./Utils/numberUtils";

export const getRenderMethod = (
  averagePrice: number,
  earliestDate: string,
  latestDate: string,
  maxPrice: number,
  minPrice: number,
  values: { dateTime: string; price: number }[],
  gl: WebGLRenderingContext,
  canvasElement: HTMLCanvasElement
) => {
  // Initialize canvas coordinates
  let linePoints: { x: number; y: number }[] = [];
  let areaPoints: { x: number; y: number }[] = [];
  let drawPrimaryPath: any;
  let drawPrimaryArea: any;
  let drawAxesLines: any;

  const calculatePoints = () => {
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

    // Populate coordinates
    values.forEach(value => {
      const x = scaleDateX(value.dateTime);
      const y = scalePriceY(value.price);
      linePoints.push({ x, y });
      areaPoints.push({ x, y });
      areaPoints.push({ x, y: -1 });
    });

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

  calculatePoints();

  return () => {
    // Size the canvas
    const { width, height } = getParentDimensions(canvasElement);
    resizeGlCanvas(gl, width, height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the view port
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);

    // Draw elements
    drawPrimaryPath(width, height);
    drawAxesLines.forEach((method: any) => method(width, height));
    drawPrimaryArea(width, height);
  };
};
