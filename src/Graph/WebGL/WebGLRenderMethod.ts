import { GraphPoints } from "./../../types";
import { PRIMARY_COLOR_WEBGL } from "../../Config/colors";
import { getDrawAreaMethod } from "./WebGLUtils/drawUtils/drawArea";
import { getDrawLineMethod } from "./WebGLUtils/drawUtils/drawLine";

export const getWebGLLineGraphRenderMethod = (
  canvasElement: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  points: GraphPoints
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

  // Define primary drawing methods
  const drawPrimaryPath = getDrawLineMethod(
    gl,
    linePoints,
    PRIMARY_COLOR_WEBGL
  );
  const drawPrimaryArea = getDrawAreaMethod(
    gl,
    areaPoints,
    PRIMARY_COLOR_WEBGL
  );

  /* RETURN WEBGL RENDER FUNCTION */
  return function renderWebGlLineGraph(
    scale: [number, number] = [1, 1],
    translation: [number, number] = [0, 0]
  ) {
    // Fetch canvas resolution
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];

    // Set canvas clear color
    gl.clearColor(0, 0, 0, 0);

    // Enable alpha blend
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the elements
    drawPrimaryArea(resolution, scale, translation);
    drawPrimaryPath(resolution, scale, translation);
  };
};
