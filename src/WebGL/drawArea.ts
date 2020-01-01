import { bindBuffer, initBuffer, initProgram } from "./setupUtils";

export const getDrawAreaMethod = (
  gl: WebGL2RenderingContext,
  areaPoints: { x: number; y: number; z: number }[]
) => {
  /*=================== Shaders ====================*/

  // Vertex shader source code
  var areaVShader =
    "attribute vec3 vertex;" +
    "varying mediump float y;" +
    "void main(void) {" +
    " gl_Position = vec4(vertex, 1.0);" +
    " y = gl_Position.y;" +
    "}";

  // Fragment shader source code
  var areaFShader =
    "varying mediump float y;" +
    "void main(void) {" +
    " gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);" +
    " gl_FragColor.a = gl_FragColor.a * ((y+1.0)/2.0);" +
    "}";

  const areaProgram = initProgram(gl, areaVShader, areaFShader);

  /*======= Defining the geometry ======*/
  const fillAreaVertices: number[] = [];
  areaPoints.forEach(point => {
    const { x, y, z = 1 } = point;
    fillAreaVertices.push(x, y, z);
  });

  /*======= Storing the geometry ======*/
  var fillAreaVertices_buffer = initBuffer(gl, fillAreaVertices);

  return () => {
    // Use the combined shader program object
    gl.useProgram(areaProgram);

    /*======= Associating shaders to buffer objects: vertex ======*/
    bindBuffer(gl, areaProgram, fillAreaVertices_buffer, "vertex");

    /*============ Drawing the area =============*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, areaPoints.length);
  };
};
