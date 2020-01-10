import React, { useEffect, useState } from "react";
import { Button } from "./Components/Base/Button";
import { GraphCard } from "./Components/Base/GraphCard";
import { H1 } from "./Components/Base/H";
import { Header } from "./Components/Base/Header";
import { P } from "./Components/Base/P";
import { Row } from "./Components/Base/Row";
import { LineGraph2DCanvas } from "./Components/Graph/2DCanvas";
import { LineGraphWebGL } from "./Components/Graph/WebGL";

function App() {
  const [priceData, setPriceData] = useState();
  const [graphToDisplay, setGraphToDisplay] = useState("2dcanvas");

  useEffect(() => {
    fetch("/BTC/6months.json")
      .then(response => response.json())
      .then(setPriceData);
  }, []);

  if (!priceData) {
    return <div>Loading...</div>;
  }

  // Filter and extract values by date
  const values = priceData.map(({ price_close, time_open }) => ({
    dateTime: time_open,
    price: price_close
  }));

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
        <Row>
          <Button
            active={graphToDisplay === "2dcanvas"}
            onClick={() => setGraphToDisplay("2dcanvas")}
          >
            2D Canvas
          </Button>
          <Button
            active={graphToDisplay === "webgl"}
            onClick={() => setGraphToDisplay("webgl")}
          >
            Web GL
          </Button>
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
