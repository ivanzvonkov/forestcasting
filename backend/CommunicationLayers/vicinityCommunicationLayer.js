const WolframAlphaAPI = require("wolfram-alpha-api");
const dotenv = require("dotenv");

dotenv.config();

const waApi = WolframAlphaAPI(`${process.env.WA_APP_ID}`);
const MAX_POPULATION = 1000000; // Toronto's population from 2016 Census
const MIN_POPULATION = 0;
const MAX_DISTANCE = 100;
const MIN_DISTANCE = 0;

let vicinityAPI = {};

vicinityAPI.findVicinityData = async function(lat, lng) {
  var dms = convertDMS(lat, lng);
  let results;

  return waApi
    .getFull({
      input: dms,
      output: "json",
      format: "plaintext"
    })
    .then(res => {
      res.pods.forEach(element => {
        if (element.title == "Nearest city") {
          for (var i = 0; i < element.numsubpods; i++) {
            var nearestCityNumbers = element.subpods[i].plaintext
              .match(/\d+/g)
              .map(Number);
            var cityName = element.subpods[i].plaintext.split("(");
            results = {
              city: cityName[0],
              distance: nearestCityNumbers[0],
              population: nearestCityNumbers[1],
              normalizedDistance: normalizeDistance(
                nearestCityNumbers[0],
                MAX_DISTANCE,
                MIN_DISTANCE
              ),
              normalizedPopulation: normalizePopulation(
                nearestCityNumbers[1],
                nearestCityNumbers[1] > MAX_POPULATION
                  ? nearestCityNumbers[1]
                  : MAX_POPULATION,
                MIN_POPULATION
              )
            };
          }
        }
      });
      console.log(results);
      return results;
    })
    .catch(error => {
      throw new Error(`Wolfram Alpha API returned: ${error}`);
    });
};

function normalizeDistance(val, max, min) {
  var normalizedVal = 1 - (val - min) / (max - min);
  return normalizedVal < 0 ? 0 : normalizedVal;
}

function normalizePopulation(val, max, min) {
  return (val - min) / (max - min);
}

function convertDMS(lat, lng) {
  var latitude = toDegreesMinutesAndSeconds(lat);
  var latitudeCardinal = lat >= 0 ? "N" : "S";

  var longitude = toDegreesMinutesAndSeconds(lng);
  var longitudeCardinal = lng >= 0 ? "E" : "W";

  return (
    latitude +
    " " +
    latitudeCardinal +
    "\n" +
    longitude +
    " " +
    longitudeCardinal
  );
}

function toDegreesMinutesAndSeconds(coordinate) {
  var absolute = Math.abs(coordinate);
  var degrees = Math.floor(absolute);
  var minutesNotTruncated = (absolute - degrees) * 60;
  var minutes = Math.floor(minutesNotTruncated);
  var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  return degrees + " deg " + minutes + "' " + seconds;
}

module.exports = vicinityAPI;
