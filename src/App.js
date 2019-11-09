import React, { useState } from "react";
import "./App.css";
import { Button } from "./Components/Button";
import { Flex } from "./Components/Flex";
import { ResponsiveGraph } from "./Components/ResponsiveGraph";
import PRICE_DATA from "./Data/price.json";

const VALUES = PRICE_DATA.map(({ Price }) => Price);

function App() {
  const [timespan, setTimespan] = useState(2);
  const values = VALUES.slice(
    VALUES.length - Math.round(VALUES.length / timespan),
    VALUES.length
  );
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return (
    <div className="App">
      <div style={{ width: "80%" }}>
        <Flex>
          <Button onClick={() => setTimespan(1)} active={timespan === 1}>
            1y
          </Button>
          <Button onClick={() => setTimespan(2)} active={timespan === 2}>
            30d
          </Button>
          <Button onClick={() => setTimespan(24)} active={timespan === 24}>
            7d
          </Button>
          <Button onClick={() => setTimespan(96)} active={timespan === 96}>
            24h
          </Button>
        </Flex>
        <ResponsiveGraph
          values={values}
          maxValue={maxValue}
          minValue={minValue}
          averageValue={averageValue}
        ></ResponsiveGraph>
      </div>
    </div>
  );
}

export default App;
