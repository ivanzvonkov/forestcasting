class HistoricData {
    constructor (LATITUDE, LONGITUDE, LOCATIONKEY, TOTAL_SIZE_HA_OLD, AVERAGE_SIZE_HA_OLD,TOTAL_DURATION_OLD, AVERAGE_DURATION_OLD, LASTFIREDATE){
        this.latitude = LATITUDE
        this.longitude = LONGITUDE
        this.locationKey = LOCATIONKEY
        this.totalFireSize = TOTAL_SIZE_HA_OLD
        this.averageFireSize = AVERAGE_SIZE_HA_OLD
        this.totalFireDuration = TOTAL_DURATION_OLD
        this.averageFireDuration = AVERAGE_DURATION_OLD
        this.lastFireDate = LASTFIREDATE
      }

     size() {
        console.log("The historic data contains a total size of: " + str(this.TOTAL_SIZE_HA_OLD))
        console.log("And an average size of: " + str(this.AVERAGE_SIZE_HA_OLD))
      }
    }

module.exports = HistoricData
