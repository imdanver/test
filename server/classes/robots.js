import pool from '../connection/connection.js'
import Model from '../../model/model.js'
const model = new Model()
import Socket from "../socket/socket.js"
import axios from 'axios'

export default class Robots {

    constructor(){
        this.socket = new Socket()
        this.startSocket()
        // this.start12HTimer()
        this.start30MinTimer()
    }

    async startSocket(){
        const listenKey = await this.updateFListenKey()
        this.socket.start(listenKey, this.onMessage)
    }

    async updateFListenKey(){
        const res = await model.updateFListenKey(axios)
        return res.listenKey
    }

    // start12HTimer(){
    //     setInterval(this.updateFListenKey, 43200000)
    // }

    start30MinTimer(){
        setInterval(this.updateFListenKey, 1800000)
    }

    onMessage = async data => {
        const res = JSON.parse(data.toString())

        if(res.e === 'ORDER_TRADE_UPDATE') {
            const order = res.o
            console.log(order)
            console.log('=================================')
            const robotId = order.c
            const robots = await model.getRobots(pool)
            const robot = robots.find(item => item.robotId === robotId)

            if(robot && order.X === 'FILLED') {
                const {symbol, positionSide, robotId, quantity, stopPrice, slPrice} = robot
                const {ps, S} = order
                const cond1 = ps === 'LONG' && S === 'BUY'
                const cond2 = ps === 'SHORT' && S === 'SELL'
                const cond3 = ps === 'LONG' && S === 'SELL'
                const cond4 = ps === 'SHORT' && S === 'BUY'

                if(cond1 || cond2) {
                    // Set stop-loss
                    const side = S === 'BUY' ? 'SELL' : 'BUY'
                    const obj = {
                        symbol,
                        side,
                        positionSide,
                        type: 'STOP_MARKET',
                        timeInForce: 'GTE_GTC',
                        newClientOrderId: robotId,
                        stopPrice: slPrice,
                        closePosition: true,
                        priceProtect: true
                    }
                    await model.createFOrder(axios, obj)
                    console.log(await model.getFServerTime(axios))
                }
                else if(cond3 || cond4) {
                    // Set stop order
                    const side = S === 'BUY' ? 'SELL' : 'BUY'
                    const obj = {
                        symbol,
                        side,
                        positionSide,
                        type: 'STOP_MARKET',
                        quantity,
                        newClientOrderId: robotId,
                        stopPrice,
                        priceProtect: true
                    }
                    await model.createFOrder(axios, obj)
                }
            }
        }
    }
}

