import { GRAPH_MARGIN_X, GRAPH_MARGIN_Y } from "./constants";
import { dateToUnix, getDateLabels, getPriceLabels } from "./labelUtils";
import { getScaleMethod } from "./numberUtils";

/**
 * Calculates axis labels, line coordinates and grid line coordinates
 * @param values
 * @param noOfDataPoints
 * @returns { priceLabels, dateLabels, xGridLines, yGridLines, points, margin }
 */
export const getGraphConfig = (
  values: { dateTime: string; price: number }[],
  noOfDataPoints: number
) => {
  // Calculate number of available data points
  const noOfAvailableDataPoints = values.length;

  // Reduce array to desired number of data points
  values.splice(0, noOfAvailableDataPoints - noOfDataPoints);

  // Calculate min, max and average price
  const minPrice = Math.min(...values.map(value => value.price));
  const maxPrice = Math.max(...values.map(value => value.price));

  // Calculate min, max date
  const earliestDate = values[0].dateTime;
  const latestDate = values[values.length - 1].dateTime;

  // Define margin
  const margin: [number, number] = [GRAPH_MARGIN_X, GRAPH_MARGIN_Y];

  // Configure x-axis labels
  const dateLabels = getDateLabels(earliestDate, latestDate, 4);

  // Configure y-axis labels
  const yConfig = getPriceLabels(minPrice, maxPrice, 4);
  const { priceLabels } = yConfig;

  // Configure x-axis scale helpers
  const unixMin = dateToUnix(earliestDate);
  const unixMax = dateToUnix(latestDate);
  const scaleUnixX = getScaleMethod(unixMin, unixMax, -1, 1);
  const scaleDateX = (date: string) => scaleUnixX(dateToUnix(date));

  // Configure y-axis scale helpers
  const scalePriceY = getScaleMethod(priceLabels[0], maxPrice, -1, 1);

  // Configure axis grid lines in [-1,1] clip space
  const xGridLines = dateLabels.map(({ unix }) => scaleUnixX(unix / 1000));
  const yGridLines = priceLabels.map(label => scalePriceY(label));

  // Calculate point coordinates [-1,1] for each value
  const points = values.map(value => ({
    x: scaleDateX(value.dateTime),
    y: scalePriceY(value.price),
    price: value.price,
    dateTime: value.dateTime,
    unix: dateToUnix(value.dateTime)
  }));

  return {
    priceLabels,
    dateLabels,
    xGridLines,
    yGridLines,
    points,
    margin,
    minPrice,
    maxPrice,
    minUnix: points[0].unix,
    maxUnix: points[points.length - 1].unix
  };
};
