import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "../../Config/constants";
import { GraphPoints } from "../../types";
import { getDateLabels, getPriceLabels } from "./labelUtils";
import { getScaleMethod } from "./numberUtils";

/**
 * Calculates axis labels, line coordinates and grid line coordinates
 * @param values
 * @param noOfDataPoints
 * @returns { priceLabels, dateLabels, xGridLines, yGridLines, points, margin }
 */
export const getGraphConfig = (args: {
  values?: { dateTime: number; price: number }[];
}) => {
  // Determine the base for the config
  const { values } = args;

  // Calculate min, max and average price
  const minPrice = Math.min(...values.map(value => value.price));
  const maxPrice = Math.max(...values.map(value => value.price));

  // Calculate min, max date
  const earliestDate = values[0].dateTime;
  const latestDate = values[values.length - 1].dateTime;

  // Define margin
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Configure x-axis labels
  const dateLabels = getDateLabels(earliestDate, latestDate);

  // Configure y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels } = yConfig;

  // Configure x-axis scale helpers
  const unixMin = earliestDate;
  const unixMax = latestDate;
  const scaleUnixX = getScaleMethod(unixMin, unixMax, -1, 1);

  // Configure y-axis scale helpers
  const scalePriceY = getScaleMethod(priceLabels[0], maxPrice, -1, 1);

  // Configure axis grid lines in [-1,1] clip space
  const xGridLines = dateLabels.map(({ unix }) => scaleUnixX(unix / 1000));
  const yGridLines = priceLabels.map(label => scalePriceY(label));

  // Calculate point coordinates [-1,1] if these weren't provided
  const points: GraphPoints = values.map(value => ({
    x: scaleUnixX(value.dateTime),
    y: scalePriceY(value.price),
    price: value.price,
    dateTime: value.dateTime
  }));

  return {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin,
    minYValue: priceLabels[0],
    maxYValue: maxPrice,
    minXValue: points[0].dateTime,
    maxXValue: points[points.length - 1].dateTime
  };
};
