class WeatherData{
    constructor(MAX_TEMP, MIN_TEMP,
               MEAN_TEMP, TOTAL_RAIN, TOTAL_SNOW, TOTAL_PRECIP, DIR_OF_MAX_GUST, SPD_OF_MAX_GUST){
        this.MAX_TEMP = MAX_TEMP
        this.MIN_TEMP = MIN_TEMP
        this.MEAN_TEMP = MEAN_TEMP # redundant. Just (MAX_TEMP + MIN_TEMP) / 2
        this.TOTAL_RAIN = TOTAL_RAIN
        this.TOTAL_SNOW = TOTAL_SNOW
        this.TOTAL_PRECIP = TOTAL_PRECIP # redundant. Just (TOTAL_RAIN + TOTAL_SNOW)
        this.DIR_OF_MAX_GUST = DIR_OF_MAX_GUST
        this.SPD_OF_MAX_GUST = SPD_OF_MAX_GUST
      }
    }
