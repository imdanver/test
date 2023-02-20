import querystring from 'querystring'
import CryptoJS from 'crypto-js'

export default class Binance {

  baseUrl = 'https://fapi.binance.com'
  key = '0Zv6JihoysXRgqQLxX2Z0Sv4YXsyqwosase6CxHdBjsMTag4EoHQvYXPKrq6ToIM'
  secret = 'lERvREIHvRBgeDJsIosNVEJA4V2CWi8x8J7b1d297SfGmggqUAOvotK8vxPZvVwN'

  methods = {

    // Public methods
    'fKlines': {'url': '/fapi/v1/klines', 'method': 'GET', 'private': false, 'futures': true},
    'fTicker24hr': {'url': '/fapi/v1/ticker/24hr', 'method': 'GET', 'private': false, 'futures': true},
    'fExchangeInfo': {'url': '/fapi/v1/exchangeInfo', 'method': 'GET', 'private': false, 'futures': true},
    'fTickerPrice': {'url': '/fapi/v1/ticker/price', 'method': 'GET', 'private': false, 'futures': true},
    // Private methods
    'fBalance': {'url': '/fapi/v2/balance', 'method': 'GET', 'private': true, 'futures': true},
    'fPositionSide': {'url': '/fapi/v1/positionSide/dual', 'method': 'GET', 'private': true, 'futures': true},
    'fOpenOrders': {'url': '/fapi/v1/openOrders', 'method': 'GET', 'private': true, 'futures': true},
    'fOpenOrder': {'url': '/fapi/v1/openOrder', 'method': 'GET', 'private': true, 'futures': true},
    'createFOrder': {'url': '/fapi/v1/order', 'method': 'POST', 'private': true, 'futures': true},
    'deleteFOrder': {'url': '/fapi/v1/order', 'method': 'DELETE', 'private': true, 'futures': true},
    'queryFOrder': {'url': '/fapi/v1/order', 'method': 'GET', 'private': true, 'futures': true},
    'fListenKey': {'url': '/fapi/v1/listenKey', 'method': 'POST', 'private': true, 'futures': true},
    'fAllOrders': {'url': '/fapi/v1/allOrders', 'method': 'GET', 'private': true, 'futures': true},
  }

  async toApi(axios, methodName, obj = {}) {
    try {
      for (const key in this.methods) {
        if (key === methodName) {
          const config = {}
          config.url = `${this.baseUrl}${this.methods[key].url}`
          config.method = this.methods[key].method
          config.params = obj
          if (this.methods[key].private) {
            config.headers = {'X-MBX-APIKEY': this.key}
            config.params.signature = CryptoJS.HmacSHA256(querystring.stringify(obj), this.secret).toString(CryptoJS.enc.Hex)
          }
          // console.log(config)
          const res = await axios(config)
          return res.data
        }
      }
    }
    catch(e){
      console.log(e)
    }
  }
}

