class WeatherData {
  constructor(DATE, MAX_TEMP, MIN_TEMP, MEAN_TEMP, TOTAL_PRECIP, TOTAL_SNOW, SNOW_DEPTH, WIND_SPD, WIND_GUST_SPD, WIND_DIR){
    this.DATE = DATE //yyyy-mm-dd
    this.MAX_TEMP = MAX_TEMP
    this.MIN_TEMP = MIN_TEMP
    this.MEAN_TEMP = MEAN_TEMP
    this.TOTAL_PRECIP = TOTAL_PRECIP // in mm
    this.TOTAL_SNOW = TOTAL_SNOW
    this.SNOW_DPTH = SNOW_DEPTH
    this.WIND_SPD = WIND_SPD
    this.WIND_GUST_SPD = WIND_GUST_SPD
    this.WIND_DIR = WIND_DIR
  }
}

module.exports = WeatherData
