import dayjs from "dayjs";

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

export const getDateLabels = (earliestDate: number, latestDate: number) => {
  const oneYear = 31536000;
  const oneMonth = 2628000;
  const oneWeek = 604800;
  const oneDay = 86400;

  const dateRange = latestDate - earliestDate;

  let displayFormat = "MMM 'YY";

  const getLabels = (period: any, amount: number) => {
    const labelArray: { unix: number; label: string }[] = [];
    const latestDayJs = dayjs.unix(latestDate);
    // Date being added
    let dateToAdd = dayjs
      .unix(earliestDate)
      .startOf(period)
      .add(1, period);

    // Loop while date is within date range
    while (dateToAdd.isBefore(latestDayJs)) {
      labelArray.push({
        unix: dateToAdd.unix() * 1000,
        label: dateToAdd.format(displayFormat)
      });
      dateToAdd = dateToAdd.add(amount, period);
    }

    return labelArray;
  };

  // 10 year intervals
  if (dateRange / 2 > 10 * oneYear) {
    return getLabels("year", 10);
  }

  // 5 year intervals
  if (dateRange / 2 > 5 * oneYear) {
    return getLabels("year", 5);
  }

  // 2 year intervals
  if (dateRange / 2 > 2 * oneYear) {
    return getLabels("year", 2);
  }

  // 1 year intervals
  if (dateRange / 2 > 1 * oneYear) {
    return getLabels("year", 1);
  }

  // 6 month intervals
  if (dateRange / 2 > 6 * oneMonth) {
    return getLabels("month", 6);
  }

  // 3 month intervals
  if (dateRange / 2 > 3 * oneMonth) {
    return getLabels("month", 3);
  }

  // 2 month intervals
  if (dateRange / 2 > 2 * oneMonth) {
    return getLabels("month", 2);
  }

  // 1 month intervals
  if (dateRange / 2 > 1 * oneMonth) {
    return getLabels("month", 1);
  }

  displayFormat = "D MMM";

  // 2 week intervals
  if (dateRange / 2 > 2 * oneWeek) {
    return getLabels("week", 2);
  }

  // 1 week intervals
  if (dateRange / 2 > 1 * oneWeek) {
    return getLabels("week", 1);
  }

  // 4 day intervals
  if (dateRange / 2 > 4 * oneDay) {
    return getLabels("day", 4);
  }

  // 2 day intervals
  if (dateRange / 2 > 2 * oneDay) {
    return getLabels("day", 2);
  }

  // 1 day intervals
  if (dateRange / 2 > 1 * oneDay) {
    return getLabels("day", 1);
  }
};
