const WolframAlphaAPI = require("wolfram-alpha-api");
const dotenv = require("dotenv");
dotenv.config();
const waApi = WolframAlphaAPI(`${process.env.WA_APP_ID}`);

let vicinityAPI = {};

const MAX_POPULATION = 5429524; // Toronto's population from 2016 Census
// MIN_POPULATION  = cityDistance < MAX_DISTANCE ?  cityPopulation : 0

const MAX_DISTANCE = 50;
// MIN_DISTANCE = cityDistance < MAX_DISTANCE ?  cityDistance : MAX_DISTANCE

/*
  send nromalized scores to frotnend 
  also send the actual info 
*/

vicinityAPI.findVicinityData = async function(lat, lng) {
  var dms = convertDMS(lat, lng);
  let results = {
    nearestCity: [],
    nearbyServices: [],
    nearbyFeatures: []
  };

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
            results.nearestCity.push({
              city: cityName[0],
              distance: nearestCityNumbers[0],
              population: nearestCityNumbers[1]
            });
          }
        }

        if (
          element.title == "Nearby services" ||
          element.title == "Nearby features"
        ) {
          for (var i = 0; i < element.numsubpods; i++) {
            console.log(element.subpods[i]);
            //   var service = element.subpods[i].plaintext.split("|");
            //   var nearbyServiceDistance = element.subpods[i].plaintext
            //     .match(/\d+/g)
            //     .map(Number);
            //   console.log(service, nearbyServiceDistance);
            //   results.nearbyServices.push({
            //     service: service[0],
            //     distance: nearbyServiceDistance
            //   });
          }
        }
      });
      return results;
    })
    .catch(error => {
      throw new Error(`Wolfram Alpha API returned: ${JSON.stringify(error)}`);
    });
};

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
