const EcoData = require("../Schemas/EcoData.js")
const HistoricData = require("../Schemas/HistoricData.js")
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv')
dotenv.config()

const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@forestcasting-umgnk.mongodb.net/'

let dbQuery = {}

dbQuery.findEcoData = function(locationKey) {
  return new Promise(function(resolve, reject){
    MongoClient.connect(uri, function(err, client) {
       if(err) {
            console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
       }
       console.log('Connected...');
       const collection = client.db("forestcasting").collection("location_eco");
       // perform actions on the collection object
       collection.find({"KEY": locationKey})
       .toArray()
       .then(cursor => {
         //close the connection
         client.close();

         // Results will be array of ecoData
         let results = []

         // Build array of ecoData objects
         cursor.forEach(element => results.push(new EcoData(
           element["KEY"],
           element["LATITUDE"],
           element["LONGITUDE"],
           element["ECOZONE"],
           element["ECOREGION"],
           element["ECODSTRICT"]
         )))

          resolve(results)
        })
      })
  });
}

dbQuery.findHistoricData = function (locationKey) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(uri, function(err, client) {
       if(err) {
            console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
       }
       console.log('Connected...');
       const collection = client.db("forestcasting").collection("location_historic");
       // perform actions on the collection object
       collection.find({"locationKey": locationKey}).limit(1)
       .toArray()
       .then(cursor => {
         //close the connection
         client.close();

         // Results will be array of HistoricData
         let results = []

         // Build array of HistoricData objects
         cursor.forEach(element => results.push(new HistoricData(
           element["locationKey"],
           element["TOTAL_SIZE_HA_OLD"],
           element["AVERAGE_SIZE_HA_OLD"],
           element["TOTAL_DURATION_OLD"],
           element["AVERAGE_DURATION_OLD"],
         )))

          resolve(results)
        })
      })
  });
}

module.exports = dbQuery;
