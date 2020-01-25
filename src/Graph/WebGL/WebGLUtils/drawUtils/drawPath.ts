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
  // https://github.com/d3fc/d3fc/blob/9decc02b958db6ec772073493da7bbbbd94407a7/packages/d3fc-webgl/src/shaders/vertexShaderSnippets.js#L148
  const lineVShader = `uniform vec2 uResolution; 
      uniform vec2 uScale; 
      uniform vec2 uTranslation; 
      attribute vec2 aCorner; // defines which vertex in the line join we are considering
      attribute vec2 aCurrent; // Current vertex
      attribute vec2 aNext; // Next vertex
      attribute vec2 aPrev; // Previous vertex
      
    void main(void) {
      vec2 uScreen = uResolution * uScale; // Used to normalize vectors
      gl_Position = vec4(aCurrent.x, aCurrent.y, 0, 1);
      float uLineWidth = 1.0;
      vec4 next = vec4(aNext.x, aNext.y, 0, 0);
      vec4 prev = vec4(aPrev.x, aPrev.y, 0, 0);

      if (all(equal(gl_Position.xy, prev.xy))) {
          prev.xy = gl_Position.xy + normalize(gl_Position.xy - next.xy);
      }
      if (all(equal(gl_Position.xy, next.xy))) {
          next.xy = gl_Position.xy + normalize(gl_Position.xy - prev.xy);
      }

      vec2 A = normalize(normalize(gl_Position.xy - prev.xy) * uScreen);
      vec2 B = normalize(normalize(next.xy - gl_Position.xy) * uScreen);
      vec2 tangent = normalize(A + B);
      vec2 miter = vec2(-tangent.y, tangent.x);
      vec2 normalA = vec2(-A.y, A.x);
      float miterLength = 1.0 / dot(miter, normalA);
      vec2 point = normalize(A - B);

      if (miterLength > 10.0 && sign(aCorner.x * dot(miter, point)) > 0.0) {
          gl_Position.xy = gl_Position.xy - (aCorner.x * aCorner.y * uLineWidth * normalA) / uScreen.xy;
      } else {
          gl_Position.xy = gl_Position.xy + (aCorner.x * miter * uLineWidth * miterLength) / uScreen.xy;
      }

      gl_Position.xy = gl_Position.xy * uScale;
      gl_Position.xy = gl_Position.xy + uTranslation;

    }
      `;

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
  const corner: number[] = [];

  pathPoints.forEach((point, index) => {
    const { x, y, z = 0 } = point;
    // Vertex
    lineVertices.push(x, y, z);
    lineVertices.push(x, y, z);
    lineVertices.push(x, y, z);
    lineVertices.push(x, y, z);
    // Prev
    prevVertices.push(x, y, z);
    prevVertices.push(x, y, z);
    prevVertices.push(x, y, z);
    prevVertices.push(x, y, z);
    // Next
    if (index > 0) {
      nextVertices.push(x, y, z);
      nextVertices.push(x, y, z);
      nextVertices.push(x, y, z);
      nextVertices.push(x, y, z);
    }
    // Miter corner
    corner.push(-1, -1, 0);
    corner.push(1, -1, 0);
    corner.push(-1, 1, 0);
    corner.push(1, 1, 0);
  });

  nextVertices.push(0, 0, 0);
  nextVertices.push(0, 0, 0);
  nextVertices.push(0, 0, 0);
  nextVertices.push(0, 0, 0);

  // Upload buffers to GLSL
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
    enableAttribute(gl, lineProgram, lineVertices_buffer, "aCurrent");
    enableAttribute(gl, lineProgram, prevVertices_buffer, "aPrev");
    enableAttribute(gl, lineProgram, nextVertices_buffer, "aNext");
    enableAttribute(gl, lineProgram, corner_buffer, "aCorner");

    // Enable uniforms
    gl.uniform2fv(resolutionUniform, resolution);
    gl.uniform2fv(scaleUniform, scale);
    gl.uniform2fv(translationUniform, translation);
    gl.uniform4fv(colorUniform, color);

    // Draw the line
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pathPoints.length * 4);
  };
};
