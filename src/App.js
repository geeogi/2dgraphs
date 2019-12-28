import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button } from "./Components/Button";
import { PeriodAverage } from "./Components/Graph/PeriodAverage";
import { Graph, GraphContainer } from "./Components/GraphContainer";
import { H1, H4 } from "./Components/H";
import { Header } from "./Components/Header";
import { P } from "./Components/P";
import { Row } from "./Components/Row";

const currentMoment = () => moment("2019-12-27T00:00:00.0000000Z");

const timeScales = [
  {
    time_start_moment: currentMoment().subtract(1, "year"),
    period_id: "2DAY",
    display: "1y",
    key: "1year"
  },
  {
    time_start_moment: currentMoment().subtract(6, "months"),
    period_id: "1DAY",
    display: "6m",
    key: "6months"
  },
  {
    time_start_moment: currentMoment().subtract(30, "days"),
    period_id: "4HRS",
    display: "30d",
    key: "30days"
  },
  {
    time_start_moment: currentMoment().subtract(7, "days"),
    period_id: "1HRS",
    display: "7d",
    key: "7days"
  }
];

function App() {
  const [selectedTimeScaleKey, setSelectedTimeScaleKey] = useState("6months");
  const [priceData, setPriceData] = useState();

  useEffect(() => {
    const { time_start, period_id } = timeScales.find(
      ({ key }) => key === selectedTimeScaleKey
    );
    const useLiveApi = false;
    const URL = useLiveApi
      ? [
          `https://rest.coinapi.io/v1/ohlcv/BTC/USD/history`,
          `?period_id=${period_id}`,
          `&limit=500`,
          `&time_start=${time_start.utc().format()}`,
          `&apikey=1882DEE6-EF4F-43DF-928B-22496DCFE94A`
        ].join("")
      : `/BTC/${selectedTimeScaleKey}.json`;
    fetch(URL)
      .then(response => response.json())
      .then(data => setTimeout(() => setPriceData(data), 1000));
  }, [selectedTimeScaleKey]);

  if (!priceData) {
    return <div>Loading...</div>;
  }

  // Filter and extract values by date
  const values = priceData
    .filter(({ time_open }) =>
      moment(time_open).isAfter(
        timeScales.find(({ key }) => key === selectedTimeScaleKey)
          .time_start_moment
      )
    )
    .map(({ price_close, time_open }) => ({
      dateTime: time_open,
      price: price_close
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
      <Header>
        <H1>CoinTales</H1>
        <P>Mock data with throttled network speed</P>
      </Header>
      <GraphContainer>
        <H4>Bitcoin (BTC): $7,200.44 USD</H4>
        <Row padding={"0 8px"}>
          {timeScales.map(timeScale => (
            <Button
              onClick={() => setSelectedTimeScaleKey(timeScale.key)}
              active={selectedTimeScaleKey === timeScale.key}
            >
              {timeScale.display}
            </Button>
          ))}
        </Row>
        <Graph>
          <PeriodAverage
            values={values}
            minPrice={minPrice}
            maxPrice={maxPrice}
            averagePrice={averagePrice}
            earliestDate={earliestDate}
            latestDate={latestDate}
          />
        </Graph>
      </GraphContainer>
      <canvas id="my_Canvas" />
    </main>
  );
}

export default App;
