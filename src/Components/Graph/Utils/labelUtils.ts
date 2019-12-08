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

export const dateLabels = (earliestDate: string, latestDate: string) => {
  const numberOfLabels = 5;

  let dateLabels = [];

  const firstMoment = moment(earliestDate);
  const lastMoment = moment(latestDate);

  let momentToAdd = firstMoment.startOf("month").add(1, "month");

  while (momentToAdd.isBefore(lastMoment)) {
    dateLabels.push(momentToAdd.unix() * 1000);
    momentToAdd = momentToAdd.add(1, "month");
  }

  if (dateLabels.length < numberOfLabels) {
    momentToAdd = firstMoment.startOf("week").add(1, "week");
    while (momentToAdd.isBefore(lastMoment)) {
      dateLabels.push(momentToAdd.unix() * 1000);
      momentToAdd = momentToAdd.add(1, "week");
    }
  }

  return dateLabels;
};
