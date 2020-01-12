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
import { Div } from "./Components/Base/Div";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1, H3 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { drawGraph } from "./drawGraph";

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
            <ActiveLegend id={ACTIVE_LEGEND_ID} />
            <ActiveCircle id={ACTIVE_CIRCLE_ID} />
            <ActiveLine id={ACTIVE_LINE_ID} />
          </Div>
        </div>
      </GraphCard>
    </main>
  );
}

export default App;
