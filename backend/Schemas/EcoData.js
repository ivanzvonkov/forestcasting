class EcoData {
    constructor (KEY, ECOZONE, ECOREGION, ECODISTRICT) {
      this.locationKey = KEY
      this.zone = ECOZONE
      this.region = ECOREGION
      this.district = ECODISTRICT
      this.averageFireSizeForZone = 0 //if undefined default is 0
      this.averageFireDurationForZone = 0 //if undefined default is 0
      this.description = ""
      this.zoneName = ""
    }

  }

module.exports = EcoData
