import Binance from '../api/binance.js'

export default class Model{

    constructor(){
        this.bn = new Binance()
    }

    // API

    async getFServerTime(axios){
        try{
            console.log('From model - ', this.timestampToDatetime(Date.now()))
            return await this.bn.toApi(axios, 'fServerTime')
        }catch(e){console.log(e)}
    }

    async getFExchangeInfo(axios){
        return await this.bn.toApi(axios, 'fExchangeInfo')
    }

    async getFKlines(axios, obj){
        return await this.bn.toApi(axios, 'fKlines', obj)
    }

    async getFTickerPrice(axios, obj){
        return await this.bn.toApi(axios, 'fTickerPrice', obj)
    }

    async getFTicker24hr(axios, obj){
        return await this.bn.toApi(axios, 'fTicker24hr', obj)
    }

    async getFBalance(axios){
        return await this.bn.toApi(axios, 'fBalance', {timestamp: Date.now()})
    }

    async getFPositionSide(axios){
        return await this.bn.toApi(axios, 'fPositionSide', {timestamp: Date.now()})
    }

    async getFOpenOrders(axios){
        return await this.bn.toApi(axios, 'fOpenOrders', {timestamp: Date.now()})
    }

    async getFOpenOrder(axios, obj){
        try{
            obj.timestamp = Date.now()
            obj.recvWindow = 10000
            return await this.bn.toApi(axios, 'fOpenOrder', obj)
        }catch(e){console.log(e)}
    }

    async createFOrder(axios, obj){
        try{
            obj.timestamp = Date.now() - 5000
            obj.recvWindow = 10000
            console.log(this.timestampToDatetime(obj.timestamp))
            return await this.bn.toApi(axios, 'createFOrder', obj)
        }catch(e){console.log(e)}
    }

    async deleteFOrder(axios, obj){
        try{
            obj.timestamp = Date.now()
            return await this.bn.toApi(axios, 'deleteFOrder', obj)
        }catch(e){console.log(e)}
    }

    async getFOrder(axios, obj){
        obj.timestamp = Date.now() - 5000
        return await this.bn.toApi(axios, 'queryFOrder', obj)
    }

    async updateFListenKey(axios){
        return await this.bn.toApi(axios, 'fListenKey')
    }

    async getFAllOrders(axios, obj){
        obj.timestamp = Date.now()
        return await this.bn.toApi(axios, 'fAllOrders', obj)
    }

    // DB

    async createRobot(pool, obj){
        try{
            const entries = Object.entries(obj)
            const arr = entries.map(item => `${item[0]} = '${item[1]}'`)
            const sql = `INSERT INTO robots SET ${arr.join(', ')}`
            const res = await pool.query(sql)
            return res[0].insertId
        }catch(e){console.log(e)}
    }

    async getRobots(pool){
        try{
            const sql = `SELECT * FROM robots`
            const res = await pool.query(sql)
            return res[0]
        }catch(e){console.log(e)}
    }

    async deleteRobot(pool, robotId){
        try{
            const res = await pool.query(`DELETE FROM robots WHERE robotId = '${robotId}'`)
            return res[0].affectedRows
        }catch(e){console.log(e)}
    }

    // Other

    timestampToDatetime(timestamp) {
        const date = new Date(timestamp)
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
        const ms = date.getMilliseconds() < 10 ? '0' + date.getMilliseconds() : date.getMilliseconds()
        return `${day}-${month}-${date.getFullYear()} ${hours}:${minutes}:${seconds}.${ms}`
    }

}
