import React, { useEffect } from "react";
import {
  ActiveCircle,
  ActiveLegend,
  ActiveLine,
  ACTIVE_CIRCLE_ID,
  ACTIVE_LEGEND_ID,
  ACTIVE_LINE_ID
} from "./Components/Base/AxisLegend";
import { Button } from "./Components/Base/Button";
import { Canvas } from "./Components/Base/Canvas";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1, H3 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { drawGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { drawGraphWebGL } from "./Components/Graph/WebGL";
import { drawGraph, setDataPoints } from "./drawGraph";

function App() {
  // Draw graph when Canvas element is loaded
  useEffect(() => {
    drawGraph("line-graph-2d-canvas", drawGraph2DCanvas);
  });

  // Method to update data points and re-render graph
  const updateDataPoints = (newNoOfDataPoints: number) => {
    const dataPointsEl = document.getElementById("data-points-preview");
    if (dataPointsEl) {
      dataPointsEl.innerText = newNoOfDataPoints.toString();
    }
    setDataPoints(newNoOfDataPoints);
  };

  return (
    <main>
      <Header>
        <H1>2D Graphs</H1>
        <P>2D Canvas vs. WebGL comparison</P>
      </Header>
      <GraphCard>
        <H3>Render method:</H3>
        <Row>
          <Button
            onClick={() => drawGraph("line-graph-2d-canvas", drawGraph2DCanvas)}
          >
            2D Canvas
          </Button>
          <Button onClick={() => drawGraph("line-graph-webgl", drawGraphWebGL)}>
            WebGL
          </Button>
        </Row>
        <H3>Data points:</H3>
        <Row>
          <form name="dataPoints">
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
          </form>
        </Row>
        <div>
          <div style={{ position: "relative" }}>
            <Canvas id="line-graph-2d-canvas" style={{ display: "none" }} />
            <Canvas id="line-graph-webgl" style={{ display: "none" }} />
            <ActiveLegend id={ACTIVE_LEGEND_ID} style={{ display: "none" }} />
            <ActiveCircle id={ACTIVE_CIRCLE_ID} style={{ display: "none" }} />
            <ActiveLine id={ACTIVE_LINE_ID} style={{ display: "none" }} />
          </div>
        </div>
      </GraphCard>
    </main>
  );
}

export default App;
