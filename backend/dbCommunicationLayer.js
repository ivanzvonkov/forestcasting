const dotenv = require('dotenv')
dotenv.config()
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@forestcasting-umgnk.mongodb.net/'

console.log(uri)

function findEcoData(locationKey){
  MongoClient.connect(uri, function(err, client) {
     if(err) {
          console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
     }
     console.log('Connected...');
     const collection = client.db("forestcasting").collection("location_eco");
     // perform actions on the collection object
     collection.find({"KEY": locationKey})
     .toArray()
     .then(results => {
       //close the connection
       client.close();
       // log  and return the results
       console.log(results)
       return results
      })
  });
}

findEcoData("49.0|-113.8")
