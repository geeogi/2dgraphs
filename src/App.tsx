import React, { useState } from "react";
import PRICE_DATA from "./allTime.json";
import { Button } from "./Components/Base/Button";
import { Div } from "./Components/Base/Div";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1, H3 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { drawGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { ActiveLegend, AxisLabel } from "./Components/Graph/AxisLegend";
import { Canvas } from "./Components/Graph/Canvas";
import { drawGraphWebGL } from "./Components/Graph/WebGL";
import {
  getDateLabels,
  getPriceLabels,
  dateToUnix
} from "./Components/Graph/labelUtils";
import {
  ACTIVE_LEGEND,
  LABEL_MARGIN_X,
  GRAPH_MARGIN_X,
  GRAPH_MARGIN_Y,
  SPACING_UNIT
} from "./Components/Graph/constants";
import { getScaleMethod, clamp } from "./Components/Graph/numberUtils";
import moment from "moment";

const ACTIVE_LEGEND_WIDTH = ACTIVE_LEGEND.WIDTH;
const ACTIVE_LEGEND_ID = "active-legend";

function App() {
  const [noOfDataPoints, setNoOfDataPoints] = useState(400);

  // Parse values
  const values: { dateTime: string; price: number }[] = PRICE_DATA.map(
    value => ({
      dateTime: value.date,
      price: value["price(USD)"]
    })
  );

  // Calculate number of available data points
  const noOfAvailableDataPoints = values.length;

  // Reduce array to desired number of data points
  values.splice(0, noOfAvailableDataPoints - noOfDataPoints);

  // Calculate min, max and average price
  const minPrice = Math.min(...values.map(value => value.price));
  const maxPrice = Math.max(...values.map(value => value.price));

  // Calculate min, max date
  const earliestDate = values[0].dateTime;
  const latestDate = values[values.length - 1].dateTime;

  // Define margin
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Configure x-axis labels
  const dateLabels = getDateLabels(earliestDate, latestDate, 4);

  // Configure y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels } = yConfig;

  // Configure x-axis scale helpers
  const unixMin = dateToUnix(earliestDate);
  const unixMax = dateToUnix(latestDate);
  const scaleUnixX = getScaleMethod(unixMin, unixMax, -1, 1);
  const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

  // Configure y-axis scale helpers
  const scalePriceY = getScaleMethod(priceLabels[0], maxPrice, -1, 1);

  // Configure axis grid lines in [-1,1] clip space
  const xGridLines = dateLabels.map(({ unix }) => scaleUnixX(unix / 1000));
  const yGridLines = priceLabels.map(label => scalePriceY(label));

  // Calculate point coordinates [-1,1] for each value
  const points = values.map(value => ({
    x: scaleDateX(value.dateTime),
    y: scalePriceY(value.price),
    price: value.price,
    dateTime: value.dateTime
  }));

  // Define method to position axis labels
  const positionLabels = (canvasElement: HTMLCanvasElement) => {
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];

    // y-axis
    priceLabels.forEach((label, index) => {
      const labelElement = document.getElementById(JSON.stringify(label));
      if (labelElement) {
        const yTopPercentage = 1 - (yGridLines[index] + 1) / 2;
        const yTop = yTopPercentage * (resolution[1] - 2 * margin[1]);
        labelElement.style.top = Math.floor(margin[1] + yTop - 18) + "px";
        labelElement.style.left = Math.floor(LABEL_MARGIN_X) + "px";
        labelElement.style.display = "block";
      }
    });

    // x-axis
    dateLabels.forEach(({ label }, index) => {
      const labelElement = document.getElementById(label);
      if (labelElement) {
        const xLeftPercentage = (xGridLines[index] + 1) / 2;
        const xLeft = xLeftPercentage * (resolution[0] - 2 * margin[0]);
        labelElement.style.left = Math.floor(xLeft - 10) + "px";
        labelElement.style.top = Math.floor(resolution[1] - 19) + "px";
        labelElement.style.display = "block";
      }
    });
  };

  const positionActiveLegend = (
    canvasElement: HTMLCanvasElement,
    activeX: number
  ) => {
    // Fetch resolution
    const resolution: [number, number] = [
      canvasElement.offsetWidth,
      canvasElement.offsetHeight
    ];
    // Calculate graph width and height in px
    const graphWidth = resolution[0] - 2 * margin[0];
    const graphHeight = resolution[1] - 2 * margin[1];
    // Show or hide active legend
    const activeLegendElement = document.getElementById(ACTIVE_LEGEND_ID);
    if (activeLegendElement) {
      if (activeX) {
        // Scale activeX to [-1,1] clip space
        const clipSpaceActiveX = activeX
          ? ((activeX - margin[0]) / graphWidth) * 2 - 1
          : undefined;
        if (clipSpaceActiveX) {
          // Fetch nearest point to activeX
          const [{ x, y, dateTime, price }] = [...points].sort((a, b) => {
            return (
              Math.abs(a.x - clipSpaceActiveX) -
              Math.abs(b.x - clipSpaceActiveX)
            );
          });

          // Scale x from [-1,1] clip space to screen resolution
          const nearXGraphX = margin[0] + ((x + 1) / 2) * graphWidth;
          const rawLegendX = nearXGraphX - ACTIVE_LEGEND_WIDTH / 2;
          const legendLeftMax = 0;
          const legendRightMax = resolution[0] - ACTIVE_LEGEND_WIDTH;
          const legendX = clamp(rawLegendX, legendLeftMax, legendRightMax);

          // Scale y from [-1,1] clip space to screen resolution
          const nearYGraphY = margin[1] + ((y + 1) / 2) * graphHeight;
          const baseLegendY = resolution[1] - (margin[1] + 2 * SPACING_UNIT);
          const altLegendY = nearYGraphY - 5 * SPACING_UNIT;
          const useBase = baseLegendY > nearYGraphY;
          const legendY = useBase ? baseLegendY : altLegendY;

          // Format display variables
          const displayPrice = Math.round(price);
          const displayDate = moment(dateTime).format("DD MMM YY");

          // Update active legend DOM element
          activeLegendElement.style.left = legendX + "px";
          activeLegendElement.style.top = resolution[1] - legendY + "px";
          activeLegendElement.textContent = `$${displayPrice} – ${displayDate}`;
          activeLegendElement.style.display = "block";
        } else {
          activeLegendElement.style.display = "none";
        }
      }
    }
  };

  // Cache cleanup function to be called if graph is re-rendered
  let cleanup: () => void;

  // Define render method to call main graph drawing methods
  const render = (id: string) => {
    if (cleanup) {
      cleanup();
    }

    if (id === "2dcanvas") {
      cleanup = drawGraph2DCanvas({
        values,
        minPrice,
        maxPrice,
        earliestDate,
        latestDate,
        canvasId: "graph-canvas",
        dateLabels,
        priceLabels,
        positionLabels,
        positionActiveLegend,
        points,
        xGridLines,
        yGridLines
      });
    }
    if (id === "webgl") {
      cleanup = drawGraphWebGL({
        values,
        minPrice,
        maxPrice,
        earliestDate,
        latestDate,
        canvasId: "graph-canvas",
        dateLabels,
        priceLabels,
        xGridLines,
        yGridLines,
        points,
        positionLabels,
        positionActiveLegend
      });
    }
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
          <Button onClick={() => render("2dcanvas")}>2D Canvas</Button>
          <Button onClick={() => render("webgl")}>WebGL</Button>
        </Row>
        <H3>Data points:</H3>
        <Row>
          <input
            type="range"
            min={10}
            max={noOfAvailableDataPoints}
            value={noOfDataPoints}
            step={1}
            onChange={e => setNoOfDataPoints(e.target.value as any)}
          ></input>
          <P>{noOfDataPoints}</P>
        </Row>
        <div>
          <Div position="relative">
            <Canvas id="graph-canvas" />
            {priceLabels.map(label => (
              <AxisLabel
                id={JSON.stringify(label)}
                key={JSON.stringify(label)}
                style={{ display: "none" }}
              >
                ${label}
              </AxisLabel>
            ))}
            {dateLabels.map(({ label }) => (
              <AxisLabel id={label} key={label} style={{ display: "none" }}>
                {label}
              </AxisLabel>
            ))}
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
