export const initProgram = (
  gl: WebGLRenderingContext,
  shaderSource: string,
  fragSource: string
) => {
  // Create a vertex shader object
  const vertShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertShader) {
    throw new Error("failed to compile vertex shader");
  }

  // Attach vertex shader source code
  gl.shaderSource(vertShader, shaderSource);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  // Create fragment shader object
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragShader) {
    throw new Error("failed to compile fragment shader");
  }

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragSource);

  // Compile the fragment shader
  gl.compileShader(fragShader);

  // Create a shader program object to store the combined shader program
  const program = gl.createProgram();

  if (!program) {
    throw new Error("failed to create program");
  }

  // Attach a vertex shader
  gl.attachShader(program, vertShader);

  // Attach a fragment shader
  gl.attachShader(program, fragShader);

  // Link both the programs
  gl.linkProgram(program);

  return program;
};

export const initArrayBuffer = (
  gl: WebGLRenderingContext,
  values: number[]
) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  if (!buffer) {
    throw new Error("unable to create buffer");
  }
  return buffer;
};

export const enableAttribute = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  attributeName: string
) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const attribLocation = gl.getAttribLocation(program, attributeName);
  gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribLocation);
};
