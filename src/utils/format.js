import moment from 'moment';

export const displayLongDate = (date) => {
  return moment(date).format("YYYY-MM-DD HH:mm");
};

export const displayShortDate = (date) => {
  return moment(date).format("MM-DD");
}

export const displayMediumDate = (date) => {
  return moment(date).format("YYYY-MM-DD");
}

export const currencyFormat = (sym, number) => {
  return `${sym} ${number.toFixed(2)}`;
};

const statuses = {
  OPN: "Open",
  STL: "Settled",
  DIS: "Dispute",
};

export const displayStatus = (status) => statuses[status];

export const statusClass = (status) => {
  return "status status-" + statuses[status].toLowerCase();
};