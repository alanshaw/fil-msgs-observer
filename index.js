import fs from 'fs'
import Libp2p from 'libp2p'
import TCP from 'libp2p-tcp'
import WS from 'libp2p-websockets'
import { NOISE } from 'libp2p-noise'
import Mplex from 'libp2p-mplex'
import Gossipsub from 'libp2p-gossipsub'
import shuffle from 'array-shuffle'
import * as dagcbor from '@ipld/dag-cbor'
import PeerID from 'peer-id'
import { HelloMessage, LatencyMessage } from './hello.js'
import { BOOTSTRAPPERS } from './bootstrappers.js'
import { nowUnixNano } from './utils.js'

const NETWORK_NAME = 'testnetnet'
const MSGS_TOPIC = `/fil/msgs/${NETWORK_NAME}`

async function main () {
  const peerID = await getPeerID()
  const node = await Libp2p.create({
    peerId: peerID,
    addresses: { listen: ['/ip4/127.0.0.1/tcp/3000', '/ip4/127.0.0.1/tcp/3001/ws'] },
    modules: {
      transport: [TCP, WS],
      connEncryption: [NOISE],
      streamMuxer: [Mplex],
      pubsub: Gossipsub
    }
  })
  
  await node.start()
  console.log('Libp2p node has started')

  process.on('SIGINT', async () => {
    console.log('Stopping...')
    await node.stop()
    process.exit()
  })

  const listenAddrs = node.transportManager.getAddrs()
  console.log('Listening on:', listenAddrs.map(m => `${m}`))
  console.log('Advertising on:', node.multiaddrs.map(m => `${m}`))

  node.handle('/fil/hello/1.0.0', async ({ connection, stream }) => {
    let chunks, tArrival
    for await (const chunk of stream.source) {
      chunks = chunks ? chunks.append(chunk) : chunk
      try {
        const msg = HelloMessage.decodeCBOR(dagcbor.decode(chunks.slice()))
        tArrival = nowUnixNano()
        console.log(`Hello message from ${connection.remoteAddr}:`)
        console.log(msg)
        break
      } catch (err) {} // streaming cbor decode would be nice...
    }

    // TODO: fetch tipset from peer

    stream.sink(function * () {
      const latency = new LatencyMessage(tArrival, nowUnixNano())
      yield dagcbor.encode(latency.encodeCBOR())
      console.log(`Sent latency message to ${connection.remoteAddr}:`)
      console.log(latency)
    }())
  })

  node.connectionManager
    .on('peer:connect', conn => console.log(`Peer connected: ${conn.remoteAddr}`))
    .on('peer:disconnect', conn => console.log(`Peer disconnected: ${conn.remoteAddr}`))

  node.pubsub.on(MSGS_TOPIC, msg => console.log(`${msg.from}:`, dagcbor.decode(msg.data)))
  // node.pubsub.on(MSGS_TOPIC, msg => console.log(`Received message from: ${msg.from}`))
  await node.pubsub.subscribe(MSGS_TOPIC)
  console.log(`Subscribed to: ${MSGS_TOPIC}`)

  await bootstrap(node)
}

async function bootstrap (node) {
  let bootstrapped = false
  for (let addr of shuffle(BOOTSTRAPPERS)) {
    try {
      console.log(`Dialing ${addr}`)
      const conn = await node.dial(addr)
      bootstrapped = true
      break
    } catch (err) {
      err.message = `dial failed to ${addr}: ${err.message}`
      console.warn(err)
    }
  }

  if (!bootstrapped) {
    throw new Error('failed to bootstrap')
  }
}

async function getPeerID () {
  let peerID
  try {
    peerID = await PeerID.createFromJSON(JSON.parse(await fs.promises.readFile('./.peer', 'utf8')))
    console.log(`Using existing peer ID: ${peerID}`)
  } catch (err) {
    peerID = await PeerID.create()
    await fs.promises.writeFile('./.peer', JSON.stringify(peerID.toJSON()))
    console.log(`Created new peer ID: ${peerID}`)
  }
  return peerID
}

main()
