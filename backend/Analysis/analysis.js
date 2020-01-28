const WeatherData = require("../Schemas/WeatherData.js");
let analyze = {};

analyze.getAnalysis = function(ecoData, weatherData, historicData) {
  let results = [];
  weatherData.forEach(entry => {
    let damageScore = Math.random();
    let riskScore = Math.random();
    results.push({
      weather: entry,
      riskScore: riskScore,
      damageScore: damageScore
    });
  });

  //reulsts = [{date, {weatherDataOnDate}, riskScore, damageScore}]]
  console.log(results);
  return results;
};

module.exports = analyze;
