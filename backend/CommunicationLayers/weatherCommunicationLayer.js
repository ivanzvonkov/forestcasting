const requests = require("request")
const WeatherData  = require('../Schemas/WeatherData.js')
const dotenv = require('dotenv')
dotenv.config()
const api_key = process.env.API_KEY

function get_weather(lat, lon){
    url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + api_key
    return new Promise(function(resolve, reject) {
      requests(url, {json : true}, (err, res, body) => {
      resolve(body)
    })
  })
}

async function weather_data(lat, lon){
    let weather = await get_weather(lat, lon)

    if (weather['cod'] == 200) {
        // Set precipitation default values
        let TOTAL_RAIN = 0.0
        let TOTAL_SNOW = 0.0
        // Temperatures are return in kelvin - convert to celsuis
        let MAX_TEMP = weather['main']['temp_max'] - 273.15
        let MIN_TEMP = weather['main']['temp_min'] - 273.15
        let MEAN_TEMP = (MIN_TEMP) + MAX_TEMP/ 2

        if ('rain' in weather){
            TOTAL_RAIN = weather['rain']['1h']  // Rain for last 1hour in mm
          }

        if ('snow' in weather){
            TOTAL_SNOW = weather['snow']['1h']  // Snow for last 1hour in mm
          }

        let TOTAL_PRECIP = TOTAL_RAIN + TOTAL_SNOW

        // Wind default values
        let DIR_OF_MAX_GUST = 0.0
        let SPD_OF_MAX_GUST = 0.0
        if ('wind' in weather) {
            DIR_OF_MAX_GUST = weather['wind']['deg']  // Wind direction in deg
            SPD_OF_MAX_GUST = weather['wind']['speed'] // Wind speed in m/s
          }

        let current_weather = new WeatherData(MAX_TEMP, MIN_TEMP,
                                      MEAN_TEMP, TOTAL_RAIN, TOTAL_SNOW, TOTAL_PRECIP, DIR_OF_MAX_GUST, SPD_OF_MAX_GUST)

        return current_weather
    }
    else {
        console.log('API call did not work')
        return null  // API call was invalid
      }
  }
