import { enableAttribute, initArrayBuffer, initProgram } from "../setupUtils";

let lineProgram: WebGLProgram;
let resolutionUniform: WebGLUniformLocation | null;
let scaleUniform: WebGLUniformLocation | null;
let translationUniform: WebGLUniformLocation | null;
let colorUniform: WebGLUniformLocation | null;

export const getDrawPathMethod = (
  gl: WebGLRenderingContext,
  pathPoints: { x: number; y: number; z?: number }[],
  color: number[]
) => {
  const lineVShader =
    "uniform vec2 uResolution;" +
    "uniform vec2 uScale;" +
    "uniform vec2 uTranslation;" +
    "attribute vec3 aVertex;" +
    "attribute vec3 aPrev;" +
    "attribute vec3 aNext;" +
    "attribute vec2 aDirection;" +
    "void main(void) {" +
    // Declare variables
    " gl_Position = vec4(aVertex, 1.0);" +
    " float lineWidth = 1.0;" +
    // Determine whether this vertex is at the edge of the screen
    " bool isEdge = aVertex.x == -1.0 || aVertex.x == 1.0;" +
    // Handle resolution and scale
    " vec2 uScreen = uResolution * uScale;" +
    // Calculate miter direction
    " vec2 AB = normalize(normalize(gl_Position.xy - aPrev.xy) * uScreen);" +
    " vec2 BC = normalize(normalize(aNext.xy - gl_Position.xy) * uScreen);" +
    " vec2 tangent = normalize(AB + BC);" +
    " vec2 miter = isEdge ? vec2(0.0, 1.0) : vec2(-tangent.y, tangent.x);" +
    // Calculate miter length (max = 5)
    " vec2 normalA = vec2(-AB.y, AB.x);" +
    " float miterLength = min(1.0 / dot(miter, normalA), 100.0);" +
    // Apply miter
    " gl_Position.xy = gl_Position.xy + (aDirection.x * miter * miterLength * lineWidth) / uScreen.xy;" +
    // Scale and translate
    " gl_Position.xy = gl_Position.xy * uScale;" +
    " gl_Position.xy = gl_Position.xy + uTranslation;" +
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
    scaleUniform = gl.getUniformLocation(lineProgram, "uScale");
    translationUniform = gl.getUniformLocation(lineProgram, "uTranslation");
    colorUniform = gl.getUniformLocation(lineProgram, "uColor");
  }

  // Calculate geometry
  const lineVertices: number[] = [];
  const prevVertices: number[] = [0, 0, 0, 0, 0, 0];
  const nextVertices: number[] = [];
  const direction: number[] = [];

  pathPoints.forEach((point, index) => {
    const { x, y, z = 0 } = point;
    // Vertex
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
    direction.push(1, -1, 1);
    direction.push(-1, 1, -1);
  });

  nextVertices.push(0, 0, 0);
  nextVertices.push(0, 0, 0);

  // Upload buffers to GLSL
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const prevVertices_buffer = initArrayBuffer(gl, prevVertices);
  const nextVertices_buffer = initArrayBuffer(gl, nextVertices);
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
    enableAttribute(gl, lineProgram, prevVertices_buffer, "aPrev");
    enableAttribute(gl, lineProgram, nextVertices_buffer, "aNext");
    enableAttribute(gl, lineProgram, direction_buffer, "aDirection");

    // Enable uniforms
    gl.uniform2fv(resolutionUniform, resolution);
    gl.uniform2fv(scaleUniform, scale);
    gl.uniform2fv(translationUniform, translation);
    gl.uniform4fv(colorUniform, color);

    // Draw the line
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pathPoints.length * 2);
  };
};
