import React, { useState } from "react";
import { Button } from "./Components/Button";
import { Column } from "./Components/Column";
import { InteractiveGraph } from "./Components/Graph/Containers/InteractiveGraph";
import { PaddedGraph } from "./Components/Graph/Containers/PaddedGraph";
import { PeriodAverage } from "./Components/Graph/PeriodAverage";
import { ResponsiveGraph } from "./Components/Graph/Containers/ResponsiveGraph";
import { H3 } from "./Components/H";
import { Row } from "./Components/Row";
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
    <main>
      <Column>
        <H3>Period average</H3>
        <Row>
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
