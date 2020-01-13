import React, { useEffect } from "react";
import { drawGraph2DCanvas } from "./Graph/2DCanvas";
import { drawGraphWebGL } from "./Graph/WebGL";
import { drawGraph, updateDataPoints } from "./newIndex";

function App() {
  // Draw graph when Canvas element is loaded
  useEffect(() => {
    drawGraph("line-graph-2d-canvas", drawGraph2DCanvas);
  });

  return (
    <main>
      <header className="Header">
        <h1>2D Graphs</h1>
        <p>Canvas vs. WebGL comparison</p>
      </header>
      <div className="GraphCard">
        <h3>Render method:</h3>
        <div className="Row">
          <button
            onClick={() => drawGraph("line-graph-2d-canvas", drawGraph2DCanvas)}
          >
            2D Canvas
          </button>
          <button onClick={() => drawGraph("line-graph-webgl", drawGraphWebGL)}>
            WebGL
          </button>
        </div>
        <h3>Data points:</h3>
        <div className="Row">
          <input
            name="dataPointsInputName"
            id="dataPointsInputId"
            type="range"
            min={5}
            max={3000}
            defaultValue={400}
            step={1}
            onChange={e => updateDataPoints(e.target.value as any)}
          />
          <p id="data-points-preview">400</p>
        </div>
        <div>
          <div style={{ position: "relative" }}>
            <canvas id="line-graph-2d-canvas" style={{ display: "none" }} />
            <canvas id="line-graph-webgl" style={{ display: "none" }} />
            <div
              className="ActiveLegend"
              id="active-legend"
              style={{ display: "none" }}
            />
            <div
              className="ActiveCircle"
              id="active-circle"
              style={{ display: "none" }}
            />
            <div
              className="ActiveLine"
              id="active-line"
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
