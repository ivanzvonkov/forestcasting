const express = require("express");
const bodyParser = require("body-parser");
const querystring = require("querystring");
const EcoData = require("../Schemas/EcoData.js")
const HistoricData = require("../Schemas/HistoricData.js")
const WeatherData = require("../Schemas/WeatherData.js")
const AnalysisResponse = require("../Schemas/AnalysisResponse.js")
const dbQuery = require("../CommunicationLayers/dbCommunicationLayer.js")
const weatherQuery = require("../CommunicationLayers/weatherCommunicationLayer.js")
const analyze = require("../Analysis/analysis.js")

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/getAnalysis", async (req, res, next) => {
  let lat = req.query.lat
  let lng = req.query.lng
  let date = req.query.date.toString()

  let locationKey = lat + "|" + lng

  let ecoData = await dbQuery.findEcoData(locationKey)
  let historicData = await dbQuery.findHistoricData(locationKey)
  let weatherData = await weatherQuery.findWeatherData(lat, lng)

  if (date !== "undefined") {
    weatherData = filterWeatherData(weatherData, date)
  }

  //[riskScore, damageScore]
  let analysisResults = analyze.getAnalysis(ecoData, weatherData, historicData)

  console.log(analysisResults)
  //result = JSON.stringify([ecoData, historicData, weatherData])
  let analysis = new AnalysisResponse(ecoData, weatherData, historicData)
  let response = analysis.buildResponse(analysisResults)
  console.log(response)
  res.json(response)
})


function filterWeatherData(weatherData, date) {
  let filteredData = weatherData.find(entry => entry.DATE == date)

  return filteredData
}



module.exports = app
