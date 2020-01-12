import React, { useEffect } from "react";
import PRICE_DATA from "./allTime.json";
import { Button } from "./Components/Base/Button";
import { Div } from "./Components/Base/Div";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1, H3 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { drawGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { ActiveLegend } from "./Components/Graph/AxisLegend";
import { Canvas } from "./Components/Graph/Canvas";
import { ACTIVE_LEGEND } from "./Components/Graph/constants";
import { positionActiveLegend } from "./Components/Graph/Universal/positionActiveLegend";
import { positionLabels } from "./Components/Graph/Universal/positionLabels";
import { calculateGraphValues } from "./Components/Graph/Universal/setup";
import { drawGraphWebGL } from "./Components/Graph/WebGL";

const ACTIVE_LEGEND_WIDTH = ACTIVE_LEGEND.WIDTH;
const ACTIVE_LEGEND_ID = "active-legend";

// Parse JSON values
const values: { dateTime: string; price: number }[] = PRICE_DATA.map(value => ({
  dateTime: value.date,
  price: value["price(USD)"]
}));

// Declare render variables
let noOfDataPoints = 400;
let currentGraphType: string = "2dcanvas";

// Cache cleanup function to be called if graph is re-rendered
let cleanup: () => void;

// Declare render method
const triggerDraw = (
  newNoOfDataPoints: number = noOfDataPoints,
  graphType: string = currentGraphType
) => {
  // Fetch canvas element
  let canvasElement: HTMLCanvasElement = document.getElementsByTagName(
    "canvas"
  )[0];

  // Replace canvas element if graph type is changed
  if (graphType !== currentGraphType) {
    const newCanvasElement = document.createElement("canvas");
    newCanvasElement.setAttribute(
      "style",
      "user-select: none; touch-action: none; display: block; width: 100%; height: 400px;"
    );
    canvasElement.insertAdjacentElement("afterend", newCanvasElement);
    canvasElement.remove();
    canvasElement = newCanvasElement;
  }

  // Update render variables cache
  currentGraphType = graphType;
  noOfDataPoints = newNoOfDataPoints;

  // Calculate graph coordinates, grid lines  and label values
  const {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin
  } = calculateGraphValues([...values], newNoOfDataPoints);

  // Call clean up function if applicable
  if (cleanup) {
    cleanup();
  }

  const draw = graphType === "webgl" ? drawGraphWebGL : drawGraph2DCanvas;

  cleanup = draw({
    canvasElement,
    points,
    xGridLines,
    yGridLines,
    positionLabels: (canvasElement: HTMLCanvasElement) => {
      positionLabels(
        canvasElement,
        dateLabels,
        priceLabels,
        xGridLines,
        yGridLines,
        margin
      );
    },
    positionActiveLegend: (
      canvasElement: HTMLCanvasElement,
      activeX: number | undefined
    ) => {
      positionActiveLegend(canvasElement, activeX, margin, points);
    }
  });
};

function App() {
  // Render on first load
  useEffect(() => {
    triggerDraw();
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
          <Button onClick={() => triggerDraw(noOfDataPoints, "2dcanvas")}>
            2D Canvas
          </Button>
          <Button onClick={() => triggerDraw(noOfDataPoints, "webgl")}>
            WebGL
          </Button>
        </Row>
        <H3>Data points:</H3>
        <Row>
          <input
            type="range"
            min={5}
            max={values.length}
            defaultValue={noOfDataPoints}
            step={1}
            onChange={e => triggerDraw(e.target.value as any)}
          ></input>
          <P>{noOfDataPoints}</P>
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
