class WeatherData {
  constructor(DATE, MAX_TEMP, MIN_TEMP, MEAN_TEMP, TOTAL_PRECIP, TOTAL_SNOW, SNOW_DEPTH, WIND_SPD, WIND_GUST_SPD, WIND_DIR){
    this.date = DATE //yyyy-mm-dd
    this.max_temp = MAX_TEMP
    this.min_temp = MIN_TEMP
    this.mean_temp = MEAN_TEMP
    this.total_precip = TOTAL_PRECIP // in mm
    this.total_snow = TOTAL_SNOW
    this.snow_dpth = SNOW_DEPTH
    this.wind_spd = WIND_SPD
    this.wind_gust_spd = WIND_GUST_SPD
    this.wind_dir = WIND_DIR
  }
}

module.exports = WeatherData
