const WeatherData = require("../Schemas/WeatherData.js")
let analyze = {}

analyze.getAnalysis = function(ecoData, weatherData, historicData){
  let results = []
  let i = 0
  weatherData.forEach(entry => {
    i++
    let damageScore = Math.floor(Math.random() * 60)
    let riskScore = Math.floor(Math.random() * 60)
    results.push({[i]:{"weather": entry, "riskScore": riskScore, "damageScore":damageScore}})
  })

  //reulsts = [{date, {weatherDataOnDate}, riskScore, damageScore}]]
  return results
}

module.exports = analyze
