import React, { useState } from "react";
import "./App.css";
import { PeriodAverage } from "./Components/PeriodAverage";
import PRICE_DATA from "./Data/price.json";

const VALUES = PRICE_DATA.map(({ Price }) => Price);

function App() {
  const [timespan, setTimespan] = useState(2);
  const values = VALUES.slice(0, Math.round(VALUES.length / timespan));
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <div className="App">
      <button onClick={() => setTimespan(1)}>24 hours</button>
      <button onClick={() => setTimespan(2)}>7 days</button>
      <button onClick={() => setTimespan(3)}>30 days</button>
      <button onClick={() => setTimespan(4)}>1 year</button>
      <button onClick={() => setTimespan(5)}>2 years</button>
      <PeriodAverage values={values} averageValue={averageValue} />
    </div>
  );
}

export default App;
