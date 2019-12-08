import moment from "moment";

export const DATE_FORMAT = "D MMM";

export const dateToUnix = (dateString: string) => moment(dateString).unix();

const roundUpToNearest = (value: number, multiple: number) => {
  return Math.ceil(value / multiple) * multiple;
};

const roundDownToNearest = (value: number, multiple: number) => {
  return Math.floor(value / multiple) * multiple;
};

export const priceLabels = (
  minPrice: number,
  maxPrice: number,
  numberOfLabels = 5
) => {
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

export const dateLabels = (
  earliestDate: string,
  latestDate: string,
  minNumberOfLabels: number
) => {
  let dateLabels = [];
  let displayFormat = "MMM YY";

  let momentToAdd = moment(earliestDate)
    .startOf("month")
    .add(1, "month");

  const tryLabels = (period: any, amount: number) => {
    const labelArray: any[] = [];
    let momentToAdd = moment(earliestDate)
      .startOf(period)
      .add(1, period);
    while (momentToAdd.isBefore(moment(latestDate))) {
      labelArray.push(momentToAdd.unix() * 1000);
      momentToAdd = momentToAdd.add(amount, period);
    }
    return labelArray;
  };

  // 6 month intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("month", 6);
  }

  // 3 month intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("month", 3);
  }

  // 2 month intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("month", 2);
  }

  // 1 month intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("month", 1);
  }

  // 2 week intervals
  if (dateLabels.length < minNumberOfLabels) {
    displayFormat = "Do MMM";
    dateLabels = tryLabels("week", 2);
  }

  // 1 week intervals
  if (dateLabels.length < minNumberOfLabels) {
    displayFormat = "Do MMM";
    dateLabels = tryLabels("week", 1);
  }

  // 4 day intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("day", 4);
  }

  // 2 day intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("day", 2);
  }

  // 1 day intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("day", 1);
  }

  return { dateLabels, displayFormat };
};
