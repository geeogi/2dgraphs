import React, { useEffect, useRef } from "react";

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
      var vertCodeForLines =
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

      // Create a vertex shader object
      var vertShader = gl.createShader(gl.VERTEX_SHADER);

      // Attach vertex shader source code
      gl.shaderSource(vertShader, vertCodeForLines);

      // Compile the vertex shader
      gl.compileShader(vertShader);

      // Fragment shader source code
      var fragCode =
        "void main(void) {" + "gl_FragColor = vec4(1, 1, 0.0, 0.1);" + "}";

      // Create fragment shader object
      var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

      // Attach fragment shader source code
      gl.shaderSource(fragShader, fragCode);

      // Compile the fragment shader
      gl.compileShader(fragShader);

      // Create a shader program object to store the combined shader program
      var shaderProgram = gl.createProgram();

      // Attach a vertex shader
      gl.attachShader(shaderProgram, vertShader);

      // Attach a fragment shader
      gl.attachShader(shaderProgram, fragShader);

      // Link both the programs
      gl.linkProgram(shaderProgram);

      // Use the combined shader program object
      gl.useProgram(shaderProgram);

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

      var lineVertices_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, lineVertices_buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(lineVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Storing the geometry: prev ======*/

      var prevLineVertices_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, prevLineVertices_buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(prevLineVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Storing the geometry: next ======*/

      var nextLineVertices_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, nextLineVertices_buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(nextLineVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Storing the geometry: offsetDirection ======*/

      var offsetDirection_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, offsetDirection_buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(offsetDirection),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects: vertex ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, lineVertices_buffer);
      var vertex = gl.getAttribLocation(shaderProgram, "vertex");
      gl.vertexAttribPointer(vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertex);

      /*======= Associating shaders to buffer objects: prev ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, prevLineVertices_buffer);
      var prevVertex = gl.getAttribLocation(shaderProgram, "prev");
      gl.vertexAttribPointer(prevVertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(prevVertex);

      /*======= Associating shaders to buffer objects: next ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, nextLineVertices_buffer);
      var nextVertex = gl.getAttribLocation(shaderProgram, "next");
      gl.vertexAttribPointer(nextVertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nextVertex);

      /*======= Associating shaders to buffer objects: offsetDirection ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, offsetDirection_buffer);
      var offsetDirection_gl = gl.getAttribLocation(
        shaderProgram,
        "offsetDirection"
      );
      gl.vertexAttribPointer(offsetDirection_gl, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(offsetDirection_gl);

      /*============ Drawing the lines =============*/

      // Clear the canvas
      gl.clearColor(0.5, 0.5, 0.5, 0.9);

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
      var vertCodeForArea =
        "attribute vec3 vertex;" +
        "void main(void) {" +
        " gl_Position = vec4(vertex, 1.0);" +
        "}";

      // Create a vertex shader object
      var vertShaderArea = gl.createShader(gl.VERTEX_SHADER);

      // Attach vertex shader source code
      gl.shaderSource(vertShaderArea, vertCodeForArea);

      // Compile the vertex shader
      gl.compileShader(vertShaderArea);

      // Fragment shader source code
      var fragCodeArea =
        "void main(void) {" + "gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);" + "}";

      // Create fragment shader object
      var fragShaderArea = gl.createShader(gl.FRAGMENT_SHADER);

      // Attach fragment shader source code
      gl.shaderSource(fragShaderArea, fragCodeArea);

      // Compile the fragment shader
      gl.compileShader(fragShaderArea);

      // Create a shader program object to store the combined shader program
      var shaderProgramArea = gl.createProgram();

      // Attach a vertex shader
      gl.attachShader(shaderProgramArea, vertShaderArea);

      // Attach a fragment shader
      gl.attachShader(shaderProgramArea, fragShaderArea);

      // Link both the programs
      gl.linkProgram(shaderProgramArea);

      // Use the combined shader program object
      gl.useProgram(shaderProgramArea);

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

      var fillAreaVertices_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, fillAreaVertices_buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(fillAreaVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects: vertex ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, fillAreaVertices_buffer);
      var vertexArea = gl.getAttribLocation(shaderProgramArea, "vertex");
      gl.vertexAttribPointer(vertexArea, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertexArea);

      /*============ Drawing the lines =============*/

      // Clear the canvas
      gl.clearColor(0.5, 0.5, 0.5, 0.9);

      // Enable the depth test
      gl.enable(gl.DEPTH_TEST);

      // Set the view port
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Draw the lines
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, values.length * 2);
    }
  });

  return <canvas ref={canvasElementRef as any} />;
};
