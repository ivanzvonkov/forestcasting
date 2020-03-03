class WeatherData {
  constructor(){}

  set_with_forecast(DATE, MAX_TEMP, MIN_TEMP, TOTAL_PRECIP, PRECIP_TYPE, WIND_GUST_SPD, WIND_DIR){
    this.date = DATE //yyyy-mm-dd
    this.max_temp = MAX_TEMP
    this.min_temp = MIN_TEMP

    let  meanTemp = (MAX_TEMP + MIN_TEMP)/2
    this.mean_temp = meanTemp
    this.total_precip = 0 // cm

    if(TOTAL_PRECIP != null){
      this.total_precip = TOTAL_PRECIP
    }

    this.total_snow = 0.0
    this.total_rain = 0.0

    if(TOTAL_PRECIP != undefined){
      if (PRECIP_TYPE == "snow") {
        this.total_snow = TOTAL_PRECIP
      } else if (PRECIP_TYPE == "rain") {
        this.total_rain = TOTAL_PRECIP
      }
  }

    this.wind_gust_spd = WIND_GUST_SPD
    this.wind_dir = WIND_DIR
  }

  set_with_averages(DATE,MAX_TEMP,MIN_TEMP,MEAN_TEMP,TOTAL_RAIN,TOTAL_SNOW,TOTAL_PRECIP,SNOW_ON_GRND,DIR_OF_MAX_GUST,SPD_OF_MAX_GUST,TEMP_12_4,DEW_TEMP_12_4,REL_HUM_12_4){
    this.date = DATE //yyyy-mm-dd
    this.max_temp = MAX_TEMP
    this.min_temp = MIN_TEMP
    this.mean_temp = MEAN_TEMP

    this.total_rain = TOTAL_PRECIP
    this.total_snow = TOTAL_PRECIP
    this.total_precip = TOTAL_PRECIP
    this.snow_on_grnd = SNOW_ON_GRND

    this.wind_gust_spd = SPD_OF_MAX_GUST
    this.wind_dir = DIR_OF_MAX_GUST

    this.temp_12_4 = TEMP_12_4
    this.dew_point_temp_12_4 = DEW_TEMP_12_4
    this.rel_hum_12_4 = REL_HUM_12_4
  }

  addHourlyData(hourly) {
    let TEMP_12_4 = 0
    let DEW_POINT_TEMP_12_4 = 0
    let REL_HUM_12_4 = 0
    let count = 0

    hourly.forEach(entry => {
      TEMP_12_4 += entry["temperature"]
      DEW_POINT_TEMP_12_4 += entry["dewPoint"]
      REL_HUM_12_4 += entry["humidity"]
      count += 1
    })

    TEMP_12_4 = TEMP_12_4/count
    DEW_POINT_TEMP_12_4 = DEW_POINT_TEMP_12_4/count
    REL_HUM_12_4 = REL_HUM_12_4/count

    this.temp_12_4 = TEMP_12_4
    this.dew_point_temp_12_4 = DEW_POINT_TEMP_12_4
    this.rel_hum_12_4 = REL_HUM_12_4
  }
}

module.exports = WeatherData
