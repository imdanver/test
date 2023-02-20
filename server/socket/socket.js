import WebSocket from 'ws'

export default class Socket{

    socket = null
    host = 'wss://fstream.binance.com/ws/'

    start(listenKey, onMessage){
        this.url = `${this.host}${listenKey}`
        // Закрыть старый сокет
        this.socket = new WebSocket(this.url)
        this.socket.on('message', onMessage)
    }

}

// ws.on('close', function() {
//     clients.delete(ws);
// });