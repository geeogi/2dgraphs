import React, { useState } from "react";
import PRICE_DATA from "./allTime.json";
import { Button } from "./Components/Base/Button";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1, H3 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { LineGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { LineGraphWebGL } from "./Components/Graph/WebGL";

function App() {
  const [graphToDisplay, setGraphToDisplay] = useState("webgl");
  const [startFrom, setStartFrom] = useState(0);

  // Parse values
  const values = PRICE_DATA.map(value => ({
    dateTime: value.date,
    price: value["price(USD)"]
  }));

  // Calculate number of available data points
  const numberOfAvailableDataPoints = values.length;

  // Splice values
  values.splice(0, startFrom);

  // Calculate number of active data points
  const numberOfDataPoints = values.length;

  // Calculate min, max and average price
  const minPrice = Math.min(...values.map(value => value.price));
  const maxPrice = Math.max(...values.map(value => value.price));

  // Calculate min, max date
  const earliestDate = values[0].dateTime;
  const latestDate = values[values.length - 1].dateTime;

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
            active={graphToDisplay === "webgl"}
            onClick={() => setGraphToDisplay("webgl")}
          >
            Web GL
          </Button>
          <Button
            active={graphToDisplay === "2dcanvas"}
            onClick={() => setGraphToDisplay("2dcanvas")}
          >
            2D Canvas
          </Button>
        </Row>
        <H3>Data points:</H3>
        <Row>
          <input
            type="range"
            min="0"
            max={numberOfAvailableDataPoints - 10}
            value={startFrom}
            onChange={e => setStartFrom(e.target.value)}
          ></input>
          <P>Number of data points: {numberOfDataPoints}</P>
        </Row>
        {graphToDisplay === "2dcanvas" && (
          <LineGraph2DCanvas
            values={values}
            minPrice={minPrice}
            maxPrice={maxPrice}
            earliestDate={earliestDate}
            latestDate={latestDate}
          />
        )}
        {graphToDisplay === "webgl" && (
          <LineGraphWebGL
            values={values}
            minPrice={minPrice}
            maxPrice={maxPrice}
            earliestDate={earliestDate}
            latestDate={latestDate}
          />
        )}
      </GraphCard>
    </main>
  );
}

export default App;
