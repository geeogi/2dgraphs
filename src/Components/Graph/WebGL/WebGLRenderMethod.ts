import {
  ACTIVE_HANDLE_BODY_VEC,
  ACTIVE_HANDLE_BORDER_VEC,
  ACTIVE_LINE_VEC,
  AXIS_COLOR_VEC,
  PRIMARY_COLOR_VEC
} from "../../../Config/colors";
import { resizeGlCanvas } from "./WebGLUtils/canvasUtils";
import { getDrawAreaMethod } from "./WebGLUtils/drawUtils/drawArea";
import { getDrawLinesMethod } from "./WebGLUtils/drawUtils/drawLines";
import { getDrawPathMethod } from "./WebGLUtils/drawUtils/drawPath";
import { getDrawCircleMethod } from "./WebGLUtils/drawUtils/drawPoint";

export const getRenderMethod = (
  props: {
    points: {
      x: number;
      y: number;
      price: number;
      dateTime: string;
    }[];
    xGridLines: number[];
    yGridLines: number[];
  },
  gl: WebGLRenderingContext,
  margin: [number, number]
) => {
  // Extract static render props
  const { points, xGridLines, yGridLines } = props;

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

  // Define active axis coordinates
  const activeYAxis = [
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  // Define active circle coordinates
  const activeCircle = { x: 0, y: 0, r: 1 };

  // Define primary drawing methods
  const drawPrimaryPath = getDrawPathMethod(gl, linePoints, PRIMARY_COLOR_VEC);
  const drawPrimaryArea = getDrawAreaMethod(gl, areaPoints, PRIMARY_COLOR_VEC);
  const drawYAxis = getDrawLinesMethod(gl, yAxis, AXIS_COLOR_VEC, "horizontal");
  const drawXAxis = getDrawLinesMethod(gl, xAxis, AXIS_COLOR_VEC, "vertical");

  // Define active drawing methods
  const drawYActiveAxis = getDrawLinesMethod(
    gl,
    [activeYAxis],
    ACTIVE_LINE_VEC,
    "vertical"
  );
  const drawActiveCircle = getDrawCircleMethod(
    gl,
    activeCircle,
    ACTIVE_HANDLE_BODY_VEC,
    ACTIVE_HANDLE_BORDER_VEC
  );

  /* RETURN WEBGL RENDER FUNCTION */
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

    // Draw the active elements if applicable
    if (typeof activeX === "number") {
      // Fetch nearest point to active coordinates
      const [{ x, y }] = linePoints.sort((a, b) => {
        return Math.abs(a.x - activeX) - Math.abs(b.x - activeX);
      });

      // Draw the active elements
      drawYActiveAxis(resolution, scale, [x, 0]);
      drawActiveCircle(resolution, scale, [x, y]);
    }
  };
};
