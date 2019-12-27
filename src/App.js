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

const timeScales = {
  "1year": {
    time_start: currentMoment().subtract(1, "year"),
    period_id: "1DAY"
  },
  "6months": {
    time_start: currentMoment().subtract(6, "months"),
    period_id: "12HRS"
  },
  "30days": {
    time_start: currentMoment().subtract(30, "days"),
    period_id: "2HRS"
  },
  "7days": {
    time_start: currentMoment().subtract(7, "days"),
    period_id: "30MIN"
  }
};

function App() {
  const [selectedTimeScaleKey, setSelectedTimeScaleKey] = useState("6months");
  const [priceData, setPriceData] = useState();

  useEffect(() => {
    const { time_start, period_id } = timeScales[selectedTimeScaleKey];
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
      moment(time_open).isAfter(timeScales[selectedTimeScaleKey].time_start)
    )
    .map(({ price_close, time_open }) => ({
      dateTime: time_open,
      price: price_close
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

  return (
    <main>
      <Header>
        <H1>CoinTales</H1>
        <P>Mock data with throttled network speed</P>
      </Header>
      <GraphContainer>
        <H4>Bitcoin (BTC): $7,200.44 USD</H4>
        <Row padding={"0 8px"}>
          <Button
            onClick={() => setSelectedTimeScaleKey("1year")}
            active={selectedTimeScaleKey === "1year"}
          >
            1y
          </Button>
          <Button
            onClick={() => setSelectedTimeScaleKey("6months")}
            active={selectedTimeScaleKey === "6months"}
          >
            6m
          </Button>
          <Button
            onClick={() => setSelectedTimeScaleKey("30days")}
            active={selectedTimeScaleKey === "30days"}
          >
            30d
          </Button>
          <Button
            onClick={() => setSelectedTimeScaleKey("7days")}
            active={selectedTimeScaleKey === "7days"}
          >
            7d
          </Button>
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
    </main>
  );
}

export default App;
