const date = new Date();
module.exports = {
  sendAPIResponse: function (res, data) {
    res.statusCode = data.statusCode;
    res.setHeader("Content-Type", "application/json");
    res.write(
      data.result
        ? JSON.stringify(data.result)
        : data.error
        ? JSON.stringify(data.error)
        : data
    );
    res.end();
  },
  padTo2Digits: function (num) {
    return num.toString().padStart(2, "0");
  },

  formatDate: function (date = new Date()) {
    return [
      date.getFullYear(),
      this.padTo2Digits(date.getMonth() + 1),
      this.padTo2Digits(date.getDate()),
    ].join("-");
  },

  subtractMonths: function (numOfMonths, date = new Date()) {
    date.setMonth(date.getMonth() - numOfMonths);
    return this.formatDate(date);
  },
};
