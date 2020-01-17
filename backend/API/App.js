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

app.get("/getAnalysis", async function (req, res, next) => {
  let lat = req.query.lat
  let lng = req.query.lng
  let date = req.query.date

  let locationKey = lat + "|" + lng

  let ecoData = dbQuery.findEcoData(locationKey)
  let historicData = dbQuery.findHistoricData(locationKey)
  let weatherData = weatherQuery.weather_data(lat, lng)

})

module.exports = app
