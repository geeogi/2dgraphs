import { enable2DAttribute, initArrayBuffer, initProgram } from "../setupUtils";
import { LINE_FRAGMENT_SHADER } from "./shaders/fragment/point";
import { POINT_VERTEX_SHADER } from "./shaders/vertex/point";

let pointProgram: WebGLProgram;
let uColor: WebGLUniformLocation | null;
let uEdgeColor: WebGLUniformLocation | null;
let uScale: WebGLUniformLocation | null;
let uTranslation: WebGLUniformLocation | null;
let uEdgeSize: WebGLUniformLocation | null;
let uSize: WebGLUniformLocation | null;

export const getDrawCircleMethod = (
  gl: WebGLRenderingContext,
  circle: { x: number; y: number; r: number },
  color: number[],
  edgeColor: number[]
) => {
  // Setup and cache the program and uniform locations
  if (!pointProgram) {
    pointProgram = initProgram(gl, POINT_VERTEX_SHADER, LINE_FRAGMENT_SHADER);
    uColor = gl.getUniformLocation(pointProgram, "uColor");
    uEdgeColor = gl.getUniformLocation(pointProgram, "uEdgeColor");
    uScale = gl.getUniformLocation(pointProgram, "uScale");
    uTranslation = gl.getUniformLocation(pointProgram, "uTranslation");
    uEdgeSize = gl.getUniformLocation(pointProgram, "uEdgeSize");
    uSize = gl.getUniformLocation(pointProgram, "uSize");
  }

  // Upload buffers
  const point_buffer = initArrayBuffer(gl, [circle.x, circle.y]);

  return (
    resolution: [number, number],
    scale: [number, number] = [1, 1],
    translation: [number, number] = [0, 0]
  ) => {
    // Use the combined shader program object
    gl.useProgram(pointProgram);

    // Enable attributes
    enable2DAttribute(gl, pointProgram, point_buffer, "aVertex");

    // Enable uniforms
    gl.uniform4fv(uColor, color);
    gl.uniform4fv(uEdgeColor, edgeColor);
    gl.uniform2fv(uScale, scale);
    gl.uniform2fv(uTranslation, translation);
    gl.uniform1f(uEdgeSize, 2);
    gl.uniform1f(uSize, 25);

    // Draw the line
    gl.drawArrays(gl.POINTS, 0, 1);
  };
};
