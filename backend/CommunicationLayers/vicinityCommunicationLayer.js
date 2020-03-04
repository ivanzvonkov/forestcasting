const WolframAlphaAPI = require("wolfram-alpha-api");
const dotenv = require("dotenv");
dotenv.config();
const waApi = WolframAlphaAPI(`${process.env.WA_APP_ID}`);

let vicinityAPI = {};

vicinityAPI.findVicinityData = async function(lat, lng) {
  var dms = convertDMS(lat, lng);
  let results = [];
  return waApi
    .getFull({
      input: dms,
      output: "json",
      format: "plaintext"
    })
    .then(res => {
      res.pods.forEach(element => {
        if (
          element.title == "Nearest city" ||
          element.title == "Nearby services" ||
          element.title == "Nearby features"
        ) {
          for (var i = 0; i < element.numsubpods; i++) {
            var title =
              element.title == "Nearest city"
                ? "Nearest city"
                : element.title == "Nearby services"
                ? "Nearby services"
                : "Nearby features";

            results.push({ [title]: element.subpods[i].plaintext });
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
