import Ably from 'ably'

let CHANNEL_NAME = ''
const MESSAGE_NAME = 'emote'
let channel = null
const client = new Ably.Realtime.Promise({
  key:import.meta.env.PUBLIC_ABLY_API_KEY,
  autoConnect: false,
})
const channelOpts = { params: { occupancy: 'metrics.subscribers' } }

export async function init (space, emoteCallback, metricsCallback) {
  _transaction(async () => {
    const promises = []
    await client.connect()
    CHANNEL_NAME = space
    channel = client.channels.get(CHANNEL_NAME, channelOpts)
    promises.push(channel.subscribe(MESSAGE_NAME, (message) => {
      if (message.connectionId === client.connection.id) return
      emoteCallback(message)
    }))
    promises.push(channel.subscribe('[meta]occupancy', (message) => {
      console.log('[SocketService] occupancy', message.data.metrics.subscribers)
      metricsCallback(message.data.metrics)
    }))
    // promises.push(channel.presence.enter())
    const history = await channel.history({ limit: 10 })
    history.items.forEach(message => {
      setTimeout(() => emoteCallback(message), Math.random() * 1000)
    })
    // const presenceMessage = await channel.presence.get()
    // console.log('[SocketService] presence', presenceMessage)
    await Promise.all(promises)
    console.info('[SocketService] init', client.connection.state, client.connection.id)
  })
}

export async function deinit () {
  _transaction(async () => {
    // await channel.presence.leave()
    if (channel) await channel.unsubscribe()
    if (client.connection.state = 'connected') await client.close()
    console.info('[SocketService] deinit', client.connection.state, client.connection.id)
  })
}

export async function publish (message) {
  _transaction(async () => {
    await channel.publish(MESSAGE_NAME, message)
  })
}

const _transactionQueue = []
let _transactionBusy = false
function _transaction (asyncCallback) {
  _transactionQueue.push(asyncCallback)
  _processTransactionQueue()
}
async function _processTransactionQueue () {
  if (_transactionBusy) return
  _transactionBusy = true
  const txn = _transactionQueue.pop()
  await txn()
  _transactionBusy = false
  if (_transactionQueue.length) _processTransactionQueue()
}
