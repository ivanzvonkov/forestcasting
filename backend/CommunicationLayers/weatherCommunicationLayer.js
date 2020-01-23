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

weatherAPI.findWeatherData = async function (lat, lng, date){
    let weather = await get_weather(lat, lng)
    let weatherForDay = weather["data"].find(entry => entry["valid_date"] == date);
    let results = {}

    if(weatherForDay){
        results = {
          date: weatherForDay["valid_date"], //yyyy-mm-dd
          max_temp: weatherForDay["max_temp"],
          min_temp: weatherForDay["min_temp"],
          mean_temp: weatherForDay["temp"],
          total_precip: weatherForDay["precip"], // in mm
          total_snow: weatherForDay["snow"],
          snow_dpth: weatherForDay["snow_depth"],
          wind_spd: weatherForDay["wind_spd"],
          wind_gust_spd: weatherForDay["wind_gust_spd"],
          wind_dir: weatherForDay["wind_dir"]
        }
    }
    return results
  }

module.exports = weatherAPI;
