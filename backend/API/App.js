const express = require("express");
const bodyParser = require("body-parser");
const querystring = require("querystring");
const EcoData = require("../Schemas/EcoData.js");
const HistoricData = require("../Schemas/HistoricData.js");
const WeatherData = require("../Schemas/WeatherData.js");
const dbQuery = require("../CommunicationLayers/dbCommunicationLayer.js");
const weatherAPI = require("../CommunicationLayers/weatherCommunicationLayer.js");
const analyze = require("../Analysis/analysis.js");
const vicinityAPI = require("../CommunicationLayers/vicinityCommunicationLayer.js");

const app = express();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// For testing purposes
app.get("/", (req, res) => res.send("Hello world!"));

app.get("/api/analysis", async (req, res, next) => {
  let lat = req.query.lat;
  let lng = req.query.lng;
  let date = req.query.date.toString();
  let range = req.query.range ? req.query.range : 1;
  try {
    let locationKey = getLocationKey(lat, lng);
    let ecoData = await dbQuery.findEcoData(locationKey);
    let historicData = await dbQuery.findHistoricData(locationKey);
    let weatherData = await weatherAPI.findWeatherData(lat, lng, date, range);
    let damageData = await dbQuery.findDamageStats(locationKey);
    let vicinityData = await vicinityAPI.findVicinityData(lat, lng);
    console.log(vicinityData);
    await dbQuery.findEcoInfo(ecoData);

    // hard coded for now
    await damageData.setVicinity(0.5 * 100);

    //[riskScore, damageScore]
    let analysisResults = await analyze.getAnalysis(
      ecoData,
      weatherData,
      historicData,
      damageData
    );
    res.json({
      location: historicData,
      geography: ecoData,
      damage: damageData,
      specificDate: analysisResults
    });
  } catch (err) {
    res.status(400).json({ message: err.toString() });
  }
});

const getLocationKey = (lat, lng) => {
  return parseCoordinate(lat) + "|" + parseCoordinate(lng);
};

const parseCoordinate = coordinate => {
  return (Math.floor(coordinate * 5) / 5).toFixed(1);
};

module.exports = app;
