const express = require("express");
const bodyParser = require("body-parser");
const querystring = require("querystring");
const EcoData = require("../Schemas/EcoData.js")
const HistoricData = require("../Schemas/HistoricData.js")
const WeatherData = require("../Schemas/WeatherData.js")
const AnalysisResponse = require("../Schemas/AnalysisResponse.js")
const dbQuery = require("../CommunicationLayers/dbCommunicationLayer.js")
const weatherAPI = require("../CommunicationLayers/weatherCommunicationLayer.js")
const analyze = require("../Analysis/analysis.js")

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/api/analysis", async (req, res, next) => {
  let lat = req.query.lat
  let lng = req.query.lng
  let date = req.query.date.toString()

  let locationKey = getLocationKey(lat, lng);

  let ecoData = await dbQuery.findEcoData(locationKey)
  let historicData = await dbQuery.findHistoricData(locationKey)
  let weatherData = await weatherAPI.findWeatherData(lat, lng, date)
  await dbQuery.findEcoInfo(ecoData)

  //[riskScore, damageScore]
  let analysisResults = analyze.getAnalysis(ecoData, weatherData, historicData)
  //result = JSON.stringify([ecoData, historicData, weatherData])
  //let analysis = new AnalysisResponse(ecoData, weatherData, historicData);
  //let response = analysis.buildResponse(analysisResults)

  res.json({
    location: historicData,
    geography: ecoData,
    weather: weatherData,
    riskScore: analysisResults[0],
    damageScore: analysisResults[1]
  })
})

const getLocationKey = (lat, lng) => {
  return parseCoordinate(lat) + "|" + parseCoordinate(lng);
}

const parseCoordinate = (coordinate) => {
  return (Math.floor(coordinate*5)/5).toFixed(1);
}



module.exports = app
