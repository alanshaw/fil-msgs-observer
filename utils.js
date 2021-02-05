export function nowUnixNano () {
  const hrTime = process.hrtime()
  return hrTime[0] * 1000000000 + hrTime[1]
}

export function fromLittleEndian (bytes) {
  let result = 0n
  let base = 1n
  bytes.forEach(byte => {
    result += base * BigInt(byte)
    base = base * 256n
  })
  return result
}

export function fromBigEndian(bytes) {
  return fromLittleEndian(bytes.reverse());
}
