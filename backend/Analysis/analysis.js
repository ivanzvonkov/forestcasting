const request = require("request")
let analyze = {}

analyze.getAnalysis = async function(ecoData, weatherData, historicData){
    // create input array for predict using ecoData, weatherData, historicData
    // loop through weather data
    let modelInputs = []
    weatherData.forEach(weatherEntry => (
        modelInputs.push(createModelInput(weatherEntry, historicData, ecoData))
    ))

    /*let predictResponse = await predict(modelInputs);
    if(predictResponse == undefined){
      throw new Error(`Predict API did not return any response.`)
    }else if(!('predictions' in predictResponse) && 'message' in predictResponse){
      throw new Error(`Predict API returned: ${predictResponse.message}`)
    }*/

    let results = {}
    for(let i = 0; i < weatherData.length; i++){
      let damageScore = Math.floor(Math.random() * 60)/100.0
      let riskScore = Math.floor(Math.random() * 60)/100.0
      results[weatherData[i].date] = {
        "weather": weatherData[i],
        "riskScore": riskScore,// predictResponse.predictions[i],
        "damageScore":damageScore
      }
    }
    return results;
};

function predict(modelInputs){
    url = 'https://1nabtyi1g1.execute-api.us-east-1.amazonaws.com/dev/predict/'
    return new Promise(function(resolve, reject) {
      request.post({url, json: modelInputs}, (err, res, body) => {
        resolve(body)
    })
  })
}

function createModelInput(weatherData, location, geography){
    return {
         AVERAGE_DURATION_OLD : location.averageFireDuration,
         AVERAGE_SIZE_HA_OLD: location.averageFireSize,
         DEW_POINT_TEMP_12_4: 10,
         DIR_OF_MAX_GUST: weatherData.wind_dir,
         ECODISTRICT: geography.district ? geography.district : 184, // TEMP
         ECOREGION: geography.region,
         ECOZONE: geography.zone,
         LATITUDE: Number(location.latitude),
         LONGITUDE: Number(location.longitude),
         MAX_TEMP: weatherData.max_temp,
         MEAN_TEMP: weatherData.mean_temp,
         MIN_TEMP: weatherData.min_temp,
         REL_HUM_12_4: 50, // TEMP
         SNOW_ON_GRND: 0, // TEMP - dark api doesn't provice
         SPD_OF_MAX_GUST: weatherData.wind_gust_spd,
         TEMP_12_4: weatherData.max_temp, // TEMP
         TOTAL_DURATION_OLD: location.totalFireDuration,
         TOTAL_PRECIP: weatherData.total_precip,
         TOTAL_RAIN: 0, // temp
         TOTAL_SIZE_HA_OLD: location.totalFireSize,
         TOTAL_SNOW: weatherData.total_snow
    }
}


module.exports = analyze
