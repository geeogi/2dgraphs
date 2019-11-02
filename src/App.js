import React, { useState } from "react";
import "./App.css";
import { PeriodAverage } from "./Components/PeriodAverage";
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
      <button onClick={() => setTimespan(96)}>24 hours</button>
      <button onClick={() => setTimespan(24)}>7 days</button>
      <button onClick={() => setTimespan(2)}>30 days</button>
      <button onClick={() => setTimespan(1)}>1 year</button>
      <PeriodAverage
        values={values}
        maxValue={maxValue}
        minValue={minValue}
        averageValue={averageValue}
      />
    </div>
  );
}

export default App;
