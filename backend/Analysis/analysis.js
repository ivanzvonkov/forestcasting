const WeatherData = require("../Schemas/WeatherData.js");
let analyze = {};

analyze.getAnalysis = function(ecoData, weatherData, historicData) {
  let results = [];
  weatherData.forEach(entry => {
    let damageScore = Math.floor(Math.random() * 60) / 100.0;
    let riskScore = Math.floor(Math.random() * 60) / 100.0;
    results.push({
      weather: entry,
      riskScore: riskScore,
      damageScore: damageScore
    });
  });

  //reulsts = [{date, {weatherDataOnDate}, riskScore, damageScore}]]
  return results;
};

module.exports = analyze;
