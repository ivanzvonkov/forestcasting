class EcoData {
    constructor (KEY, LAT, LON, ECOZONE, ECOREGION, ECODISTRICT) {
      this.locationKey = KEY
      this.latitude = LAT
      this.longitude = LON
      this.zone = ECOZONE
      this.region = ECOREGION
      this.district = ECODISTRICT
      this.description = "The Prairie Ecozone occupies a semi-circular area that has its base on the Canada-U.S. border and arcs from the western edge of Alberta to the eastern edge of Manitoba. Climatic characteristics include over 400 mm of precipitation annually. The mean daily January temperatures of -22.5ºC to -25ºC and mean daily July temperatures of 15ºC to 17.5ºC."
      this.averageFireDurationForZone = 44
      this.averageFireSizeForZone = 29
    }
  }

module.exports = EcoData
