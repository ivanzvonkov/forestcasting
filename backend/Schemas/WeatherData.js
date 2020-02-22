class WeatherData {
  constructor(DATE, MAX_TEMP, MIN_TEMP, TOTAL_PRECIP, PRECIP_TYPE, WIND_SPD, WIND_GUST_SPD, WIND_DIR, RH, DPT){
    this.date = DATE //yyyy-mm-dd
    this.max_temp = MAX_TEMP
    this.min_temp = MIN_TEMP

    let  meanTemp = (MAX_TEMP + MIN_TEMP)/2
    this.mean_temp = meanTemp
    this.total_precip = TOTAL_PRECIP // in mm
    this.total_snow = 0.0

    if (PRECIP_TYPE == "snow") {
      this.total_snow = TOTAL_PRECIP
    }

    this.wind_spd = WIND_SPD
    this.wind_gust_spd = WIND_GUST_SPD
    this.wind_dir = WIND_DIR
    this.relative_humidity = RH
    this.dew_point_temp = DPT
  }
}

module.exports = WeatherData
