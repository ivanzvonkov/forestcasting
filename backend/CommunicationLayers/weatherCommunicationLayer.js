const requests = require("request")
const WeatherData  = require('../Schemas/WeatherData.js')
const dotenv = require('dotenv')
dotenv.config()
const api_key = process.env.API_KEY

function get_weather(lat, lng){
    url = 'https://api.weatherbit.io/v2.0/forecast/daily?key=' + api_key + '&lat=' + lat + '&lon=' + lng
    return new Promise(function(resolve, reject) {
      requests(url, {json : true}, (err, res, body) => {
      resolve(body)
    })
  })
}

async function weather_data(lat, lng){
    let weather = await get_weather(lat, lng)
    weather = weather["data"]

    let results = []
    weather.forEach(element => {
      results.push( new WeatherData(
          element["valid_date"],
          element["max_temp"],
          element["min_temp"],
          element["temp"],
          element["precip"],
          element["snow"],
          element["snow_depth"],
          element["wind_spd"],
          element["wind_gust_spd"],
          element["wind_dir"]
        ))
    })

    return results
  }
