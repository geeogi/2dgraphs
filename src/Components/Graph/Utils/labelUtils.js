import moment from "moment";

export const DATE_FORMAT = "D MMM";

export const dateToUnix = dateString => moment(dateString).unix();

const roundUpToNearest = (value, multiple) => {
  return Math.ceil(value / multiple) * multiple;
};

const roundDownToNearest = (value, multiple) => {
  return Math.floor(value / multiple) * multiple;
};

export const priceLabels = (minPrice, maxPrice, numberOfLabels = 5) => {
  const perfectStep = (maxPrice - minPrice) / numberOfLabels;
  const multiple = [100, 250, 500, 1000].sort((a, b) => {
    return Math.abs(a - perfectStep) - Math.abs(b - perfectStep);
  })[0];
  const firstLabel = roundDownToNearest(minPrice, multiple);
  const labelRange = maxPrice - firstLabel;
  const labelStep = roundUpToNearest(
    labelRange / (numberOfLabels - 1),
    multiple
  );
  return [...Array(numberOfLabels)].map((_, index) => {
    if (index === 0) {
      return firstLabel;
    } else {
      return firstLabel + labelStep * index;
    }
  });
};

export const dateLabels = (earliestDate, latestDate) => {
  return [
    moment(earliestDate)
      .endOf("month")
      .unix() * 1000
  ];
};
