const request = require("request");
let analyze = {};

analyze.getAnalysis = async function(ecoData, weatherData, historicData) {
  // create input array for predict using ecoData, weatherData, historicData
  // loop through weather data
  let modelInputs = [];
  weatherData.forEach(weatherEntry =>
    modelInputs.push(createModelInput(weatherEntry, historicData, ecoData))
  );

  let predictResponse = await predict(modelInputs);
  if (predictResponse == undefined) {
    throw new Error(`Predict API did not return any response.`);
  } else if (
    !("predictions" in predictResponse) &&
    "errors" in predictResponse
  ) {
    throw new Error(
      `Predict API returned: ${JSON.stringify(predictResponse.errors)}`
    );
  }

  let results = {};
  for (let i = 0; i < weatherData.length; i++) {
    let damageScore = Math.floor(Math.random() * 60) / 100.0;
    results[i] = {
      weather: weatherData[i],
      riskScore: predictResponse.predictions[i],
      damageScore: damageScore
    };
  }
  return results;
};

function predict(modelInputs) {
  url = "https://e69rkvljm0.execute-api.us-east-1.amazonaws.com/dev/predict/";
  return new Promise(function(resolve, reject) {
    request.post({ url, json: modelInputs }, (err, res, body) => {
      resolve(body);
    });
  });
}

function createModelInput(weatherData, location, geography) {
  return {
    AVERAGE_DURATION: location.averageFireDuration,
    AVERAGE_SIZE_HA: location.averageFireSize,
    DEW_TEMP_12_4: weatherData.dew_point_temp_12_4,
    DIR_OF_MAX_GUST: weatherData.wind_dir,
    ECODISTRICT: geography.district ? geography.district : 184, // TEMP
    ECOREGION: geography.region,
    ECOZONE: geography.zone,
    LATITUDE: Number(location.latitude),
    LONGITUDE: Number(location.longitude),
    MAX_TEMP: weatherData.max_temp,
    MEAN_TEMP: weatherData.mean_temp,
    MIN_TEMP: weatherData.min_temp,
    REL_HUM_12_4: weatherData.rel_hum_12_4,
    SNOW_ON_GRND: 0, // TEMP - dark api doesn't provide
    SPD_OF_MAX_GUST: weatherData.wind_gust_spd,
    TEMP_12_4: weatherData.temp_12_4,
    TOTAL_DURATION: location.totalFireDuration,
    TOTAL_PRECIP: weatherData.total_precip,
    TOTAL_RAIN: weatherData.total_rain,
    TOTAL_SIZE_HA: location.totalFireSize,
    TOTAL_SNOW: weatherData.total_snow,
    MONTH: new Date(weatherData.date).getMonth(),
    DAY: new Date(weatherData.date).getDate()
  };
}
module.exports = analyze;
