# 2D Graphs 📈
## WebGL vs. 2D Canvas comparison

### TL;DR

The initial load of the 2D Canvas graph (~15ms) is faster than the initial load of the WebGL graph (~40ms) [and both are faster than the best performing JS charting libraries according to a [recent benchmark](https://github.com/leeoniya/uPlot#performance)]. The WebGL graph is much faster when zooming and panning. Try it out [here](https://2dgraphs.netlify.com).

### Introduction:

The aim of this repo is to compare the relative performance of two browser rendering technologies 2D Canvas and WebGL for 2D graphing. The primary line and the shaded region of the graph have been implemented using each API. You can toggle the render technology by using the buttons and you can re-render the graph by reducing/increasing the number of data points. The rest of the graph (data parsing, labels and grid lines) is handled by a separate module to achieve a controlled environment for comparing the two render technologies.

### Key findings:

* The initial load of the 2D Canvas graph (~15ms) is faster than the initial load of the WebGL graph (~40ms). However, once the WebGL graph is loaded the drawing command executes extremely fast (~0.01ms) in comparison to the 2D Canvas graph (up to 1.2ms) and so the WebGL graph is quicker to re-render when making zoom/pan interactions.

* The slow loading speed of the WebGL graph is due to the fact that fetching the WebGL context is slow in all major browsers (~10ms). Fetching the attribute and uniform locations for the compiled drawing program (~3ms each) and sizing the canvas (~2ms) also takes a significant amount of time. The WebGL graph benefits from performing matrix transformations (e.g. zoom) on the GPU, whereas the 2D Canvas is bound to performing these on the CPU and so performance greatly decreases as the number of data points increases.

### Performance considerations:

* Compiling the WebGL drawing program and fetching the attribute and uniform locations (~3ms each) is slow and should be completed as soon as possible on application start. These can be cached and reused throughout the lifetime of the application.

* Resizing the WebGL canvas is slow and should be done as infrequently as possible. The WebGL resize handler on this page scales the canvas element (~0.01ms) immediately and then resizes the WebGL canvas (~1.4ms) in a debounced action.

* WebGL is extremely fast when drawing the same attributes repeatedly with matrix vectors applied (e.g. scale, skew, rotation, transformation). The pan-able and zoom-able features of the WebGL graph are achieved through matrix transformation of a single set of attributes for the best performance.

* In theory a 2D graph could be loaded using the 2D Canvas context and then replaced with a WebGL context as soon as possible. This implementation could benefit from the best performance of each technology i.e. fast load times with 2D canvas and quick interaction times with WebGL (note: not tried this yet, could be a bad idea).

### Performance benchmark (MacBook Pro 2017 2.3 GHz Intel Core i5):

|Action|2D snippet|WebGL snippet|2D performance|WebGL performance|
|--- |--- |--- |--- |--- |--- |
|Fetching the context|getContext(“2d”);|getContext(“webgl”);|~0.01ms|~7.8ms|
|Resizing the canvas|canvas.width=400;|canvas.width=400;|~0.02ms|~1.4ms|
|Initiating buffers|N/A|createBuffer(...); bindBuffer(...);|N/A|~0.03ms|
|Initiating shaders|N/A|createShader(...); compileShader(...);|N/A|~0.02ms|
|Initiating program|N/A|createProgram(...); linkProgram(...);|N/A|~0.01ms|
|Using program|N/A|useProgram(...);|N/A|~1ms|
|Fetch locations|N/A|getUniformLocation(...); getAttribLocation(...);|N/A|~0.04ms|
|Executing a drawing command (5 points)|lineTo(…); ctx.stroke();|drawElements(…);|~0.05ms|~0.01ms|
|Executing a drawing command (3000 points)|lineTo(…); ctx.stroke();|drawElements(…);|~1.2ms|~0.01ms|
