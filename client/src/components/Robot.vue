<template>
    <div class="app">
        <div class="symbols">
            <ul class="symbols_ul">
                <li v-for="item in symbols" @click="selectSymbol(item)" :key="item" class="symbols_li">{{item}}</li>
            </ul>
        </div>
        <div class="robots">
            <div class="robots_form">
                <form @submit.prevent @input="onInput($event)">
                    <label for="s">Символ</label>
                    <input type="text" v-model="s" id="s">
                    <label for="qQuote">Кол-во, USDT</label>
                    <input type="text" v-model="qQuote" id="qQuote">
                    <label for="sP">Стоп-цена</label>
                    <input type="text" v-model="sP" id="sP">
                    <label for="sl">Стоп-лосс, %</label>
                    <input type="text" v-model="sl" id="sl">
                    <button @click="onSubmit('LONG')" class="robots_form-button-long">Старт LONG</button>
                    <button @click="onSubmit('SHORT')" class="robots_form-button-short">Старт SHORT</button>
                </form>
                <div class="robots_form-errors">
                    <div v-for="item in errors" :key="item" class="robots_form-error">{{item}}</div>
                </div>
            </div>
            <div class="robots_active">
                <div v-for="item in robots" :key="item.id" class="robots_active-robot">
                    <button @click="cancelRobot(item.robotId)" class="robots_active-cancel"></button>
                    <div class="robots_active-robot-item">{{item.symbol}}</div>
                    <div :class="classObj(item.positionSide)" class="robots_active-robot-item">{{item.positionSide}}</div>
                    <div :class="classObj(item.positionSide)" class="robots_active-robot-item">{{item.quantity}}</div>
                    <div class="robots_active-robot-item">{{item.stopPrice}}</div>
                    <div class="robots_active-robot-item">{{item.slPrice}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import Model from "../../../model/model"
    const model = new Model()
    import {ref, onMounted, reactive, toRefs} from 'vue'
    import axios from 'axios'

    export default {
        name: 'Robot',
        async setup(){
            let price = null
            const form = reactive({s: '', qQuote: '', qBase: '', sP: '', sl: '1', slP: ''})
            const errors = ref([])
            const port = process.env.VUE_APP_PORT
            const robots = ref([])

            onMounted(
                async () => {
                    const r = await getRobots()
                    if(r) robots.value = r
                    // console.log(robots.value)
                }
            )

            const symbolsInfo = await getSymbolsInfo()
            const symbols = ref(await getSymbols(axios, 'USDT'))

            function validate() {
                errors.value = []
                if(!form.s.length) errors.value.push('Введите символ')
                if(!form.qQuote.length) errors.value.push('Введите кол-во')
                if(!form.sP.length) errors.value.push('Введите стоп-цену')
                if(!form.sl.length) errors.value.push('Введите стоп-лосс')

                const symbolInfo = symbolsInfo.find(item => item.symbol === form.s)
                const symbolFilters = symbolInfo.filters
                const {maxQty} = symbolFilters.find(item => item.filterType === 'MARKET_LOT_SIZE')
                const {notional} = symbolFilters.find(item => item.filterType === 'MIN_NOTIONAL')
                const {maxPrice, minPrice} = symbolFilters.find(item => item.filterType === 'PRICE_FILTER')

                if(form.qQuote && +form.qQuote < +notional) errors.value.push('Слишком маленькое кол-во')
                if(+form.qBase > +maxQty) errors.value.push('Слишком большое кол-во')
                if(form.sP && +form.sP < +minPrice) errors.value.push('Слишком маленькая стоп-цена')
                if(+form.sP > +maxPrice) errors.value.push('Слишком большая стоп-цена')
            }

            function calcFormFields(positionSide) {
                const symbolInfo = symbolsInfo.find(item => item.symbol === form.s)
                const {quantityPrecision} = symbolInfo
                const {pricePrecision} = symbolInfo
                if(form.qQuote) form.qBase = (form.qQuote / price).toFixed(quantityPrecision)
                if(form.sP) form.sP = (+form.sP).toFixed(pricePrecision)
                if(form.sP && form.sl) {
                    form.slP = positionSide === 'LONG' ?
                    (form.sP * (1 - form.sl * 0.01)).toFixed(pricePrecision) :
                    (form.sP * (1 + form.sl * 0.01)).toFixed(pricePrecision)
                }
            }

            async function onSubmit(positionSide) {
                calcFormFields(positionSide)
                validate()
                if(!errors.value.length) {
                    const {s: symbol, qBase: quantity, sP:stopPrice, slP: slPrice} = form
                    const robotId = `robot${Date.now()}`
                    const side = positionSide === 'LONG' ? 'BUY' : 'SELL'
                    const obj1 = {
                        symbol,
                        positionSide,
                        robotId,
                        quantity,
                        stopPrice,
                        slPrice,
                    }
                    const robot = Object.assign(obj1)
                    robot.id = await createRobot(obj1)
                    // console.log(robots.value)
                    // console.log(robot.id)
                    robots.value.push(robot)

                    const obj2 = {
                        symbol,
                        side,
                        positionSide,
                        type: 'STOP_MARKET',
                        quantity,
                        newClientOrderId: robotId,
                        stopPrice,
                        priceProtect: true
                    }
                    await model.createFOrder(axios, obj2)
                }
            }

            function onInput(e) {
                errors.value = []
                const targetId = e.target.id
                form[targetId] = form[targetId].replace(',', '.')

                if(!form.s) {
                    form[targetId] = ''
                    errors.value.push('Введите символ')
                }
            }

            async function selectSymbol(item) {
                form.s = item
                price = (await model.getFTickerPrice(axios, {symbol: form.s})).price
                errors.value = []
                form.qQuote = ''
                form.qBase = ''
                form.sP = ''
                form.sl = '1'
                form.slP = ''
            }

            async function getRobots() {
                const body = {part: 'getRobots'}
                const res = await axios.post(`${window.location.protocol}//${window.location.hostname}:${port}/ajax`, body)
                return res.data
            }

            async function getSymbols(axios, quoteAsset){
                return symbolsInfo.reduce((acc, item) => {
                    if(item.symbol.endsWith(quoteAsset)) acc.push(item.symbol)
                    return acc.sort()
                }, [])
            }

            async function getSymbolsInfo() {
                return (await model.getFExchangeInfo(axios)).symbols
            }

            async function createRobot(obj) {
                const body = {part: 'createRobot', obj}
                const res = await axios.post(`${window.location.protocol}//${window.location.hostname}:${port}/ajax`, body)
                return res.data
            }

            async function deleteRobot(orderId) {
                const body = {part: 'deleteRobot', orderId}
                const res = await axios.post(`${window.location.protocol}//${window.location.hostname}:${port}/ajax`, body)
                return res.data
            }

            async function cancelRobot(robotId) {
                await deleteRobot(robotId)
                const i = robots.value.findIndex(item => item.robotId === robotId)
                const {symbol} = robots.value.splice(i, 1)[0]
                const order = await model.getFOpenOrder(axios, {symbol, origClientOrderId: robotId})
                if(order) {
                    const {symbol, clientOrderId, positionSide, side, status, type} = order
                    const cond1 = positionSide === 'LONG'
                    const cond2 = side === 'BUY'
                    const cond3 = positionSide === 'SHORT'
                    const cond4 = side === 'SELL'
                    const cond5 = status === 'NEW'
                    const cond6 = type === 'STOP_MARKET'

                    if((cond1 && cond2 || cond3 && cond4) && cond5 && cond6) {
                        await model.deleteFOrder(axios, {symbol, origClientOrderId: clientOrderId})
                    }
                }
            }

            function classObj(positionSide) {
                return {buy: positionSide === 'LONG', sell: positionSide === 'SHORT'}
            }

            return {symbols, ...toRefs(form), onSubmit, errors, robots, cancelRobot, onInput, selectSymbol, classObj}
        },
    }

</script>

<style lang="sass" scoped>

.app
    display: flex
    font-family: "HelveticaNeue", sans-serif
    font-size: 12px
    color: #E0E0E0
    line-height: 1
    background: #101010
    overflow: hidden

.symbols
    display: flex
    flex: 0 0 100px
    height: 100%
    margin-left: 20px

    &_ul
        display: flex
        flex-direction: column
        flex: 1 0
        overflow: auto
        scrollbar-width: none

    &_li
        display: flex
        flex: 1 0
        padding: 5px 15px
        background: #202020
        cursor: default

.robots
    display: flex
    flex-direction: column
    flex: 1 0
    width: 100%
    /*background: dodgerblue*/

    &_form
        display: flex
        flex-direction: column
        align-items: center
        height: 300px
        overflow: hidden
        /*background: gold*/

    &_form form
        display: flex
        height: 26px
        margin-top: 100px
        /*background: darkorange*/

    &_form-errors
        display: flex
        flex-direction: column
        align-items: center
        flex: 1
        width: 100%
        /*background: yellowgreen*/

    &_form-error
        display: flex
        align-items: center
        flex: 0 0
        padding: 7px
        margin-top: 5px
        color: orangered
        border: 1px solid orangered

    &_form-button-long, &_form-button-short
        height: 100%
        margin-left: 1px
        width: 100px
        padding: 0 10px
        background: #202020

    &_form-button-long
        color: #E0E0E0
        /*background: limegreen*/
        background: rgba(50, 205, 50, 0.8)

    &_form-button-short
        color: #E0E0E0
        /*background: orangered*/
        background: rgba(255, 69, 0, 0.8)

    &_active
        display: flex
        flex-direction: column
        align-items: center
        flex: 1 0
        /*background: fuchsia*/

    &_active-robot
        display: flex
        flex: 0 0 auto
        height: 26px
        margin-bottom: 20px

    &_active-robot-item
        display: flex
        flex: 0 0 auto
        justify-content: center
        align-items: center
        width: 100px
        height: 100%
        background: #505050
        padding: 0 5px
        margin-left: 1px

    &_active-cancel
        height: 100%
        width: 26px
        /*background: darkorange*/
        background: rgba(255, 140, 0, 0.8)
        /*background: #101010*/
        color: #E0E0E0

label
    display: flex
    flex: 0 0 auto
    align-items: center
    height: 100%
    padding: 0 10px
    background: #303030

input[type="text"]
    text-align: center
    width: 100px
    height: 100%
    font-family: "HelveticaNeue", sans-serif
    font-size: 12px
    color: #E0E0E0
    line-height: 1
    background: #505050

.buy
    color: limegreen

.sell
    color: orangered

</style>


