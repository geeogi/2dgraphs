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
  const truncatedValues = props.values.filter((_, index) => index < 40);
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
        "attribute vec3 prev;" +
        "attribute vec3 next;" +
        "attribute vec2 aCorner;" +
        "void main(void) {" +
        " gl_Position = vec4(coordinates, 1.0);" +
        " gl_Position = vec4(prev, 1.0);" +
        " gl_Position = vec4(next, 1.0);" +
        "vec2 AB = normalize(normalize(gl_Position.xy - prev.xy) * 1000.0);" +
        "vec2 BC = normalize(normalize(next.xy - gl_Position.xy) * 1000.0);" +
        "vec2 tangent = normalize(AB + BC);" +
        "vec2 miter = vec2(-tangent.y, tangent.x);" +
        "vec2 normalA = vec2(-AB.y, AB.x);" +
        "float miterLength = 1.0 / dot(miter, normalA);" +
        "gl_Position.xy = gl_Position.xy + (aCorner * miter * miterLength * 0.01);" +
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

      /*======= Defining the geometry ======*/

      const vertex: number[] = [];

      truncatedValues.forEach((value, index) => {
        vertex.push((index / truncatedValues.length) * 2 - 1);
        vertex.push((value.price / props.maxPrice) * 2 - 1);
        vertex.push(0.5);
        // Same again
        vertex.push((index / truncatedValues.length) * 2 - 1);
        vertex.push((value.price / props.maxPrice) * 2 - 1);
        vertex.push(0.5);
      });

      const prev: number[] = JSON.parse(JSON.stringify(vertex));

      prev.unshift(0.0);
      prev.unshift(0.0);
      prev.unshift(0.0);
      prev.unshift(0.0);
      prev.unshift(0.0);
      prev.unshift(0.0);
      prev.splice(-1, 1);
      prev.splice(-1, 1);
      prev.splice(-1, 1);
      prev.splice(-1, 1);
      prev.splice(-1, 1);
      prev.splice(-1, 1);

      const next: number[] = JSON.parse(JSON.stringify(vertex));

      next.shift();
      next.shift();
      next.shift();
      next.shift();
      next.shift();
      next.shift();
      next.push(0.0);
      next.push(0.0);
      next.push(0.0);
      next.push(0.0);
      next.push(0.0);
      next.push(0.0);

      /*======= Storing the geometry: vertex ======*/

      var vertex_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects: vertex ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
      var coord = gl.getAttribLocation(shaderProgram, "coordinates");
      gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(coord);

      /*======= Storing the geometry: prev ======*/

      var prev_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, prev_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(prev), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects: prev ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, prev_buffer);
      var prev_gl = gl.getAttribLocation(shaderProgram, "prev");
      gl.vertexAttribPointer(prev_gl, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(prev_gl);

      /*======= Storing the geometry: next ======*/

      var next_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, next_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(next), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects: next ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, next_buffer);
      var next_gl = gl.getAttribLocation(shaderProgram, "next");
      gl.vertexAttribPointer(next_gl, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(next_gl);

      /*======= Storing the geometry: aCorner ======*/

      const aCorner: number[] = [];
      truncatedValues.forEach(() => {
        aCorner.push(-1);
        aCorner.push(-1);
        aCorner.push(1);
        aCorner.push(1);
      });

      var aCorner_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, aCorner_buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aCorner), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      /*======= Associating shaders to buffer objects: aCorner ======*/

      gl.bindBuffer(gl.ARRAY_BUFFER, aCorner_buffer);
      var aCorner_gl = gl.getAttribLocation(shaderProgram, "aCorner");
      gl.vertexAttribPointer(aCorner_gl, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aCorner_gl);

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
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, truncatedValues.length);
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
