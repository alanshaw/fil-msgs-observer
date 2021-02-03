export class HelloMessage {
  constructor (heaviestTipSet, heaviestTipSetHeight, heaviestTipSetWeight, genesisHash) {
    this.heaviestTipSet = heaviestTipSet
    this.heaviestTipSetHeight = heaviestTipSetHeight
    this.heaviestTipSetWeight = heaviestTipSetWeight
    this.genesisHash = genesisHash
  }

  encodeCBOR () {
    return [
      this.heaviestTipSet,
      this.heaviestTipSetHeight,
      this.heaviestTipSetWeight,
      this.genesisHash
    ]
  }

  static decodeCBOR (obj) {
    return new HelloMessage(...obj)
  }
}

export class LatencyMessage {
  constructor (tArrival, tSent) {
    this.tArrival = tArrival
    this.tSent = tSent
  }

  encodeCBOR () {
    return [this.tArrival, this.tSent]
  }

  static decodeCBOR (obj) {
    return new LatencyMessage(...obj)
  }
}
