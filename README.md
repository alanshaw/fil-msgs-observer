# fil-msgs-observer

Watching gossiped Filecoin messages using just a libp2p node.

## Wait, what?

1. The code boots up a `js-libp2p` node. YES JAY ESS.
1. It connects to a random mainnet bootstrap node.
1. It handles an incoming `/fil/hello/1.0.0` stream and...
    * Logs out the hello message
    * Responds with a latency message
1. It listens to the `/fil/msgs/testnetnet` pubsub topic (yes `testnetnet` is the mainnet topic 🤷‍♀️)
    * Logs out (raw) CBOR decoded messages
