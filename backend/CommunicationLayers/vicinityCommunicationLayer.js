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
  let results = null;

  return waApi
    .getFull({
      input: dms,
      output: "json",
      format: "plaintext"
    })
    .then(res => {
      if (res && res.pods) {
        res.pods.forEach(element => {
          if (element.title == "Nearest city") {
            results = extractNearestCityInfo(element);
          } else if (element.title == "Nearest city center") {
            let newResults = extractNearestCityInfo(element);
            if (results && results.distance > newResults.distance) {
              results = extractNearestCityInfo(element);
            }
          }
        });
      } else {
        results = {
          city: "Not available",
          distance: "Not available",
          population: "Not available",
          normalizedDistance: 0,
          normalizedPopulation: 0
        };
      }

      return results;
    })
    .catch(error => {
      console.log(error);
      return (results = {
        city: "Not available",
        distance: "Not available",
        population: "Not available",
        normalizedDistance: 0,
        normalizedPopulation: 0
      });
    });
};

function extractNearestCityInfo(element) {
  let text = element.subpods[0].plaintext;
  let population = text.slice(text.indexOf("population: "));
  population = population.match(/\d+/g).map(Number)[0];
  let distance = element.subpods[0].plaintext.split("(")[1];
  distance = Number(distance.replace(/[^0-9\.]+/g, ""));
  var cityName = element.subpods[0].plaintext.split("(");
  if (distance) {
    var normalizedDistance = normalizeDistance(
      distance,
      MAX_DISTANCE,
      MIN_DISTANCE
    );
  } else {
    distance = 0;
  }
  if (population) {
    var normalizedPopulation = normalizePopulation(
      population,
      population > MAX_POPULATION ? population : MAX_POPULATION,
      MIN_POPULATION
    );
  } else {
    population = 0;
  }
  let results = {
    city: cityName[0] ? cityName[0] : "Not available",
    distance: distance,
    population: population,
    normalizedDistance: normalizedDistance,
    normalizedPopulation: normalizedPopulation
  };
  return results;
}
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
