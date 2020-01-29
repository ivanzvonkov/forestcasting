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
            const collection = client.db("forestcasting").collection("location_eco");

            // perform actions on the collection object
            collection.findOne({"KEY": locationKey}).then(dbResult => {
                //close the connection
                client.close();
                const result = new EcoData(
                dbResult["KEY"],
                dbResult["ECOZONE"],
                dbResult["ECOREGION"],
                dbResult["ECODSTRICT"]
            );
            resolve(result)
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
            const collection = client.db("forestcasting").collection("location_historic");
            // perform actions on the collection object
            collection.findOne({"LOCATION_KEY": locationKey})
                .then(dbResult => {
                    //close the connection
                    client.close();
                    let result = {}
                    let latlng = locationKey.split("|")
                    if(dbResult){
                        // Results will be array of HistoricData
                        result = new HistoricData(
                            latlng[0],
                            latlng[1],
                            dbResult["LOCATION_KEY"],
                            dbResult["TOTAL_SIZE_HA_OLD"],
                            dbResult["AVERAGE_SIZE_HA_OLD"],
                            dbResult["TOTAL_DURATION_OLD"],
                            dbResult["AVERAGE_DURATION_OLD"],
                            dbResult["MOST_RECENT_DATE"]
                        )
                    } else {
                      result = new HistoricData(
                        latlng[0],
                        latlng[1],
                        locationKey,
                        0,
                        0,
                        0,
                        0
                      )
                    }
                resolve(result)
            })
        })
    });
}

dbQuery.findEcoInfo = async function(ecoData){
    return new Promise(function(resolve, reject){
        MongoClient.connect(uri, function(err, client) {
            if(err) {
                    console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
            }
            const collection = client.db("forestcasting").collection("stats_eco");
            // perform actions on the collection object
            collection.findOne({"ECOZONE": ecoData.zone}).then(dbResult => {
                //close the connection
                client.close();
                ecoData.averageFireSizeForZone = dbResult["AVERAGE_SIZE_HA_OLD"]
                ecoData.averageFireDurationForZone = dbResult["AVERAGE_DURATION_OLD"]
                ecoData.description = dbResult["DESCRIPTION"]
                ecoData.zoneName = dbResult["ZONE_NAME"]
                resolve(ecoData)
            })
        })
    })
}

module.exports = dbQuery;
