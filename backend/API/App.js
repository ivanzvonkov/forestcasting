const express = require("express");
const bodyParser = require('body-parser');
const querystring = require('querystring');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/getAnalysis", async function (req, res, next) => {
  let lat = req.query.lat
  let lng = req.query.lng
  let date = req.query.date

})

module.exports = app
