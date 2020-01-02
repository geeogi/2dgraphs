import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawPathMethod = (
  gl: WebGLRenderingContext,
  pathPoints: { x: number; y: number; z?: number }[],
  rgba: string
) => {
  const lineVShader =
    "uniform vec2 uResolution;" +
    "uniform float uMarginX;" +
    "uniform float uMarginY;" +
    "attribute vec3 aVertex;" +
    "attribute vec3 aPrev;" +
    "attribute vec3 aNext;" +
    "attribute vec2 aDirection;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " vec2 AB = normalize(normalize(gl_Position.xy - aPrev.xy) * uResolution);" +
    " vec2 BC = normalize(normalize(aNext.xy - gl_Position.xy) * uResolution);" +
    " vec2 tangent = normalize(AB + BC);" +
    " vec2 miter = vec2(-tangent.y, tangent.x);" +
    " vec2 normalA = vec2(-AB.y, AB.x);" +
    " float miterLength = 1.0 / dot(miter, normalA);" +
    " gl_Position.xy = gl_Position.xy + (aDirection.x * miter * miterLength * 2.0) / uResolution.xy;" +
    " float marginX = uMarginX / uResolution.x;" +
    " float marginY = uMarginY / uResolution.y;" +
    " float xPercentage = (gl_Position.x + 1.0) / 2.0;" +
    " float yPercentage = (gl_Position.y + 1.0) / 2.0;" +
    " float availableX = 2.0 - (2.0 * marginX);" +
    " float availableY = 2.0 - (2.0 * marginY);" +
    " gl_Position.x = marginX + xPercentage * availableX - 1.0;" +
    " gl_Position.y = marginY + yPercentage * availableY - 1.0;" +
    "}";

  const lineFShader = `void main(void) { gl_FragColor = vec4${rgba}; }`;

  // Create a shader program object to store the combined shader program
  const lineProgram = initProgram(gl, lineVShader, lineFShader);

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
    // Direction
    direction.push(1, -1, 1, -1, 1, -1);
  });

  nextVertices.push(0, 0, 0, 0, 0, 0);

  // Upload buffers to GLSL
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const prevVertices_buffer = initArrayBuffer(gl, prevVertices);
  const nextVertices_buffer = initArrayBuffer(gl, nextVertices);
  const direction_buffer = initArrayBuffer(gl, direction);

  return (
    width: number,
    height: number,
    marginX: number = 0,
    marginY: number = 0
  ) => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    // Enable attributes
    enableAttribute(gl, lineProgram, lineVertices_buffer, "aVertex");
    enableAttribute(gl, lineProgram, prevVertices_buffer, "aPrev");
    enableAttribute(gl, lineProgram, nextVertices_buffer, "aNext");
    enableAttribute(gl, lineProgram, direction_buffer, "aDirection");

    // Set screen resolution
    const uniformLocation = gl.getUniformLocation(lineProgram, "uResolution");
    gl.uniform2fv(uniformLocation, [width, height]);

    // Set marginX
    const marginXParam = gl.getUniformLocation(lineProgram, "uMarginX");
    gl.uniform1f(marginXParam, marginX);

    // Set marginY
    const marginYParam = gl.getUniformLocation(lineProgram, "uMarginY");
    gl.uniform1f(marginYParam, marginY);

    // Draw the line
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pathPoints.length * 2);
  };
};
