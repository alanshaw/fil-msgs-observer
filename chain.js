import { Address } from '@glif/filecoin-address'
import { fromBigEndian } from './utils.js'

export class Message {
  constructor (version, to, from, nonce, value, gasLimit, gasFeeCap, gasPremium, method, params) {
    this.version = version
    this.to = to
    this.from = from
    this.nonce = nonce
    this.value = value
    this.gasLimit = gasLimit
    this.gasFeeCap = gasFeeCap
    this.gasPremium = gasPremium
    this.method = method
    this.params = params
  }

  static decodeCBOR (obj) {
    return new Message(
      obj[0],
      new Address(obj[1]),
      new Address(obj[2]),
      obj[3],
      fromBigEndian(obj[4]),
      BigInt(obj[5]),
      fromBigEndian(obj[6]),
      fromBigEndian(obj[7]),
      obj[8],
      obj[9]
    )
  }
}

export class SignedMessage {
  constructor (message, signature) {
    this.message = message
    this.signature = signature
  }

  static decodeCBOR (obj) {
    return new SignedMessage(Message.decodeCBOR(obj[0]), obj[1])
  }
}
