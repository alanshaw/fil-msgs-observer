export function nowUnixNano () {
  const hrTime = process.hrtime()
  return hrTime[0] * 1000000000 + hrTime[1]
}
