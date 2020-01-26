import { enable2DAttribute, initArrayBuffer, initProgram } from "../setupUtils";
import { LINE_FRAGMENT_SHADER } from "./shaders/fragment/line";
import { LINE_VERTEX_SHADER } from "./shaders/vertex/line";

let lineProgram: WebGLProgram;
let resolutionUniform: WebGLUniformLocation | null;
let scaleUniform: WebGLUniformLocation | null;
let translationUniform: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawLineMethod = (
  gl: WebGLRenderingContext,
  pathPoints: { x: number; y: number; z?: number }[],
  color: number[]
) => {
  // Setup and cache the program and uniform locations
  if (!lineProgram) {
    lineProgram = initProgram(gl, LINE_VERTEX_SHADER, LINE_FRAGMENT_SHADER);
    resolutionUniform = gl.getUniformLocation(lineProgram, "uResolution");
    scaleUniform = gl.getUniformLocation(lineProgram, "uScale");
    translationUniform = gl.getUniformLocation(lineProgram, "uTranslation");
    colorUniform = gl.getUniformLocation(lineProgram, "uColor");
  }

  /*======= Defining the geometry ======*/
  const lineVertices: number[] = [];
  const prevVertices: number[] = [];
  const nextVertices: number[] = [];
  const corner: number[] = [];

  // Push empty vertices into the start of the Prev array
  prevVertices.push(0, 0);
  prevVertices.push(0, 0);
  prevVertices.push(0, 0);
  prevVertices.push(0, 0);

  // Define 4 vertices for each point (required by line shader)
  pathPoints.forEach((point, index) => {
    const { x, y } = point;
    // Vertex
    lineVertices.push(x, y);
    lineVertices.push(x, y);
    lineVertices.push(x, y);
    lineVertices.push(x, y);
    // Prev
    prevVertices.push(x, y);
    prevVertices.push(x, y);
    prevVertices.push(x, y);
    prevVertices.push(x, y);
    // Next
    if (index > 0) {
      nextVertices.push(x, y);
      nextVertices.push(x, y);
      nextVertices.push(x, y);
      nextVertices.push(x, y);
    }
    // Miter corner
    corner.push(-1, -1);
    corner.push(1, -1);
    corner.push(-1, 1);
    corner.push(1, 1);
  });

  // Push empty vertices into the end of the Next array
  nextVertices.push(0, 0);
  nextVertices.push(0, 0);
  nextVertices.push(0, 0);
  nextVertices.push(0, 0);

  /*======= Storing the geometry ======*/
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const prevVertices_buffer = initArrayBuffer(gl, prevVertices);
  const nextVertices_buffer = initArrayBuffer(gl, nextVertices);
  const corner_buffer = initArrayBuffer(gl, corner);

  return (
    resolution: [number, number],
    scale: [number, number] = [1, 1],
    translation: [number, number] = [0, 0]
  ) => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    // Enable attributes
    enable2DAttribute(gl, lineProgram, lineVertices_buffer, "aCurrent");
    enable2DAttribute(gl, lineProgram, prevVertices_buffer, "aPrev");
    enable2DAttribute(gl, lineProgram, nextVertices_buffer, "aNext");
    enable2DAttribute(gl, lineProgram, corner_buffer, "aCorner");

    // Enable uniforms
    gl.uniform2fv(resolutionUniform, resolution);
    gl.uniform2fv(scaleUniform, scale);
    gl.uniform2fv(translationUniform, translation);
    gl.uniform4fv(colorUniform, color);

    // Draw the line
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pathPoints.length * 4);
  };
};
