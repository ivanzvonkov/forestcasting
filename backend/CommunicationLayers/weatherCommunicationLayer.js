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
        results = new WeatherData(
          weatherForDay["valid_date"], //yyyy-mm-dd
          weatherForDay["max_temp"],
          weatherForDay["min_temp"],
          weatherForDay["temp"],
          weatherForDay["precip"], // in mm
          weatherForDay["snow"],
          weatherForDay["snow_depth"],
          weatherForDay["wind_spd"],
          weatherForDay["wind_gust_spd"],
          weatherForDay["wind_dir"]
        )
    }
    return results
  }

module.exports = weatherAPI;
