const express = require("express");
const bodyParser = require("body-parser");
const querystring = require("querystring");
const EcoData = require("../Schemas/EcoData.js")
const HistoricData = require("../Schemas/HistoricData.js")
const WeatherData = require("../Schemas/WeatherData.js")
const dbQuery = require("../CommunicationLayers/dbCommunicationLayer.js")
const weatherQuery = require("../CommunicationLayers/weatherCommunicationLayer.js")

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/getAnalysis", async (req, res, next) => {
  let lat = req.query.lat
  let lng = req.query.lng
  let date = req.query.date

  let locationKey = lat + "|" + lng
  console.log(locationKey)

  let ecoData = await dbQuery.findEcoData(locationKey)
  let historicData = await dbQuery.findHistoricData(locationKey)
  let weatherData = await weatherQuery.findWeatherData(lat, lng)

   res.json([ecoData, historicData, weatherData])
})

module.exports = app
