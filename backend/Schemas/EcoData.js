class EcoData {
    constructor (KEY, LAT, LON, ECOZONE, ECOREGION, ECODISTRICT) {
      this.KEY = KEY
      this.LATITUDE = LAT
      this.LONGITUDE = LON
      this.ZONE = ECOZONE
      this.REGION = ECOREGION
      this.DISTRICT = ECODISTRICT
      this.DESCRIPTION = "The Prairie Ecozone occupies a semi-circular area that has its base on the Canada-U.S. border and arcs from the western edge of Alberta to the eastern edge of Manitoba. Climatic characteristics include over 400 mm of precipitation annually. The mean daily January temperatures of -22.5ºC to -25ºC and mean daily July temperatures of 15ºC to 17.5ºC."
      this.AVERAGEFIREDURATIONFORZONE = 44
      this.AVERAGEFIRESIZEFORZONE = 29
    }
  }

module.exports = EcoData
