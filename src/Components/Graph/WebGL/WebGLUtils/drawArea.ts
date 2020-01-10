import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawAreaMethod = (
  gl: WebGLRenderingContext,
  areaPoints: { x: number; y: number; z?: number }[],
  color: number[]
) => {
  // Vertex shader source code
  var areaVShader =
    "uniform vec2 uMargin;" +
    "attribute vec3 aVertex;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " gl_Position.xy = gl_Position.xy * uMargin;" +
    " vY = gl_Position.y;" +
    "}";

  // Fragment shader source code
  var areaFShader =
    "precision mediump float;" +
    "uniform vec4 uColor;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    ` gl_FragColor = uColor;` +
    " gl_FragColor.a = gl_FragColor.a * ((vY+1.0)/2.0);" +
    "}";

  const areaProgram = initProgram(gl, areaVShader, areaFShader);

  /*======= Defining the geometry ======*/
  const fillAreaVertices: number[] = [];
  areaPoints.forEach(point => {
    const { x, y, z = 0 } = point;
    fillAreaVertices.push(x, y, z);
  });

  /*======= Storing the geometry ======*/
  var fillAreaVertices_buffer = initArrayBuffer(gl, fillAreaVertices);

  return (resolution: [number, number], margin: [number, number]) => {
    // Use the combined shader program object
    gl.useProgram(areaProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    enableAttribute(gl, areaProgram, fillAreaVertices_buffer, "aVertex");

    // Enable uniforms
    const marginResolution = gl.getUniformLocation(areaProgram, "uMargin");
    gl.uniform2fv(marginResolution, margin);

    const colorUniform = gl.getUniformLocation(areaProgram, "uColor");
    gl.uniform4fv(colorUniform, color);

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
