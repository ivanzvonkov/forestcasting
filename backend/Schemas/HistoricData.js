class HistoricData {
    constructor (TOTAL_SIZE_HA_OLD, AVERAGE_SIZE_HA_OLD,TOTAL_DURATION_OLD, AVERAGE_DURATION_OLD){
        this.TOTAL_SIZE_HA_OLD = TOTAL_SIZE_HA_OLD
        this.AVERAGE_SIZE_HA_OLD = AVERAGE_SIZE_HA_OLD
        this.TOTAL_DURATION_OLD = TOTAL_DURATION_OLD
        this.AVERAGE_DURATION_OLD = AVERAGE_DURATION_OLD
      }

     size() {
        console.log("The historic data contains a total size of: " + str(this.TOTAL_SIZE_HA_OLD))
        console.log("And an average size of: " + str(this.AVERAGE_SIZE_HA_OLD))
      }
    }

module.exports = HistoricData
