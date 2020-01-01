import { enableAttribute, initArrayBuffer, initProgram } from "./setupUtils";

export const getDrawAreaMethod = (
  gl: WebGLRenderingContext,
  areaPoints: { x: number; y: number; z: number }[]
) => {
  // Vertex shader source code
  var areaVShader =
    "attribute vec3 aVertex;" +
    "varying mediump float vY;" +
    "void main(void) {" +
    " gl_Position = vec4(aVertex, 1.0);" +
    " vY = gl_Position.y;" +
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
    const { x, y, z = 1 } = point;
    fillAreaVertices.push(x, y, z);
  });

  /*======= Storing the geometry ======*/
  var fillAreaVertices_buffer = initArrayBuffer(gl, fillAreaVertices);

  return () => {
    // Use the combined shader program object
    gl.useProgram(areaProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    enableAttribute(gl, areaProgram, fillAreaVertices_buffer, "aVertex");

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
