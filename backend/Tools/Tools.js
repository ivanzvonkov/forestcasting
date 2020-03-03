const epoch = require('epoch-time-machine')

let tools = {}

function addDays(date, days){
  const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)

  let year = copy.getUTCFullYear()
  let month = copy.getUTCMonth() + 1

  if(month < 10){
    month = "0" + month.toString()
  }

  let day = copy.getUTCDate()

  if(day < 10){
    day = "0" + day.toString()
  }

  return year + "-" + month + "-" + day
}

function parseCoordinate(coordinate) {
  return (Math.floor(coordinate*5)/5).toFixed(1);
}

tools.getValidDates = function (date, range) {
  range = range - 1
  let dates = []
  date = new Date(date)

  for(i = 0; i <= range; i++) {
    let newDate = addDays(date, i)
    dates.push(newDate)
  }

  return dates
}

tools.epochToDate = function (epochTime) {
  //yyy-mm-dd
  let date = new Date(epochTime * 1000)

  customFormat = date.customFormat("Y-m-d")
  return customFormat
}

tools.epochToHour = function (epochTime) {
  let date = new Date(epochTime * 1000)

  hour = date.customFormat("H")

  return hour
}

tools.getLocationKey = function (lat, lng) {
  return parseCoordinate(lat) + "|" + parseCoordinate(lng);
}

module.exports = tools;
