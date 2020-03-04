class DamageData {
    constructor (protected_area, tree_coverage) {
      this.protected_area = protected_area
      this.tree_coverage = tree_coverage
    }

    setVicinity(vicinity){
      this.vicinity = vicinity
    }
  }

module.exports = DamageData
