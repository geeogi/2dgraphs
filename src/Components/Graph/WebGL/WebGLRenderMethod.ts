import {
  BORDER_COLOR_GL,
  PRIMARY_COLOR_GL,
  SECONDARY_COLOR_GL
} from "../../../Config/colors";
import { resizeGlCanvas } from "./WebGLUtils/canvasUtils";
import { getDrawAreaMethod } from "./WebGLUtils/drawArea";
import { getDrawLinesMethod } from "./WebGLUtils/drawLines";
import { getDrawPathMethod } from "./WebGLUtils/drawPath";
import { getDrawCircleMethod } from "./WebGLUtils/drawPoint";

export const getRenderMethod = (
  props: {
    scaleDateX: (date: string) => number;
    scalePriceY: (price: number) => number;
    scaleUnixX: (dateToUnix: number) => number;
    values: { dateTime: string; price: number }[];
    xLabels: number[];
    yLabels: number[];
  },
  gl: WebGLRenderingContext,
  margin: [number, number]
) => {
  const {
    scaleDateX,
    scalePriceY,
    scaleUnixX,
    values,
    xLabels,
    yLabels
  } = props;

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
    { x: scaleUnixX(unix / 1000), y: -1.05 },
    { x: scaleUnixX(unix / 1000), y: -1 }
  ]);

  // Define active axis coordinates
  const activeYAxis = [
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  // Define primary drawing methods
  const drawPrimaryPath = getDrawPathMethod(gl, linePoints, PRIMARY_COLOR_GL);
  const drawPrimaryArea = getDrawAreaMethod(gl, areaPoints, PRIMARY_COLOR_GL);
  const drawYAxis = getDrawLinesMethod(
    gl,
    yAxis,
    BORDER_COLOR_GL,
    "horizontal"
  );
  const drawXAxis = getDrawLinesMethod(gl, xAxis, BORDER_COLOR_GL, "vertical");

  // Define active drawing methods
  const drawYActiveAxis = getDrawLinesMethod(
    gl,
    [activeYAxis],
    SECONDARY_COLOR_GL,
    "vertical"
  );
  const drawActiveCircle = getDrawCircleMethod(
    gl,
    { x: 0, y: 0, r: 1 },
    [0, 0, 1, 1],
    [1, 1, 1, 1]
  );

  /* WEBGL RENDER FUNCTION */
  return (resolution: [number, number], activeX?: number, activeY?: number) => {
    // Resize canvas if necessary
    resizeGlCanvas(gl);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);

    // Enable alpha blend
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Convert px margin to [-1,1] clip space scale
    const scale: [number, number] = [
      1 - (2 * margin[0]) / resolution[0],
      1 - (2 * margin[1]) / resolution[1]
    ];

    // Draw the elements
    drawYAxis(resolution, scale);
    drawXAxis(resolution, scale);
    drawPrimaryArea(resolution, scale);
    drawPrimaryPath(resolution, scale);

    // Draw the active elements
    if (activeX) {
      // Convert px to [-1,1] clip space
      const clipSpaceX = (2 * activeX) / resolution[0] - 1;

      // Fetch nearest point to active coordinates
      const [{ x, y }] = linePoints.sort((a, b) => {
        return Math.abs(a.x - clipSpaceX) - Math.abs(b.x - clipSpaceX);
      });

      // Draw the active elements
      drawYActiveAxis(resolution, scale, [x, 0]);
      drawActiveCircle(resolution, scale, [x, y]);
    }
  };
};
