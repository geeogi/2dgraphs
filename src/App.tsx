import React, { useEffect } from "react";
import { Button } from "./Components/Base/Button";
import { Div } from "./Components/Base/Div";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1, H3 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { ActiveLegend } from "./Components/Base/AxisLegend";
import { Canvas } from "./Components/Base/Canvas";
import { ACTIVE_LEGEND } from "./Components/Graph/Universal/constants";
import { drawGraph } from "./draw";

const ACTIVE_LEGEND_WIDTH = ACTIVE_LEGEND.WIDTH;
const ACTIVE_LEGEND_ID = "active-legend";

function App() {
  // Draw graph when Canvas element is loaded
  useEffect(() => {
    drawGraph();
  });

  return (
    <main>
      <Header>
        <H1>2D Graphs</H1>
        <P>2D Canvas vs. WebGL comparison</P>
      </Header>
      <GraphCard>
        <H3>Render method:</H3>
        <Row>
          <Button onClick={() => drawGraph(undefined, "2dcanvas")}>
            2D Canvas
          </Button>
          <Button onClick={() => drawGraph(undefined, "webgl")}>WebGL</Button>
        </Row>
        <H3>Data points:</H3>
        <Row>
          <input
            type="range"
            min={5}
            max={3000}
            defaultValue={400}
            step={1}
            onChange={e => drawGraph(e.target.value as any)}
          ></input>
        </Row>
        <div>
          <Div position="relative">
            <Canvas />
            <ActiveLegend
              id={ACTIVE_LEGEND_ID}
              width={ACTIVE_LEGEND_WIDTH}
              style={{ display: "none" }}
            />
          </Div>
        </div>
      </GraphCard>
    </main>
  );
}

export default App;
