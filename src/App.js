import moment from "moment";
import React, { useState } from "react";
import { Button } from "./Components/Button";
import { Column } from "./Components/Column";
import { InteractiveGraph } from "./Components/Graph/Containers/InteractiveGraph";
import { PaddedGraph } from "./Components/Graph/Containers/PaddedGraph";
import { ResponsiveGraph } from "./Components/Graph/Containers/ResponsiveGraph";
import { PeriodAverage } from "./Components/Graph/PeriodAverage";
import { H3 } from "./Components/H";
import { Row } from "./Components/Row";
import BITCOIN_PRICE_DATA from "./Data/bitcoin-price.json";

const timeScales = {
  "1year": {
    startDate: moment().subtract(1, "year"),
    step: ""
  },
  "6months": {
    startDate: moment().subtract(6, "months"),
    step: ""
  },
  "30days": {
    startDate: moment().subtract(30, "days"),
    step: ""
  },
  "7days": {
    startDate: moment().subtract(7, "days"),
    step: ""
  }
};

function App() {
  const [earliestDate, setEarliestDate] = useState(
    timeScales["30days"].startDate
  );

  // Filter and extract values by date
  const values = BITCOIN_PRICE_DATA.data.quotes
    .filter(({ time_open }) => moment(time_open).isAfter(earliestDate))
    .map(({ quote }) => quote.USD.open);

  // Calculate min, max and average
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return (
    <main>
      <Column>
        <H3>Period average</H3>
        <Row>
          <Button
            onClick={() => setEarliestDate(timeScales["1year"].startDate)}
            active={earliestDate === timeScales["1year"].startDate}
          >
            1y
          </Button>
          <Button
            onClick={() => setEarliestDate(timeScales["6months"].startDate)}
            active={earliestDate === timeScales["6months"].startDate}
          >
            6m
          </Button>
          <Button
            onClick={() => setEarliestDate(timeScales["30days"].startDate)}
            active={earliestDate === timeScales["30days"].startDate}
          >
            30d
          </Button>
          <Button
            onClick={() => setEarliestDate(timeScales["7days"].startDate)}
            active={earliestDate === timeScales["7days"].startDate}
          >
            7d
          </Button>
        </Row>
        <PaddedGraph>
          <InteractiveGraph>
            {({ activeX, activeY, isClicked }) => (
              <ResponsiveGraph>
                {({ height, width }) => (
                  <PeriodAverage
                    activeX={activeX}
                    activeY={activeY}
                    isClicked={isClicked}
                    values={values}
                    maxValue={maxValue}
                    minValue={minValue}
                    averageValue={averageValue}
                    canvasHeight={height - 8}
                    canvasWidth={width - 8}
                  />
                )}
              </ResponsiveGraph>
            )}
          </InteractiveGraph>
        </PaddedGraph>
      </Column>
    </main>
  );
}

export default App;
