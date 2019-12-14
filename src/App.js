import moment from "moment";
import React, { useState } from "react";
import { Button } from "./Components/Button";
import { InteractiveGraph } from "./Components/Graph/Containers/InteractiveGraph";
import { ResponsiveGraph } from "./Components/Graph/Containers/ResponsiveGraph";
import { PeriodAverage } from "./Components/Graph/PeriodAverage";
import { H1, H4, H3 } from "./Components/H";
import { Row } from "./Components/Row";
import BITCOIN_PRICE_DATA from "./Data/bitcoin-price.json";
import { GraphContainer } from "./Components/GraphContainer";
import { Header } from "./Components/Header";
import { P } from "./Components/P";

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
    timeScales["6months"].startDate
  );

  // Filter and extract values by date
  const values = BITCOIN_PRICE_DATA.data.quotes
    .filter(({ time_open }) => moment(time_open).isAfter(desiredEarliestDate))
    .map(({ quote }) => ({
      dateTime: moment(quote.USD.timestamp)
        .utc()
        .startOf("day")
        .format(),
      price: quote.USD.open
    }))
    .sort((a, b) => moment(a.dateTime).unix() - moment(b.dateTime).unix());

  // Calculate min, max and average price
  const averagePrice =
    values.map(value => value.price).reduce((a, b) => a + b, 0) / values.length;
  const minPrice = Math.min(...values.map(value => value.price));
  const maxPrice = Math.max(...values.map(value => value.price));

  // Calculate min, max date
  const earliestDate = values[0].dateTime;
  const latestDate = values[values.length - 1].dateTime;

  console.log(`values: ${values}`);
  console.log(`minPrice: ${minPrice}`);
  console.log(`maxPrice: ${maxPrice}`);
  console.log(`averagePrice: ${averagePrice}`);
  console.log(`earliestDate: ${earliestDate}`);
  console.log(`latestDate: ${latestDate}`);

  return (
    <main>
      <Header>
        <H1>
          CoinTales
          <span aria-label="icon" role="img">
            🍃
          </span>
        </H1>
        <P>Quick crypto charts</P>
      </Header>
      <GraphContainer>
        <H4>Bitcoin (BTC): $7,138.31 USD (-1.71%)</H4>
        <Row padding={"0 8px"}>
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
                  canvasHeight={height}
                  canvasWidth={width}
                />
              )}
            </ResponsiveGraph>
          )}
        </InteractiveGraph>
      </GraphContainer>
    </main>
  );
}

export default App;
