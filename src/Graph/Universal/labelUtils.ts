import moment from "moment";

export const dateToUnix = (dateString: string) =>
  new Date(dateString).getTime() / 1000;

const roundUpToNearest = (value: number, multiple: number) => {
  return Math.ceil(value / multiple) * multiple;
};

const roundDownToNearest = (value: number, multiple: number) => {
  return Math.floor(value / multiple) * multiple;
};

export const getPriceLabels = (
  minPrice: number,
  maxPrice: number,
  numberOfLabels = 5
) => {
  const perfectStep = (maxPrice - minPrice) / numberOfLabels;
  const [multiple] = [100, 250, 500, 1000].sort((a, b) => {
    return Math.abs(a - perfectStep) - Math.abs(b - perfectStep);
  });
  const firstLabel = roundDownToNearest(minPrice, multiple);
  const lastLabel = roundDownToNearest(maxPrice, multiple);
  const labelRange = lastLabel - firstLabel;
  const labelStep = roundUpToNearest(labelRange / numberOfLabels, multiple);
  const priceLabels = [];
  while (priceLabels.length <= numberOfLabels) {
    const nextLabel = firstLabel + labelStep * priceLabels.length;
    if (nextLabel <= lastLabel) {
      priceLabels.push(firstLabel + labelStep * priceLabels.length);
    } else {
      break;
    }
  }
  return { priceLabels };
};

export const getDateLabels = (
  earliestDate: string,
  latestDate: string,
  minNumberOfLabels: number
) => {
  let dateLabels: { unix: number; label: string }[] = [];
  let displayFormat = "MMM 'YY";

  const tryLabels = (period: any, amount: number) => {
    const labelArray: { unix: number; label: string }[] = [];
    let momentToAdd = moment(earliestDate)
      .startOf(period)
      .add(1, period);
    while (momentToAdd.isBefore(moment(latestDate))) {
      labelArray.push({
        unix: momentToAdd.unix() * 1000,
        label: momentToAdd.format(displayFormat)
      });
      momentToAdd = momentToAdd.add(amount, period);
    }
    return labelArray;
  };
  // 10 year intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("year", 10);
  }

  // 5 year intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("year", 5);
  }

  // 2 year intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("year", 2);
  }

  // 1 year intervals
  if (dateLabels.length < minNumberOfLabels) {
    dateLabels = tryLabels("year", 1);
  }

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

  return dateLabels;
};
