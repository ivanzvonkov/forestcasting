const requests = require("request")
const WeatherData  = require('../Schemas/WeatherData.js')
const dotenv = require('dotenv')
const epoch = require('epoch-time-machine')
dotenv.config()
const api_key = process.env.API_KEY

let weatherAPI = {}

function get_weather(lat, lng){
    url = 'https://api.darksky.net/forecast/'+ api_key + '/' + lat + ',' + lng +"?exclude=minutely,flags,alerts,currently"
    return new Promise(function(resolve, reject) {
      requests(url, {json : true}, (err, res, body) => {
        resolve(body)
    })
  })
}

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

function getValidDates(date, range) {
  range = range - 1
  let dates = []
  date = new Date(date)

  for(i = 0; i <= range; i++) {
    let newDate = addDays(date, i)
    dates.push(newDate)
  }

  return dates
}

function epochToDate(epochTime) {
  //yyy-mm-dd
  let date = new Date(epochTime * 1000)

  customFormat = date.customFormat("Y-m-d")
  return customFormat
}

weatherAPI.findWeatherData = async function (lat, lng, date, range){
    let weather = await get_weather(lat, lng)
    let dates = getValidDates(date, range)
    let weatherDays = weather["daily"]["data"].filter(entry => dates.includes(epochToDate(entry["time"])));
    let results = []
    weatherDays.forEach(entry => {
      results.push(new WeatherData(
        epochToDate(entry["time"]), //yyyy-mm-dd
        entry["temperatureMax"],
        entry["temperatureMin"],
        entry["precipAccumulation"], // in cm
        entry["precipType"],
        entry["snow_depth"],
        entry["windSpeed"],
        entry["windGust"],
        entry["windBearing"],
        entry["humidity"],
        entry["dewPoint"]
      ))
    })
    return results
  }

module.exports = weatherAPI;
