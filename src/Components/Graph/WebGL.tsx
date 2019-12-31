import React, { useEffect, useRef } from "react";
import { initProgram, initBuffer, bindBuffer } from "../../WebGL/utils";

export const WebGL = (props: {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  const canvasElementRef = useRef();

  const {
    averagePrice,
    earliestDate,
    latestDate,
    maxPrice,
    minPrice,
    values
  } = props;

  useEffect(() => {
    /*======= Creating a canvas =========*/

    var canvas: any = canvasElementRef.current;
    if (canvas) {
      var gl = (canvas as any).getContext("webgl");

      var desiredCSSWidth = 1000;
      var desiredCSSHeight = 400;
      var devicePixelRatio = 2;

      canvas.width = desiredCSSWidth * devicePixelRatio;
      canvas.height = desiredCSSHeight * devicePixelRatio;

      canvas.style.width = desiredCSSWidth + "px";
      canvas.style.height = desiredCSSHeight + "px";

      /*=================== LINE ====================*/
      /*=================== LINE ====================*/
      /*=================== LINE ====================*/

      /*=================== Shaders ====================*/

      // Vertex shader source code
      var lineVShader =
        "attribute vec3 vertex;" +
        "attribute vec3 prev;" +
        "attribute vec3 next;" +
        "attribute vec2 offsetDirection;" +
        "void main(void) {" +
        " gl_Position = vec4(vertex, 1.0);" +
        " vec2 uScreen = vec2(1000.0,400.0);" +
        "vec2 AB = normalize(normalize(gl_Position.xy - prev.xy) * uScreen);" +
        "vec2 BC = normalize(normalize(next.xy - gl_Position.xy) * uScreen);" +
        "vec2 tangent = normalize(AB + BC);" +
        "vec2 miter = vec2(-tangent.y, tangent.x);" +
        "vec2 normalA = vec2(-AB.y, AB.x);" +
        "float miterLength = 1.0 / dot(miter, normalA);" +
        "gl_Position.xy = gl_Position.xy + (offsetDirection.x * miter * miterLength * 2.0) / uScreen.xy;" +
        "}";

      var lineFShader =
        "void main(void) {" + "gl_FragColor = vec4(1, 0, 1.0, 1);" + "}";

      // Create a shader program object to store the combined shader program
      const lineProgram = initProgram(gl, lineVShader, lineFShader);

      // Use the combined shader program object
      gl.useProgram(lineProgram);

      /*======= Defining the geometry ======*/

      const lineVertices: number[] = [];
      const prevLineVertices: number[] = [0, 0, 0, 0, 0, 0];
      const nextLineVertices: number[] = [];
      const offsetDirection: number[] = [];

      values.forEach((value, index) => {
        const x = (index / values.length) * 2 - 1;
        const y = (value.price / maxPrice) * 2 - 1;
        const z = 0.5;
        // Vertex
        lineVertices.push(x, y, z);
        lineVertices.push(x, y, z);
        // Prev
        prevLineVertices.push(x, y, z);
        prevLineVertices.push(x, y, z);
        // Next
        if (index > 0) {
          nextLineVertices.push(x, y, z);
          nextLineVertices.push(x, y, z);
        }
        // Offset direction
        offsetDirection.push(1, -1, 1, -1, 1, -1);
      });

      nextLineVertices.push(0, 0, 0, 0, 0, 0);

      /*======= Storing the geometry: vertex ======*/
      var lineVertices_buffer = initBuffer(gl, lineVertices);

      /*======= Storing the geometry: prev ======*/
      var prevLineVertices_buffer = initBuffer(gl, prevLineVertices);

      /*======= Storing the geometry: next ======*/
      var nextLineVertices_buffer = initBuffer(gl, nextLineVertices);

      /*======= Storing the geometry: offsetDirection ======*/
      var offsetDirection_buffer = initBuffer(gl, offsetDirection);

      /*======= Associating shaders to buffer objects: vertex ======*/
      bindBuffer(gl, lineProgram, lineVertices_buffer, "vertex");

      /*======= Associating shaders to buffer objects: prev ======*/
      bindBuffer(gl, lineProgram, prevLineVertices_buffer, "prev");

      /*======= Associating shaders to buffer objects: next ======*/
      bindBuffer(gl, lineProgram, nextLineVertices_buffer, "next");

      /*======= Associating shaders to buffer objects: offsetDirection ======*/
      bindBuffer(gl, lineProgram, offsetDirection_buffer, "offsetDirection");

      /*============ Drawing the lines =============*/

      // Clear the canvas
      gl.clearColor(0, 0, 0, 0);

      // Enable the depth test
      gl.enable(gl.DEPTH_TEST);

      // Clear the color and depth buffer
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Set the view port
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Draw the lines
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, values.length * 2);

      /*=================== AREA ====================*/
      /*=================== AREA ====================*/
      /*=================== AREA ====================*/

      /*=================== Shaders ====================*/

      // Vertex shader source code
      var areaVShader =
        "attribute vec3 vertex;" +
        "void main(void) {" +
        " gl_Position = vec4(vertex, 1.0);" +
        "}";

      // Fragment shader source code
      var areaFShader =
        "void main(void) {" + "gl_FragColor = vec4(0.0, 0.0, 1.0, 0.3);" + "}";

      const areaProgram = initProgram(gl, areaVShader, areaFShader);

      // Use the combined shader program object
      gl.useProgram(areaProgram);

      /*======= Defining the geometry ======*/

      const fillAreaVertices: number[] = [];

      values.forEach((value, index) => {
        const x = (index / values.length) * 2 - 1;
        const y = (value.price / maxPrice) * 2 - 1;
        const z = 0.5;
        // Fill area
        fillAreaVertices.push(x, y, z);
        fillAreaVertices.push(x, -1, z);
      });

      /*======= Storing the geometry: offsetDirection ======*/
      var fillAreaVertices_buffer = initBuffer(gl, fillAreaVertices);

      /*======= Associating shaders to buffer objects: vertex ======*/
      bindBuffer(gl, areaProgram, fillAreaVertices_buffer, "vertex");

      /*============ Drawing the area =============*/
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, values.length * 2);
    }
  });

  return <canvas ref={canvasElementRef as any} />;
};
