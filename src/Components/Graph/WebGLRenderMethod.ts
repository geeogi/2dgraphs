import { getDrawAreaMethod } from "../../WebGL/drawArea";
import { getDrawLinesMethod } from "../../WebGL/drawLines";
import { getDrawPathMethod } from "../../WebGL/drawPath";
import { dateToUnix, getDateLabels, getPriceLabels } from "./Utils/labelUtils";
import { getScaleMethod } from "./Utils/numberUtils";

export const getRenderMethod = (
  props: {
    earliestDate: string;
    latestDate: string;
    maxPrice: number;
    minPrice: number;
    values: { dateTime: string; price: number }[];
  },
  gl: WebGLRenderingContext,
  canvasElement: HTMLCanvasElement
) => {
  const { earliestDate, latestDate, maxPrice, minPrice, values } = props;

  // Get x-axis labels
  const xConfig = getDateLabels(earliestDate, latestDate, 4);
  const { dateLabels: xLabels } = xConfig;

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

  // Initialize canvas coordinates
  const linePoints: { x: number; y: number }[] = [];
  const areaPoints: { x: number; y: number }[] = [];

  // Define primary line and area coordinates
  values.forEach(value => {
    const x = scaleDateX(value.dateTime);
    const y = scalePriceY(value.price);
    linePoints.push({ x, y });
    areaPoints.push({ x, y });
    areaPoints.push({ x, y: -1 });
  });

  // Define y-axis coordinates
  const yAxis = yLabels.map(price => [
    { x: -1, y: scalePriceY(price) },
    { x: 1, y: scalePriceY(price) }
  ]);

  // Define x-axis coordinates
  const xAxis = xLabels.map(unix => [
    { x: scaleUnixX(unix / 1000), y: -1.1 },
    { x: scaleUnixX(unix / 1000), y: -1 }
  ]);

  // Define drawing methods
  const drawPrimaryPath = getDrawPathMethod(gl, linePoints, "(0,0,1.0,1)");
  const drawPrimaryArea = getDrawAreaMethod(gl, areaPoints, "(0, 0, 1.0, 0.5)");
  const drawYAxis = getDrawLinesMethod(
    gl,
    yAxis,
    "(0.9,0.9,0.9,1)",
    "horizontal"
  );
  const drawXAxis = getDrawLinesMethod(
    gl,
    xAxis,
    "(0.9,0.9,0.9,1)",
    "vertical"
  );

  return (resolution: [number, number], margin: [number, number]) => {
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);

    // Enable alpha blend
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the view port
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);

    // Convert px to [-1,1] clip space
    const normalizedMargin: [number, number] = [
      1 - margin[0] / resolution[0],
      1 - margin[1] / resolution[1]
    ];

    // Draw the elements
    drawYAxis(resolution, normalizedMargin);
    drawXAxis(resolution, normalizedMargin);
    drawPrimaryArea(resolution, normalizedMargin);
    drawPrimaryPath(resolution, normalizedMargin);
  };
};
