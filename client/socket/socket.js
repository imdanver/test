export default class Socket{

    host = 'wss://fstream.binance.com/'
    streamPatterns = ['<symbol>@miniTicker']
    socket = null
    streams = null

    // const arr = [{name: '@miniTicker', symbol: form.s}]
    // socket.start(arr, onMessage)

    // function onMessage(e) {
    //     const data = JSON.parse(e.data).data
    //     if(data.e === '24hrMiniTicker') price = data.c
    //     console.log(price)
    // }

    start(arr, onMessage){
        const streams = this.calcStreams(arr)
        const url = `${this.host}stream?streams=${streams}`
        if(!this.socket) this.socket = new WebSocket(url)
        else if(this.streams !== streams) {
            this.socket.close()
            this.socket = new WebSocket(url)
        }
        this.streams = streams
        this.socket.onmessage = onMessage
    }

    calcStreams(arr) {
        const streamNames = []
        for(const obj of arr) {
            let streamName = this.streamPatterns.find(item => item.includes(obj.name))
            delete obj.name
            for(const item of Object.entries(obj)) {
                const [key, value] = item
                streamName = streamName.replace(`<${key}>`, value.toLowerCase())
            }
            streamNames.push(streamName)
        }
        return  streamNames.join('/')
    }


}
