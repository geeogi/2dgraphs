import React, { memo, useCallback, useEffect, useRef } from "react";
import { Canvas } from "../Canvas";
import { getPeriodAverageRenderMethod } from "./PeriodAverage/renderMethod";
import { getInteractivityHandlers } from "./Utils/interactivityUtils";

const PeriodAverageBase = (props: {
  averagePrice: number;
  earliestDate: string;
  latestDate: string;
  maxPrice: number;
  minPrice: number;
  values: { dateTime: string; price: number }[];
}) => {
  const truncatedValues = props.values.filter((_, index) => index < 1000);
  useEffect(() => {
    /*======= Creating a canvas =========*/

    var canvas: any = document.getElementById("my_Canvas");
    if (canvas) {
      var gl = (canvas as any).getContext("webgl");

      var desiredCSSWidth = 1000;
      var desiredCSSHeight = 400;
      var devicePixelRatio = 4;

      canvas.width = desiredCSSWidth * devicePixelRatio;
      canvas.height = desiredCSSHeight * devicePixelRatio;

      canvas.style.width = desiredCSSWidth + "px";
      canvas.style.height = desiredCSSHeight + "px";

      /*=================== Shaders ====================*/

      // Vertex shader source code
      var vertCode =
        "attribute vec3 coordinates;" +
        "void main(void) {" +
        " gl_Position = vec4(coordinates, 1.0);" +
        " gl_Position.y = gl_Position.y - 0.5;" +
        "}";

      // Create a vertex shader object
      var vertShader = gl.createShader(gl.VERTEX_SHADER);

      // Attach vertex shader source code
      gl.shaderSource(vertShader, vertCode);

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

      // Create a shader program object to store
      // the combined shader program
      var shaderProgram = gl.createProgram();

      // Attach a vertex shader
      gl.attachShader(shaderProgram, vertShader);

      // Attach a fragment shader
      gl.attachShader(shaderProgram, fragShader);

      // Link both the programs
      gl.linkProgram(shaderProgram);

      // Use the combined shader program object
      gl.useProgram(shaderProgram);

      /*======= Defining and storing the geometry ======*/

      const pureVertices: number[] = [];
      truncatedValues.forEach((value, index) => {
        pureVertices.push((index / truncatedValues.length) * 2 - 1);
        pureVertices.push((value.price / props.maxPrice) * 2 - 1);
        pureVertices.push(0.5);
      });

      const vertices: number[] = [];
      pureVertices.forEach((vertex, index) => {
        if (index % 3 === 0) {
          // first triangle: first corner
          vertices.push(pureVertices[index]);
          vertices.push(pureVertices[index + 1]);
          vertices.push(pureVertices[index + 2]);
          // first triangle: second corner
          vertices.push(pureVertices[index + 3]);
          vertices.push(pureVertices[index + 4]);
          vertices.push(pureVertices[index + 5]);
          // first triangle: third corner
          vertices.push(pureVertices[index + 3]);
          vertices.push(pureVertices[index + 4] + 0.01);
          vertices.push(pureVertices[index + 5]);
          // second triangle: first corner
          vertices.push(pureVertices[index]);
          vertices.push(pureVertices[index + 1]);
          vertices.push(pureVertices[index + 2]);
          // second triangle: second corner
          vertices.push(pureVertices[index]);
          vertices.push(pureVertices[index + 1] + 0.01);
          vertices.push(pureVertices[index + 2]);
          // second triangle: third corner
          vertices.push(pureVertices[index + 3]);
          vertices.push(pureVertices[index + 4] + 0.01);
          vertices.push(pureVertices[index + 5]);
        }
      });

      // Create an empty buffer object
      var vertex_buffer = gl.createBuffer();

      // Bind appropriate array buffer to it
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

      // Pass the vertex data to the buffer
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
      );

      // Unbind the buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects ======*/

      // Bind vertex buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

      // Get the attribute location
      var coord = gl.getAttribLocation(shaderProgram, "coordinates");

      // Point an attribute to the currently bound VBO
      gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

      // Enable the attribute
      gl.enableVertexAttribArray(coord);

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
      gl.drawArrays(gl.TRIANGLES, 0, truncatedValues.length * 6);
    }
  });

  // Fetch render method
  const renderMethod = getPeriodAverageRenderMethod(props);

  // Create render method React callback
  const callbackRenderMethod = useCallback(renderMethod, [props]);

  // Fetch interactivity event listeners
  const eventHandlers = getInteractivityHandlers(renderMethod);

  // Create canvas element React reference
  const canvasElementRef = useRef();

  // Define rendering React effect
  useEffect(() => {
    const canvasElement = canvasElementRef && canvasElementRef.current;

    // Define resize method
    const onResize = () => callbackRenderMethod({ canvasElement });

    if (canvasElement) {
      // Render on mount
      callbackRenderMethod({ canvasElement });

      // Attach resize listener
      window.addEventListener("resize", onResize);
    }

    // Cleanup function removes resize listener
    return () => window.removeEventListener("resize", onResize);
  }, [callbackRenderMethod]);

  return (
    <Canvas
      ref={canvasElementRef as any}
      onMouseDown={eventHandlers.handleMouseDown}
      onMouseLeave={eventHandlers.handleMouseLeave}
      onMouseMove={eventHandlers.handleMouseMove}
      onTouchEnd={eventHandlers.handleTouchEnd}
      onTouchMove={eventHandlers.handleTouchMove}
      onTouchStart={eventHandlers.handleTouchStart}
    />
  );
};

export const PeriodAverage = memo(PeriodAverageBase);
