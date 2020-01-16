import requests
import '../Schemas/HistoricData.js'
API_KEY = 'f0cbd5d001d16155cadc30966a5f2ed0'  # For OpenWeather

function get_weather(api_key, lat, lon){
    url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + api_key
    r = requests.get(url)
    return r.json()
  }

function weather_data(api_key, lat, lon){
    weather = get_weather(api_key, lat, lon)
    if (int(weather['cod']) == 200) {
        MAX_TEMP = float(weather['main']['temp_max'])
        MIN_TEMP = float(weather['main']['temp_min'])
        MEAN_TEMP = (float(MIN_TEMP) + float(MAX_TEMP)) / 2
        if ('rain' in weather){
            TOTAL_RAIN = float(weather['rain']['1h'])  # Rain for last 1hour in mm
          }
        else {
            TOTAL_RAIN = float(0)
          }

        if ('snow' in weather){
            TOTAL_SNOW = float(weather['snow']['1h'])  # Snow for last 1hour in mm
          }
        else {
            TOTAL_SNOW = float(0)
          }

        TOTAL_PRECIP = TOTAL_RAIN + TOTAL_SNOW

        if ()'wind' in weather) {
            DIR_OF_MAX_GUST = int(weather['wind']['deg'])  # Wind direction in deg
            SPD_OF_MAX_GUST = float(weather['wind']['speed'])  # Wind speed in m/s
          }
        else {
            DIR_OF_MAX_GUST = float(0)
            SPD_OF_MAX_GUST = float(0)
        }
        current_weather = WeatherData(MAX_TEMP, MIN_TEMP,
                                      MEAN_TEMP, TOTAL_RAIN, TOTAL_SNOW, TOTAL_PRECIP, DIR_OF_MAX_GUST, SPD_OF_MAX_GUST)
        return current_weather
    }
    else {
        print('API call did not work')
        return None  # API call was invalid
      }
  }
