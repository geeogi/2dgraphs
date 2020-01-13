import { AXIS_COLOR_VEC, PRIMARY_COLOR_VEC } from "../../../Config/colors";
import { getDrawAreaMethod } from "./WebGLUtils/drawUtils/drawArea";
import { getDrawLinesMethod } from "./WebGLUtils/drawUtils/drawLines";
import { getDrawPathMethod } from "./WebGLUtils/drawUtils/drawPath";

export const getWebGLLineGraphRenderMethod = (
  canvasElement: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  xGridLines: number[],
  yGridLines: number[],
  points: {
    x: number;
    y: number;
    price: number;
    dateTime: string;
  }[],
  margin: [number, number]
) => {
  // Initialize canvas coordinates
  const linePoints: { x: number; y: number }[] = [];
  const areaPoints: { x: number; y: number }[] = [];

  // Define primary line and area coordinates
  points.forEach(value => {
    const x = value.x;
    const y = value.y;
    linePoints.push({ x, y });
    areaPoints.push({ x, y });
    areaPoints.push({ x, y: -1 });
  });

  // Define y-axis coordinates
  const yAxis = yGridLines.map(y => [
    { x: -1, y },
    { x: 1, y }
  ]);

  // Define x-axis coordinates
  const xAxis = xGridLines.map(x => [
    { x, y: -1.05 },
    { x, y: -1 }
  ]);

  // Define primary drawing methods
  const drawPrimaryPath = getDrawPathMethod(gl, linePoints, PRIMARY_COLOR_VEC);
  const drawPrimaryArea = getDrawAreaMethod(gl, areaPoints, PRIMARY_COLOR_VEC);
  const drawYAxis = getDrawLinesMethod(gl, yAxis, AXIS_COLOR_VEC, "horizontal");
  const drawXAxis = getDrawLinesMethod(gl, xAxis, AXIS_COLOR_VEC, "vertical");

  /* RETURN WEBGL RENDER FUNCTION */
  return function renderWebGlLineGraph() {
    // Fetch canvas resolution
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];

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
  };
};
