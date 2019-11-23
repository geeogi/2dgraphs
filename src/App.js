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

const currentMoment = () => moment("2019-11-11T23:59:59.999Z");

const timeScales = {
  "1year": {
    startDate: currentMoment().subtract(1, "year"),
    step: ""
  },
  "6months": {
    startDate: currentMoment().subtract(6, "months"),
    step: ""
  },
  "30days": {
    startDate: currentMoment().subtract(30, "days"),
    step: ""
  },
  "7days": {
    startDate: currentMoment().subtract(7, "days"),
    step: ""
  }
};

function App() {
  const [desiredEarliestDate, setDesiredEarliestDate] = useState(
    timeScales["30days"].startDate
  );

  // Filter and extract values by date
  const values = BITCOIN_PRICE_DATA.data.quotes
    .filter(({ time_open }) => moment(time_open).isAfter(desiredEarliestDate))
    .map(({ quote }) => ({
      dateTime: quote.USD.timestamp,
      price: quote.USD.open
    }));

  // Calculate min, max and average price
  const averagePrice =
    values.map(value => value.price).reduce((a, b) => a + b, 0) / values.length;
  const minPrice = Math.min(...values.map(value => value.price));
  const maxPrice = Math.max(...values.map(value => value.price));

  // Calculate min, max date
  const earliestDate = values[0].dateTime;
  const latestDate = values[values.length - 1].dateTime;

  return (
    <main>
      <Column>
        <H3>Period average</H3>
        <Row>
          <Button
            onClick={() =>
              setDesiredEarliestDate(timeScales["1year"].startDate)
            }
            active={desiredEarliestDate === timeScales["1year"].startDate}
          >
            1y
          </Button>
          <Button
            onClick={() =>
              setDesiredEarliestDate(timeScales["6months"].startDate)
            }
            active={desiredEarliestDate === timeScales["6months"].startDate}
          >
            6m
          </Button>
          <Button
            onClick={() =>
              setDesiredEarliestDate(timeScales["30days"].startDate)
            }
            active={desiredEarliestDate === timeScales["30days"].startDate}
          >
            30d
          </Button>
          <Button
            onClick={() =>
              setDesiredEarliestDate(timeScales["7days"].startDate)
            }
            active={desiredEarliestDate === timeScales["7days"].startDate}
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
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    averagePrice={averagePrice}
                    earliestDate={earliestDate}
                    latestDate={latestDate}
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
