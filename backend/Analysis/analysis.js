const request = require("request")
let analyze = {}

analyze.getAnalysis = async function(ecoData, weatherData, historicData){
    // create input array for predict using ecoData, weatherData, historicData
    // loop through weather data 
    let modelInputs = []
    weatherData.forEach(weatherEntry => (
        modelInputs.push(createModelInput(weatherEntry, historicData, ecoData))
    ))

    let predictResponse = await predict(modelInputs);
    if(predictResponse == undefined){
      throw new Error(`Predict API did not return any response.`)
    }else if(!('predictions' in predictResponse) && 'errors' in predictResponse){
      console.log(predictResponse)
      throw new Error(`Predict API returned: ${JSON.stringify(predictResponse.errors)}`)
    }

    let results = {}
    for(let i = 0; i < weatherData.length; i++){
      let damageScore = Math.floor(Math.random() * 60)/100.0
      results[weatherData[i].date] = {
        "weather": weatherData[i],
        "riskScore": predictResponse.predictions[i],
        "damageScore":damageScore  
      }
    }
    return results;
};

function predict(modelInputs){
    url = 'https://e69rkvljm0.execute-api.us-east-1.amazonaws.com/dev'
    return new Promise(function(resolve, reject) {
      request.post({url, json: modelInputs}, (err, res, body) => {
        resolve(body)
      })
    })
}

function createModelInput(weatherData, location, geography){
    return {
         AVERAGE_DURATION : location.averageFireDuration,
         AVERAGE_SIZE_HA: location.averageFireSize,
         DEW_TEMP_12_4: 10,
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
         SNOW_ON_GRND: weatherData.snow_dpth, // check that units are valid
         SPD_OF_MAX_GUST: weatherData.wind_gust_spd, 
         TEMP_12_4: weatherData.max_temp, // TEMP
         TOTAL_DURATION: location.totalFireDuration,
         TOTAL_PRECIP: weatherData.total_precip,
         TOTAL_RAIN: 0, // temp
         TOTAL_SIZE_HA: location.totalFireSize,
         TOTAL_SNOW: weatherData.total_snow,
         MONTH: new Date(weatherData.date).getMonth(),
         DAY: new Date(weatherData.date).getDate()
    }
}


module.exports = analyze
