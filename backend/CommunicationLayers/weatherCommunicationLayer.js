const requests = require("request")
const WeatherData  = require('../Schemas/WeatherData.js')
const dotenv = require('dotenv')
dotenv.config()
const api_key = process.env.API_KEY

let weatherAPI = {}

function get_weather(lat, lng){
    url = 'https://api.weatherbit.io/v2.0/forecast/daily?key=' + api_key + '&lat=' + lat + '&lon=' + lng
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

weatherAPI.findWeatherData = async function (lat, lng, date, range){
    let weather = await get_weather(lat, lng)
    let dates = getValidDates(date, range)
    let weatherDays = weather["data"].filter(entry => dates.includes(entry["valid_date"]));
    let results = []
    weatherDays.forEach(entry => {
      results.push(new WeatherData(
        entry["valid_date"], //yyyy-mm-dd
        entry["max_temp"],
        entry["min_temp"],
        entry["temp"],
        entry["precip"], // in mm
        entry["snow"],
        entry["snow_depth"],
        entry["wind_spd"],
        entry["wind_gust_spd"],
        entry["wind_dir"],
        entry["rh"],
        entry["dewpt"]
      ))
    })
    return results
  }

module.exports = weatherAPI;
