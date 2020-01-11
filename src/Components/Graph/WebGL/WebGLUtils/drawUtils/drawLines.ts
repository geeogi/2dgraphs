import { enableAttribute, initArrayBuffer, initProgram } from "../setupUtils";

let lineProgram: WebGLProgram;
let uResolution: WebGLUniformLocation | null;
let uScale: WebGLUniformLocation | null;
let uTranslation: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawLinesMethod = (
  gl: WebGLRenderingContext,
  lines: { x: number; y: number; z?: number }[][],
  color: number[],
  mode: "horizontal" | "vertical"
) => {
  const lineVShader =
    "uniform vec2 uResolution;" +
    "uniform vec2 uScale;" +
    "uniform vec2 uTranslation;" +
    "attribute vec3 aVertex;" +
    "attribute vec2 aDirection;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.xy = gl_Position.xy + (aDirection.xy * 1.0) / uResolution.xy;" +
    " gl_Position.xy = gl_Position.xy + uTranslation;" +
    " gl_Position.xy = gl_Position.xy * uScale;" +
    "}";

  const lineFShader = `
    precision mediump float;
    uniform vec4 uColor; 
    void main(void) { 
      gl_FragColor = uColor; 
    }`;

  // Setup and cache the program and uniform locations
  if (!lineProgram) {
    // Create a shader program object to store the combined shader program
    lineProgram = initProgram(gl, lineVShader, lineFShader);

    // Fetch uniform locations
    uResolution = gl.getUniformLocation(lineProgram, "uResolution");
    uScale = gl.getUniformLocation(lineProgram, "uScale");
    uTranslation = gl.getUniformLocation(lineProgram, "uTranslation");
    colorUniform = gl.getUniformLocation(lineProgram, "uColor");
  }

  // Calculate geometry
  const lineVertices: number[] = [];
  const direction: number[] = [];

  lines.forEach(line => {
    // aVertex
    lineVertices.push(line[0].x, line[0].y, line[0].z || 0);
    lineVertices.push(line[0].x, line[0].y, line[0].z || 0);
    lineVertices.push(line[1].x, line[1].y, line[1].z || 0);
    lineVertices.push(line[1].x, line[1].y, line[1].z || 0);
    lineVertices.push(line[1].x, line[1].y, line[1].z || 0);
    lineVertices.push(line[0].x, line[0].y, line[0].z || 0);
    // Direction
    if (mode === "horizontal") {
      direction.push(0, -1, 0);
      direction.push(0, 1, 0);
      direction.push(0, -1, 0);
      direction.push(0, 1, 0);
      direction.push(0, -1, 0);
      direction.push(0, 1, 0);
    } else if (mode === "vertical") {
      direction.push(-1, 0, 0);
      direction.push(1, 0, 0);
      direction.push(-1, 0, 0);
      direction.push(1, 0, 0);
      direction.push(-1, 0, 0);
      direction.push(1, 0, 0);
    }
  });

  // Upload buffers to GLSL
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const direction_buffer = initArrayBuffer(gl, direction);

  return (
    resolution: [number, number],
    scale: [number, number] = [1, 1],
    translation: [number, number] = [0, 0]
  ) => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    // Enable attributes
    enableAttribute(gl, lineProgram, lineVertices_buffer, "aVertex");
    enableAttribute(gl, lineProgram, direction_buffer, "aDirection");

    // Enable uniforms
    gl.uniform2fv(uResolution, resolution);
    gl.uniform2fv(uScale, scale);
    gl.uniform2fv(uTranslation, translation);
    gl.uniform4fv(colorUniform, color);

    // Draw the line
    gl.drawArrays(gl.TRIANGLES, 0, lines.length * 6);
  };
};
