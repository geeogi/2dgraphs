import { enableAttribute, initArrayBuffer, initProgram } from "../setupUtils";

let lineProgram: WebGLProgram;
let resolutionUniform: WebGLUniformLocation | null;
let marginResolution: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawPathMethod = (
  gl: WebGLRenderingContext,
  pathPoints: { x: number; y: number; z?: number }[],
  color: number[]
) => {
  const lineVShader =
    "uniform vec2 uResolution;" +
    "uniform vec2 uMargin;" +
    "attribute vec3 aVertex;" +
    "attribute vec3 aPrev;" +
    "attribute vec3 aNext;" +
    "attribute vec2 aDirection;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " vec2 uScreen = uResolution * uMargin;" +
    " vec2 AB = normalize(normalize(gl_Position.xy - aPrev.xy) * uScreen);" +
    " vec2 BC = normalize(normalize(aNext.xy - gl_Position.xy) * uScreen);" +
    " vec2 tangent = normalize(AB + BC);" +
    " vec2 miter = vec2(-tangent.y, tangent.x);" +
    " vec2 normalA = vec2(-AB.y, AB.x);" +
    " float miterLength = min(1.0 / dot(miter, normalA), 5.0);" +
    " gl_Position.xy = gl_Position.xy + (aDirection.x * miter * miterLength * 1.0) / uScreen.xy;" +
    " gl_Position.xy = gl_Position.xy * uMargin;" +
    "}";

  const lineFShader = `
    precision mediump float;
    uniform vec4 uColor; 
    void main(void) { 
      gl_FragColor = uColor; 
    }`;

  // Setup and cache the program and uniform locations
  if (!lineProgram) {
    lineProgram = initProgram(gl, lineVShader, lineFShader);
    resolutionUniform = gl.getUniformLocation(lineProgram, "uResolution");
    marginResolution = gl.getUniformLocation(lineProgram, "uMargin");
    colorUniform = gl.getUniformLocation(lineProgram, "uColor");
  }

  // Calculate geometry
  const lineVertices: number[] = [];
  const prevVertices: number[] = [0, 0, 0, 0, 0, 0];
  const nextVertices: number[] = [];
  const direction: number[] = [];

  pathPoints.forEach((point, index) => {
    const { x, y, z = 0 } = point;
    // aVertex
    lineVertices.push(x, y, z);
    lineVertices.push(x, y, z);
    // Prev
    prevVertices.push(x, y, z);
    prevVertices.push(x, y, z);
    // Next
    if (index > 0) {
      nextVertices.push(x, y, z);
      nextVertices.push(x, y, z);
    }
    // Miter direction
    if (index === 0 || index === pathPoints.length - 1) {
      // First and last points have no miter
      direction.push(0, 0, 0, 0, 0, 0);
    } else {
      direction.push(1, -1, 1, -1, 1, -1);
    }
  });

  nextVertices.push(0, 0, 0, 0, 0, 0);

  // Upload buffers to GLSL
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const prevVertices_buffer = initArrayBuffer(gl, prevVertices);
  const nextVertices_buffer = initArrayBuffer(gl, nextVertices);
  const direction_buffer = initArrayBuffer(gl, direction);

  return (resolution: [number, number], margin: [number, number]) => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    // Enable attributes
    enableAttribute(gl, lineProgram, lineVertices_buffer, "aVertex");
    enableAttribute(gl, lineProgram, prevVertices_buffer, "aPrev");
    enableAttribute(gl, lineProgram, nextVertices_buffer, "aNext");
    enableAttribute(gl, lineProgram, direction_buffer, "aDirection");

    // Enable uniforms
    gl.uniform2fv(resolutionUniform, resolution);
    gl.uniform2fv(marginResolution, margin);
    gl.uniform4fv(colorUniform, color);

    // Draw the line
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pathPoints.length * 2);
  };
};
