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
    console.log(locationKey)
    //set up promises
    let ecoPromise =  dbQuery.findEcoData(locationKey);
    let historicPromise =  dbQuery.findHistoricData(locationKey);
    let weatherPromise =  weatherAPI.findWeatherData(lat, lng, date, range);
    let damagePromise =  dbQuery.findDamageStats(locationKey);
    let vicinityPromise =  vicinityAPI.findVicinityData(lat, lng);
    let protectedAreaPromise =  dbQuery.findProtectedAreaData(locationKey);

    let ecoData = await ecoPromise;
    let ecoInfoPromise = dbQuery.findEcoInfo(ecoData);

    // wait for all required promises to return before moving on
    let vicinityData = await vicinityPromise;
    let historicData = await historicPromise;
    let weatherData = await weatherPromise;
    let damageData = await damagePromise;
    let protectedAreaData = await protectedAreaPromise;
    await ecoInfoPromise;

    if (vicinityData.normalizedDistance && vicinityData.normalizedPopulation) {
      await damageData.setVicinity(
        50 * vicinityData.normalizedDistance +
          50 * vicinityData.normalizedPopulation
      );
    } else {
      damageData.setVicinity(0);
    }

    let analysisResults = await analyze.getAnalysis(
      ecoData,
      weatherData,
      historicData,
    );
    res.json({
      location: historicData,
      geography: ecoData,
      damage: damageData,
      specificDate: analysisResults,
      vicinityData,
      protectedAreaData
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
