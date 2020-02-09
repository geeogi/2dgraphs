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

|Action|2D snippet|WebGL snippet|2D performance|WebGL performance|Example|
|--- |--- |--- |--- |--- |--- |
|Fetching the context|getContext(“2d”);|getContext(“webgl”);|~0.01ms|~7.8ms|[Perflink](https://perf.link/#bGV0IGNhbnZhczEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJjYW52YXMiKTsKbGV0IGNhbnZhczIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJjYW52YXMiKTs=/W3siY29kZSI6ImxldCBjb250ZXh0MSA9IGNhbnZhczEuZ2V0Q29udGV4dChcIjJkXCIpOyIsImVycm9yIjpmYWxzZSwibWVkaWFuIjowLjAxMDAwMDAwMTU4MDkyMDA3fSx7ImNvZGUiOiJsZXQgY29udGV4dDIgPSBjYW52YXMyLmdldENvbnRleHQoXCJ3ZWJnbFwiKTsiLCJlcnJvciI6ZmFsc2UsIm1lZGlhbiI6Ny45ODAwMDAwMDAzMzA2MTk1fV0=)|
|Resizing the canvas|canvas.width=400;|canvas.width=400;|~0.02ms|~1.4ms|[Perflink](https://perf.link/#Ly8gMkQgQ2FudmFzCmxldCBjYW52YXMxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiY2FudmFzIik7CmxldCBjb250ZXh0MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgiMmQiKTsKLy8gV2ViR0wKbGV0IGNhbnZhczIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJjYW52YXMiKTsKbGV0IGNvbnRleHQyID0gY2FudmFzMi5nZXRDb250ZXh0KCJ3ZWJnbCIpOw==/W3siY29kZSI6ImNhbnZhczEud2lkdGggPSAzMDA7XG5jYW52YXMxLndpZHRoID0gNDAwOyIsImVycm9yIjpmYWxzZSwibWVkaWFuIjowLjAxOTk5OTk5OTQ5NDc1NzUwM30seyJjb2RlIjoiXG5jYW52YXMyLndpZHRoID0gMzAwO1xuY2FudmFzMi53aWR0aCA9IDQwMDtcbiIsImVycm9yIjpmYWxzZSwibWVkaWFuIjoxLjQyMDAwMDAwMDUwNzU3MDh9XQ==)|
|Initiating buffers|N/A|createBuffer(...); bindBuffer(...);|N/A|~0.03ms|[Perflink](https://perf.link/#bGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImNhbnZhcyIpOwpsZXQgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgid2ViZ2wiKTs=/W3siY29kZSI6Ii8qPT09PT09PT09PSBEZWZpbmluZyBhbmQgc3RvcmluZyB0aGUgZ2VvbWV0cnkgPT09PT09PT09Ki9cblxudmFyIHZlcnRpY2VzID0gWy0xLjAsIDEuMCwgMC4wLCAtMS4wLCAtMS4wLCAwLjAsIDEuMCwgLTEuMCwgMC4wLCAxLjAsIDEuMCwgMC4wXTtcblxudmFyIGluZGljZXMgPSBbMywgMiwgMSwgMywgMSwgMF07XG5cbi8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIgb2JqZWN0IHRvIHN0b3JlIHZlcnRleCBidWZmZXJcbnZhciB2ZXJ0ZXhfYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbi8vIEJpbmQgYXBwcm9wcmlhdGUgYXJyYXkgYnVmZmVyIHRvIGl0XG5nbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4X2J1ZmZlcik7XG5cbi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXJcbmdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4vLyBVbmJpbmQgdGhlIGJ1ZmZlclxuZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuXG4vLyBDcmVhdGUgYW4gZW1wdHkgYnVmZmVyIG9iamVjdCB0byBzdG9yZSBpbmRleCBidWZmZXJcbnZhciBpbmRleF9CdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcblxuLy8gQmluZCBhcHByb3ByaWF0ZSBhcnJheSBidWZmZXIgdG8gaXRcbmdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4X0J1ZmZlcik7XG5cbi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXJcbmdsLmJ1ZmZlckRhdGEoXG4gIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLFxuICBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksXG4gIGdsLlNUQVRJQ19EUkFXXG4pO1xuXG4vLyBVbmJpbmQgdGhlIGJ1ZmZlclxuZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7IiwiZXJyb3IiOmZhbHNlLCJtZWRpYW4iOjAuMDM1MDAwMDAwOTM0ODE1MDM0fV0=)|
|Initiating shaders|N/A|createShader(...); compileShader(...);|N/A|~0.02ms|[Perflink](https://perf.link/#bGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImNhbnZhcyIpOwpsZXQgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgid2ViZ2wiKTsKCi8qPT09PT09PT09PSBEZWZpbmluZyBhbmQgc3RvcmluZyB0aGUgZ2VvbWV0cnkgPT09PT09PT09Ki8KCnZhciB2ZXJ0aWNlcyA9IFstMS4wLCAxLjAsIDAuMCwgLTEuMCwgLTEuMCwgMC4wLCAxLjAsIC0xLjAsIDAuMCwgMS4wLCAxLjAsIDAuMF07Cgp2YXIgaW5kaWNlcyA9IFszLCAyLCAxLCAzLCAxLCAwXTsKCi8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIgb2JqZWN0IHRvIHN0b3JlIHZlcnRleCBidWZmZXIKdmFyIHZlcnRleF9idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTsKCi8vIEJpbmQgYXBwcm9wcmlhdGUgYXJyYXkgYnVmZmVyIHRvIGl0CmdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhfYnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7CgovLyBVbmJpbmQgdGhlIGJ1ZmZlcgpnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7CgovLyBDcmVhdGUgYW4gZW1wdHkgYnVmZmVyIG9iamVjdCB0byBzdG9yZSBpbmRleCBidWZmZXIKdmFyIGluZGV4X0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpOwoKLy8gQmluZCBhcHByb3ByaWF0ZSBhcnJheSBidWZmZXIgdG8gaXQKZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhfQnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YSgKICBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwKICBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksCiAgZ2wuU1RBVElDX0RSQVcKKTsKCi8vIFVuYmluZCB0aGUgYnVmZmVyCmdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpOwo=/W3siY29kZSI6IlxuLyo9PT09PT09PT09PT09PT09PT09PT09IFNoYWRlcnMgPT09PT09PT09PT09PT09PT09PT09PT0qL1xuXG4vLyBWZXJ0ZXggc2hhZGVyIHNvdXJjZSBjb2RlXG52YXIgdmVydENvZGUgPVxuICBcImF0dHJpYnV0ZSB2ZWMzIGNvb3JkaW5hdGVzO1wiICtcbiAgXCJ2b2lkIG1haW4odm9pZCkge1wiICtcbiAgXCIgZ2xfUG9zaXRpb24gPSB2ZWM0KGNvb3JkaW5hdGVzLCAxLjApO1wiICtcbiAgXCJ9XCI7XG5cbi8vIENyZWF0ZSBhIHZlcnRleCBzaGFkZXIgb2JqZWN0XG52YXIgdmVydFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcblxuLy8gQXR0YWNoIHZlcnRleCBzaGFkZXIgc291cmNlIGNvZGVcbmdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyLCB2ZXJ0Q29kZSk7XG5cbi8vIENvbXBpbGUgdGhlIHZlcnRleCBzaGFkZXJcbmdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlcik7XG5cbi8vIEZyYWdtZW50IHNoYWRlciBzb3VyY2UgY29kZVxudmFyIGZyYWdDb2RlID1cbiAgXCJ2b2lkIG1haW4odm9pZCkge1wiICsgXCIgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1wiICsgXCJ9XCI7XG5cbi8vIENyZWF0ZSBmcmFnbWVudCBzaGFkZXIgb2JqZWN0XG52YXIgZnJhZ1NoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xuXG4vLyBBdHRhY2ggZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlXG5nbC5zaGFkZXJTb3VyY2UoZnJhZ1NoYWRlciwgZnJhZ0NvZGUpO1xuXG4vLyBDb21waWxlIHRoZSBmcmFnbWVudCBzaGFkZXJcbmdsLmNvbXBpbGVTaGFkZXIoZnJhZ1NoYWRlcik7XG4iLCJlcnJvciI6ZmFsc2UsIm1lZGlhbiI6MC4wMTk5OTk5OTk0OTQ3NTc1MDN9XQ==)|
|Initiating program|N/A|createProgram(...); linkProgram(...);|N/A|~0.01ms|[Perflink](https://perf.link/#bGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImNhbnZhcyIpOwpsZXQgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgid2ViZ2wiKTsKCi8qPT09PT09PT09PSBEZWZpbmluZyBhbmQgc3RvcmluZyB0aGUgZ2VvbWV0cnkgPT09PT09PT09Ki8KCnZhciB2ZXJ0aWNlcyA9IFstMS4wLCAxLjAsIDAuMCwgLTEuMCwgLTEuMCwgMC4wLCAxLjAsIC0xLjAsIDAuMCwgMS4wLCAxLjAsIDAuMF07Cgp2YXIgaW5kaWNlcyA9IFszLCAyLCAxLCAzLCAxLCAwXTsKCi8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIgb2JqZWN0IHRvIHN0b3JlIHZlcnRleCBidWZmZXIKdmFyIHZlcnRleF9idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTsKCi8vIEJpbmQgYXBwcm9wcmlhdGUgYXJyYXkgYnVmZmVyIHRvIGl0CmdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhfYnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7CgovLyBVbmJpbmQgdGhlIGJ1ZmZlcgpnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7CgovLyBDcmVhdGUgYW4gZW1wdHkgYnVmZmVyIG9iamVjdCB0byBzdG9yZSBpbmRleCBidWZmZXIKdmFyIGluZGV4X0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpOwoKLy8gQmluZCBhcHByb3ByaWF0ZSBhcnJheSBidWZmZXIgdG8gaXQKZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhfQnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YSgKICBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwKICBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksCiAgZ2wuU1RBVElDX0RSQVcKKTsKCi8vIFVuYmluZCB0aGUgYnVmZmVyCmdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpOwoKLyo9PT09PT09PT09PT09PT09PT09PT09IFNoYWRlcnMgPT09PT09PT09PT09PT09PT09PT09PT0qLwoKLy8gVmVydGV4IHNoYWRlciBzb3VyY2UgY29kZQp2YXIgdmVydENvZGUgPQogICJhdHRyaWJ1dGUgdmVjMyBjb29yZGluYXRlczsiICsKICAidm9pZCBtYWluKHZvaWQpIHsiICsKICAiIGdsX1Bvc2l0aW9uID0gdmVjNChjb29yZGluYXRlcywgMS4wKTsiICsKICAifSI7CgovLyBDcmVhdGUgYSB2ZXJ0ZXggc2hhZGVyIG9iamVjdAp2YXIgdmVydFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTsKCi8vIEF0dGFjaCB2ZXJ0ZXggc2hhZGVyIHNvdXJjZSBjb2RlCmdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyLCB2ZXJ0Q29kZSk7CgovLyBDb21waWxlIHRoZSB2ZXJ0ZXggc2hhZGVyCmdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlcik7CgovLyBGcmFnbWVudCBzaGFkZXIgc291cmNlIGNvZGUKdmFyIGZyYWdDb2RlID0KICAidm9pZCBtYWluKHZvaWQpIHsiICsgIiBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7IiArICJ9IjsKCi8vIENyZWF0ZSBmcmFnbWVudCBzaGFkZXIgb2JqZWN0CnZhciBmcmFnU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7CgovLyBBdHRhY2ggZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlCmdsLnNoYWRlclNvdXJjZShmcmFnU2hhZGVyLCBmcmFnQ29kZSk7CgovLyBDb21waWxlIHRoZSBmcmFnbWVudCBzaGFkZXIKZ2wuY29tcGlsZVNoYWRlcihmcmFnU2hhZGVyKTs=/W3siY29kZSI6Ii8vIENyZWF0ZSBhIHNoYWRlciBwcm9ncmFtIG9iamVjdCB0byBzdG9yZSB0aGUgY29tYmluZWQgc2hhZGVyIHByb2dyYW1cbnZhciBzaGFkZXJQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuXG4vLyBBdHRhY2ggYSB2ZXJ0ZXggc2hhZGVyXG5nbC5hdHRhY2hTaGFkZXIoc2hhZGVyUHJvZ3JhbSwgdmVydFNoYWRlcik7XG5cbi8vIEF0dGFjaCBhIGZyYWdtZW50IHNoYWRlclxuZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIGZyYWdTaGFkZXIpO1xuXG4vLyBMaW5rIGJvdGggdGhlIHByb2dyYW1zXG5nbC5saW5rUHJvZ3JhbShzaGFkZXJQcm9ncmFtKTsiLCJlcnJvciI6ZmFsc2UsIm1lZGlhbiI6MC4wMDk5OTk5OTk3MTgyNzQ5MjF9XQ==)|
|Using program|N/A|useProgram(...);|N/A|~1ms|[Perflink](https://perf.link/#bGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImNhbnZhcyIpOwpsZXQgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgid2ViZ2wiKTsKCi8qPT09PT09PT09PSBEZWZpbmluZyBhbmQgc3RvcmluZyB0aGUgZ2VvbWV0cnkgPT09PT09PT09Ki8KCnZhciB2ZXJ0aWNlcyA9IFstMS4wLCAxLjAsIDAuMCwgLTEuMCwgLTEuMCwgMC4wLCAxLjAsIC0xLjAsIDAuMCwgMS4wLCAxLjAsIDAuMF07Cgp2YXIgaW5kaWNlcyA9IFszLCAyLCAxLCAzLCAxLCAwXTsKCi8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIgb2JqZWN0IHRvIHN0b3JlIHZlcnRleCBidWZmZXIKdmFyIHZlcnRleF9idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTsKCi8vIEJpbmQgYXBwcm9wcmlhdGUgYXJyYXkgYnVmZmVyIHRvIGl0CmdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhfYnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7CgovLyBVbmJpbmQgdGhlIGJ1ZmZlcgpnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7CgovLyBDcmVhdGUgYW4gZW1wdHkgYnVmZmVyIG9iamVjdCB0byBzdG9yZSBpbmRleCBidWZmZXIKdmFyIGluZGV4X0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpOwoKLy8gQmluZCBhcHByb3ByaWF0ZSBhcnJheSBidWZmZXIgdG8gaXQKZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhfQnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YSgKICBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwKICBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksCiAgZ2wuU1RBVElDX0RSQVcKKTsKCi8vIFVuYmluZCB0aGUgYnVmZmVyCmdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpOwoKLyo9PT09PT09PT09PT09PT09PT09PT09IFNoYWRlcnMgPT09PT09PT09PT09PT09PT09PT09PT0qLwoKLy8gVmVydGV4IHNoYWRlciBzb3VyY2UgY29kZQp2YXIgdmVydENvZGUgPQogICJhdHRyaWJ1dGUgdmVjMyBjb29yZGluYXRlczsiICsKICAidm9pZCBtYWluKHZvaWQpIHsiICsKICAiIGdsX1Bvc2l0aW9uID0gdmVjNChjb29yZGluYXRlcywgMS4wKTsiICsKICAifSI7CgovLyBDcmVhdGUgYSB2ZXJ0ZXggc2hhZGVyIG9iamVjdAp2YXIgdmVydFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTsKCi8vIEF0dGFjaCB2ZXJ0ZXggc2hhZGVyIHNvdXJjZSBjb2RlCmdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyLCB2ZXJ0Q29kZSk7CgovLyBDb21waWxlIHRoZSB2ZXJ0ZXggc2hhZGVyCmdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlcik7CgovLyBGcmFnbWVudCBzaGFkZXIgc291cmNlIGNvZGUKdmFyIGZyYWdDb2RlID0KICAidm9pZCBtYWluKHZvaWQpIHsiICsgIiBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7IiArICJ9IjsKCi8vIENyZWF0ZSBmcmFnbWVudCBzaGFkZXIgb2JqZWN0CnZhciBmcmFnU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7CgovLyBBdHRhY2ggZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlCmdsLnNoYWRlclNvdXJjZShmcmFnU2hhZGVyLCBmcmFnQ29kZSk7CgovLyBDb21waWxlIHRoZSBmcmFnbWVudCBzaGFkZXIKZ2wuY29tcGlsZVNoYWRlcihmcmFnU2hhZGVyKTsKCi8vIENyZWF0ZSBhIHNoYWRlciBwcm9ncmFtIG9iamVjdCB0byBzdG9yZSB0aGUgY29tYmluZWQgc2hhZGVyIHByb2dyYW0KdmFyIHNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7CgovLyBBdHRhY2ggYSB2ZXJ0ZXggc2hhZGVyCmdsLmF0dGFjaFNoYWRlcihzaGFkZXJQcm9ncmFtLCB2ZXJ0U2hhZGVyKTsKCi8vIEF0dGFjaCBhIGZyYWdtZW50IHNoYWRlcgpnbC5hdHRhY2hTaGFkZXIoc2hhZGVyUHJvZ3JhbSwgZnJhZ1NoYWRlcik7CgovLyBMaW5rIGJvdGggdGhlIHByb2dyYW1zCmdsLmxpbmtQcm9ncmFtKHNoYWRlclByb2dyYW0pOw==/W3siY29kZSI6Ii8vIFVzZSB0aGUgY29tYmluZWQgc2hhZGVyIHByb2dyYW0gb2JqZWN0XG5nbC51c2VQcm9ncmFtKHNoYWRlclByb2dyYW0pOyIsImVycm9yIjpmYWxzZSwibWVkaWFuIjoxLjA2NTAwMDAwMDM1MTU3NDN9XQ==)|
|Fetch locations|N/A|getUniformLocation(...); getAttribLocation(...);|N/A|~0.04ms|[Perflink](https://perf.link/#bGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImNhbnZhcyIpOwpsZXQgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgid2ViZ2wiKTsKCi8qPT09PT09PT09PSBEZWZpbmluZyBhbmQgc3RvcmluZyB0aGUgZ2VvbWV0cnkgPT09PT09PT09Ki8KCnZhciB2ZXJ0aWNlcyA9IFstMS4wLCAxLjAsIDAuMCwgLTEuMCwgLTEuMCwgMC4wLCAxLjAsIC0xLjAsIDAuMCwgMS4wLCAxLjAsIDAuMF07Cgp2YXIgaW5kaWNlcyA9IFszLCAyLCAxLCAzLCAxLCAwXTsKCi8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIgb2JqZWN0IHRvIHN0b3JlIHZlcnRleCBidWZmZXIKdmFyIHZlcnRleF9idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTsKCi8vIEJpbmQgYXBwcm9wcmlhdGUgYXJyYXkgYnVmZmVyIHRvIGl0CmdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhfYnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBnbC5TVEFUSUNfRFJBVyk7CgovLyBVbmJpbmQgdGhlIGJ1ZmZlcgpnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7CgovLyBDcmVhdGUgYW4gZW1wdHkgYnVmZmVyIG9iamVjdCB0byBzdG9yZSBpbmRleCBidWZmZXIKdmFyIGluZGV4X0J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpOwoKLy8gQmluZCBhcHByb3ByaWF0ZSBhcnJheSBidWZmZXIgdG8gaXQKZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhfQnVmZmVyKTsKCi8vIFBhc3MgdGhlIHZlcnRleCBkYXRhIHRvIHRoZSBidWZmZXIKZ2wuYnVmZmVyRGF0YSgKICBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwKICBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksCiAgZ2wuU1RBVElDX0RSQVcKKTsKCi8vIFVuYmluZCB0aGUgYnVmZmVyCmdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpOwoKLyo9PT09PT09PT09PT09PT09PT09PT09IFNoYWRlcnMgPT09PT09PT09PT09PT09PT09PT09PT0qLwoKLy8gVmVydGV4IHNoYWRlciBzb3VyY2UgY29kZQp2YXIgdmVydENvZGUgPQogICJhdHRyaWJ1dGUgdmVjMyBjb29yZGluYXRlczsiICsKICAidm9pZCBtYWluKHZvaWQpIHsiICsKICAiIGdsX1Bvc2l0aW9uID0gdmVjNChjb29yZGluYXRlcywgMS4wKTsiICsKICAifSI7CgovLyBDcmVhdGUgYSB2ZXJ0ZXggc2hhZGVyIG9iamVjdAp2YXIgdmVydFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTsKCi8vIEF0dGFjaCB2ZXJ0ZXggc2hhZGVyIHNvdXJjZSBjb2RlCmdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyLCB2ZXJ0Q29kZSk7CgovLyBDb21waWxlIHRoZSB2ZXJ0ZXggc2hhZGVyCmdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlcik7CgovLyBGcmFnbWVudCBzaGFkZXIgc291cmNlIGNvZGUKdmFyIGZyYWdDb2RlID0KICAidW5pZm9ybSB2ZWM0IGNvbG91cjsgdm9pZCBtYWluKHZvaWQpIHsiICsgIiBnbF9GcmFnQ29sb3IgPSBjb2xvdXI7IiArICJ9IjsKCi8vIENyZWF0ZSBmcmFnbWVudCBzaGFkZXIgb2JqZWN0CnZhciBmcmFnU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7CgovLyBBdHRhY2ggZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlCmdsLnNoYWRlclNvdXJjZShmcmFnU2hhZGVyLCBmcmFnQ29kZSk7CgovLyBDb21waWxlIHRoZSBmcmFnbWVudCBzaGFkZXIKZ2wuY29tcGlsZVNoYWRlcihmcmFnU2hhZGVyKTsKCi8vIENyZWF0ZSBhIHNoYWRlciBwcm9ncmFtIG9iamVjdCB0byBzdG9yZSB0aGUgY29tYmluZWQgc2hhZGVyIHByb2dyYW0KdmFyIHNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7CgovLyBBdHRhY2ggYSB2ZXJ0ZXggc2hhZGVyCmdsLmF0dGFjaFNoYWRlcihzaGFkZXJQcm9ncmFtLCB2ZXJ0U2hhZGVyKTsKCi8vIEF0dGFjaCBhIGZyYWdtZW50IHNoYWRlcgpnbC5hdHRhY2hTaGFkZXIoc2hhZGVyUHJvZ3JhbSwgZnJhZ1NoYWRlcik7CgovLyBMaW5rIGJvdGggdGhlIHByb2dyYW1zCmdsLmxpbmtQcm9ncmFtKHNoYWRlclByb2dyYW0pOwoKLy8gVXNlIHRoZSBjb21iaW5lZCBzaGFkZXIgcHJvZ3JhbSBvYmplY3QKZ2wudXNlUHJvZ3JhbShzaGFkZXJQcm9ncmFtKTsK/W3siY29kZSI6IlxuLy8gR2V0IHRoZSBhdHRyaWJ1dGUgbG9jYXRpb25cbnZhciBjb29yZGluYXRlc0F0dHJpYkxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oXG4gIHNoYWRlclByb2dyYW0sXG4gIFwiY29vcmRpbmF0ZXNcIlxuKTtcblxuLy8gR2V0IHRoZSB1bmlmb3JtIGxvY2F0aW9uXG52YXIgY29sb3VyVW5pZm9ybUxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKFxuICBzaGFkZXJQcm9ncmFtLFxuICBcImNvbG91clwiXG4pOyIsImVycm9yIjpmYWxzZSwibWVkaWFuIjowLjAzNDk5OTk5OTEzMDM3NzU0Nn1d)|
|Executing a drawing command (5 points)|lineTo(…); ctx.stroke();|drawElements(…);|~0.05ms|~0.01ms|[2D Graphs](https://2dgraphs.netlify.com/)|
|Executing a drawing command (3000 points)|lineTo(…); ctx.stroke();|drawElements(…);|~1.2ms|~0.01ms|[2D Graphs](https://2dgraphs.netlify.com/)|
