class AnalysisResponse {
  constructor(ecoData, weatherData, historicData){
    this.ecoData = ecoData
    this.weatherData = weatherData
    this.historicData = historicData
  }

  buildResponse(analysisResults) {
    // analysisTyple = [riskScore, damageScore]
    let response = {
      "location": this.historicData,
      "geography": this.ecoData,
      "weather": this.weatherData,
      "riskScore": analysisResults[0],
      "damageScore": analysisResults[1]
    }
    return response
  }
}

module.exports = AnalysisResponse
