import React, { useState } from "react";
import "./App.css";
import { PeriodAverage } from "./Components/PeriodAverage";
import PRICE_DATA from "./Data/price.json";
import { Flex } from "./Components/Flex";
import { Button } from "./Components/Button";

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
      <div>
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
        <PeriodAverage
          values={values}
          maxValue={maxValue}
          minValue={minValue}
          averageValue={averageValue}
        />
      </div>
    </div>
  );
}

export default App;
