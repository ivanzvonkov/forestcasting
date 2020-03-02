const requests = require("request")
const WeatherData  = require('../Schemas/WeatherData.js')
const MongoClient = require("mongodb").MongoClient;
const dotenv = require('dotenv')
const epoch = require('epoch-time-machine')
dotenv.config()
const api_key = process.env.API_KEY

const uri =
  "mongodb+srv://" +
  process.env.DB_USERNAME +
  ":" +
  process.env.DB_PASSWORD +
  "@forestcasting-umgnk.mongodb.net/";

let weatherAPI = {}

function get_weather(lat, lng){
    url = 'https://api.darksky.net/forecast/'+ api_key + '/' + lat + ',' + lng +"?exclude=minutely,flags,alerts,currently&extend=hourly"
    return new Promise(function(resolve, reject) {
      requests(url, {json : true}, (err, res, body) => {
        resolve(body)
    })
  })
}

function get_average_weather(lat, lng, date){
  let month_day = date.split("-")
  month_day = month_day[1] + "-" + month_day[2]
  let locationKey = lat + "|" + lng

  return new Promise(function(resolve, reject){
    MongoClient.connect(uri, function(err, client) {
      if(err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
      }
      client.db("forestcasting")
        .collection("daily_average_weather")
        .findOne({"LOCATION_KEY": locationKey, "MONTH_DAY": month_day})
        .then(dbResult => {
          //close the connection
          client.close();
          if(dbResult){
              let weather = new WeatherData()
              weather.set_with_averages(
                date,
                dbResult["MAX_TEMP"],
                dbResult["MIN_TEMP"],
                dbResult["MEAN_TEMP"],
                dbResult["TOTAL_RAIN"],
                dbResult["TOTAL_SNOW"],
                dbResult["TOTAL_PRECIP"],
                dbResult["TOTAL_RAIN"],
                dbResult["SNOW_ON_GRND"],
                dbResult["DIR_OF_MAX_GUST"],
                dbResult["SPD_OF_MAX_GUST"],
                dbResult["TEMP_12_4"],
                dbResult["DEW_TEMP_12_4"],
                dbResult["REL_HUM_12_4"]
              )
              resolve(weather)
          }else{
              reject(new Error(`Weather not found using: ${locationKey} and ${month_day}`))
          }
        })
      })
  });
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

function epochToHour(epochTime) {
  let date = new Date(epochTime * 1000)

  hour = date.customFormat("H")

  return hour
}

weatherAPI.findWeatherData = async function (lat, lng, date, range){
    let weather = await get_weather(lat, lng)
    let dates = getValidDates(date, range)
    let weatherDays = weather["daily"]["data"].filter(entry => dates.includes(epochToDate(entry["time"])));
    let results = []

    weatherDays.forEach(entry => {
      weatherDay = new WeatherData()
      weatherDay.set_with_forecast(
        epochToDate(entry["time"]), //yyyy-mm-dd
        entry["temperatureMax"],
        entry["temperatureMin"],
        entry["precipAccumulation"], // in cm
        entry["precipType"],
        entry["windSpeed"],
        entry["windGust"],
        entry["windBearing"],
        entry["humidity"],
        entry["dewPoint"]
      )

      let weatherHours = weather["hourly"]["data"].filter(e => epochToDate(e["time"]) == weatherDay.date && epochToHour(e["time"]) >= 12 && epochToHour(e["time"]) <= 16 )

      weatherDay.addHourlyData(weatherHours)

      results.push(weatherDay)
    })

    // for any dates not covered by the above, get the data from the db
    if(results.length != range) {
        let remaining = range - results.length
        // sort dates to ensure they are in ascending order
        dates.sort((a, b) => (a > b) ? 1 : -1)

        let remaining_dates = dates.slice(remaining * -1)

        remaining_dates.forEach(async day => {
          let daily_avg = await get_average_weather(lat, lng, day)
          results.push(daily_avg)
        })
    }

    return results
  }

module.exports = weatherAPI;
