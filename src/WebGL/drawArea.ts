import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawAreaMethod = (
  gl: WebGLRenderingContext,
  areaPoints: { x: number; y: number; z?: number }[]
) => {
  // Vertex shader source code
  var areaVShader =
    "uniform vec2 uResolution;" +
    "uniform float uMarginX;" +
    "uniform float uMarginY;" +
    "attribute vec3 aVertex;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " vY = gl_Position.y;" +
    " float marginX = uMarginX / uResolution.x;" +
    " float marginY = uMarginY / uResolution.y;" +
    " float xPercentage = (gl_Position.x + 1.0) / 2.0;" +
    " float yPercentage = (gl_Position.y + 1.0) / 2.0;" +
    " float availableX = 2.0 - (2.0 * marginX);" +
    " float availableY = 2.0 - (2.0 * marginY);" +
    " gl_Position.x = marginX + xPercentage * availableX - 1.0;" +
    " gl_Position.y = marginY + yPercentage * availableY - 1.0;" +
    "}";

  // Fragment shader source code
  var areaFShader =
    "varying mediump float vY;" +
    "void main(void) {" +
    " gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);" +
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

  return (
    width: number,
    height: number,
    marginX: number = 0,
    marginY: number = 0
  ) => {
    // Use the combined shader program object
    gl.useProgram(areaProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    enableAttribute(gl, areaProgram, fillAreaVertices_buffer, "aVertex");

    // Set screen resolution
    const resolutionParam = gl.getUniformLocation(areaProgram, "uResolution");
    gl.uniform2fv(resolutionParam, [width, height]);

    // Set marginX
    const marginXParam = gl.getUniformLocation(areaProgram, "uMarginX");
    gl.uniform1f(marginXParam, marginX);

    // Set marginY
    const marginYParam = gl.getUniformLocation(areaProgram, "uMarginY");
    gl.uniform1f(marginYParam, marginY);

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
