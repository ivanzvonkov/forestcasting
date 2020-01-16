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
    weather = await get_weather(lat, lon)
    console.log(weather)
    if (weather['cod'] == 200) {
        // Temperatures are return in kelvin - convert to celsuis
        MAX_TEMP = weather['main']['temp_max'] - 273.15
        MIN_TEMP = weather['main']['temp_min'] - 273.15
        MEAN_TEMP = (MIN_TEMP) + MAX_TEMP/ 2
        if ('rain' in weather){
            TOTAL_RAIN = weather['rain']['1h']  // Rain for last 1hour in mm
          }
        else {
            TOTAL_RAIN = 0.0
          }

        if ('snow' in weather){
            TOTAL_SNOW = weather['snow']['1h']  // Snow for last 1hour in mm
          }
        else {
            TOTAL_SNOW = 0.0
          }

        TOTAL_PRECIP = TOTAL_RAIN + TOTAL_SNOW

        if ('wind' in weather) {
            DIR_OF_MAX_GUST = weather['wind']['deg']  // Wind direction in deg
            SPD_OF_MAX_GUST = weather['wind']['speed'] // Wind speed in m/s
          }
        else {
            DIR_OF_MAX_GUST = 0.0
            SPD_OF_MAX_GUST = 0.0
        }
        current_weather = new WeatherData(MAX_TEMP, MIN_TEMP,
                                      MEAN_TEMP, TOTAL_RAIN, TOTAL_SNOW, TOTAL_PRECIP, DIR_OF_MAX_GUST, SPD_OF_MAX_GUST)
        console.log(current_weather)
        return current_weather
    }
    else {
        print('API call did not work')
        return None  // API call was invalid
      }
  }
