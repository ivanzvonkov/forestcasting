const WeatherData = require("../Schemas/WeatherData.js")
let analyze = {}

analyze.getAnalysis = function(ecoData, weatherData, historicData){
  let results = []

  weatherData.forEach(entry => {
    let damageScore = Math.floor(Math.random() * 100)
    let riskScore = Math.floor(Math.random() * 100)
    let date = entry.date
    results.push({[date]: { "weather": entry, "riskScore": riskScore, "damageScore":damageScore}})
  })

  //reulsts = [{date, {weatherDataOnDate}, riskScore, damageScore}]]
  console.log(results)
  return results
}

module.exports = analyze
