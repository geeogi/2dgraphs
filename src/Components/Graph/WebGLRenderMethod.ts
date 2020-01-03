import { resizeGlCanvas } from "../../WebGL/canvasUtils";
import { getDrawAreaMethod } from "../../WebGL/drawArea";
import { getDrawLinesMethod } from "../../WebGL/drawLines";
import { getDrawPathMethod } from "../../WebGL/drawPath";

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
  canvasElement: HTMLCanvasElement,
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
    { x: scaleUnixX(unix / 1000), y: -1.1 },
    { x: scaleUnixX(unix / 1000), y: -1 }
  ]);

  // Define active axis coordinates
  const activeYAxis = [
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  const activeXAxis = [
    { x: 1, y: 0 },
    { x: -1, y: 0 }
  ];

  // Define drawing methods
  const grey = "(0.9,0.9,0.9,1)";
  const blue = "(0,0,1.0,1)";
  const drawPrimaryPath = getDrawPathMethod(gl, linePoints, blue);
  const drawPrimaryArea = getDrawAreaMethod(gl, areaPoints, blue);
  const drawYAxis = getDrawLinesMethod(gl, yAxis, grey, "horizontal");
  const drawXAxis = getDrawLinesMethod(gl, xAxis, grey, "vertical");

  const drawYActiveAxis = getDrawLinesMethod(
    gl,
    [activeYAxis],
    grey,
    "vertical"
  );
  const drawXActiveAxis = getDrawLinesMethod(
    gl,
    [activeXAxis],
    grey,
    "horizontal"
  );

  return (resolution: [number, number], activeX?: number, activeY?: number) => {
    // Resize canvas
    resizeGlCanvas(gl);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);

    // Enable alpha blend
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the view port
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);

    // Convert px margin to [-1,1] clip space scale
    const scale: [number, number] = [
      1 - margin[0] / resolution[0],
      1 - margin[1] / resolution[1]
    ];

    // Draw the elements
    drawYAxis(resolution, scale);
    drawXAxis(resolution, scale);
    drawPrimaryArea(resolution, scale);
    drawPrimaryPath(resolution, scale);

    // Draw the active elements
    if (activeX && activeY) {
      // Calculate active translation
      const xTranslation = (2 * activeX) / resolution[0] - 1;
      const yTranslation = (2 * (resolution[1] - activeY)) / resolution[1] - 1;

      drawYActiveAxis(resolution, scale, [xTranslation, 0]);
      drawXActiveAxis(resolution, scale, [0, yTranslation]);
    }
  };
};
