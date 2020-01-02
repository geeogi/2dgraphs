import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawHorizontalLinesMethod = (
  gl: WebGLRenderingContext,
  lines: { x: number; y: number; z?: number }[][],
  rgba: string
) => {
  const lineVShader =
    "uniform vec2 uResolution;" +
    "uniform vec2 uMargin;" +
    "attribute vec3 aVertex;" +
    "attribute vec2 aDirection;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.y = gl_Position.y + (aDirection.y * 2.0) / uResolution.y;" +
    " gl_Position.xy = gl_Position.xy * uMargin;" +
    "}";

  const lineFShader = `void main(void) { gl_FragColor = vec4${rgba}; }`;

  // Create a shader program object to store the combined shader program
  const lineProgram = initProgram(gl, lineVShader, lineFShader);

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
    direction.push(1, -1, 1);
    direction.push(-1, 1, -1);
    direction.push(1, -1, 1);
    direction.push(-1, 1, -1);
    direction.push(1, -1, 1);
    direction.push(-1, 1, -1);
  });

  // Upload buffers to GLSL
  const lineVertices_buffer = initArrayBuffer(gl, lineVertices);
  const direction_buffer = initArrayBuffer(gl, direction);

  return (resolution: [number, number], margin: [number, number]) => {
    // Use the combined shader program object
    gl.useProgram(lineProgram);

    // Enable attributes
    enableAttribute(gl, lineProgram, lineVertices_buffer, "aVertex");
    enableAttribute(gl, lineProgram, direction_buffer, "aDirection");

    // Enable uniforms
    const resolutionUniform = gl.getUniformLocation(lineProgram, "uResolution");
    gl.uniform2fv(resolutionUniform, resolution);

    const marginResolution = gl.getUniformLocation(lineProgram, "uMargin");
    gl.uniform2fv(marginResolution, margin);

    // Draw the line
    gl.drawArrays(gl.TRIANGLES, 0, lines.length * 6);
  };
};
