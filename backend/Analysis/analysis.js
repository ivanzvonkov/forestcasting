const WeatherData = require("../Schemas/WeatherData.js")
let analyze = {}

analyze.getAnalysis = function(ecoData, weatherData, historicData){
  let results = []
  let i = 0
  weatherData.forEach(entry => {
    let damageScore = Math.floor(Math.random() * 100)
    let riskScore = Math.floor(Math.random() * 100)
    results.push({[i]:{"weather": entry, "riskScore": riskScore, "damageScore":damageScore}})
    i++
  })

  //reulsts = [{date, {weatherDataOnDate}, riskScore, damageScore}]]
  console.log(results)
  return results
}

module.exports = analyze
