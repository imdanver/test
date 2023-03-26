<template>
    <div class="rates">
        <div class="rates__header">Курсы валют</div>
        <div class="rates__content">
            <ul class="rates__ul">
                <li v-for="item of resList" :key="item" class="rates__li">
                    <span>{{`${item.symbol} | ${assetBuy}`}}</span>
                    <span>{{item.price}}</span>
                </li>
            </ul>
            <ul class="rates__ul-buy">
                <li v-for="item of listBuy" :key="item" @click="setAssetBuy($event)" class="rates__li-buy">
                    {{item}}
                </li>
            </ul>
        </div>
        <button @click="modalOn = true">ДОБАВИТЬ НОВУЮ ВАЛЮТУ К СПИСКУ</button>
    </div>
    <div v-if="modalOn" class="modal">
        <div class="modal__select">
            <div class="modal__header">
                <span>Выберите валюту</span>
                <i @click="modalOn = false" class="fa fa-close"></i>
            </div>
            <div class="modal__ul">
                <div @click="addAsset($event)" v-for="item of moreSellAssets" :key="item" class="modal__li">
                    {{item}}
                </div>
            </div>

        </div>
    </div>
</template>

<script>

    export default {
        name: "ExchangeSection",
        props: ['prices'],
        data() {
            return {
                defaultBuyAsset: 'USD',
                assetBuy: 'USD',
                sellAssets: ['BTC', 'ETH', 'EUR', 'UAH', 'USD'],
                currSellAssets: [],
                listBuy: ['EUR', 'UAH', 'USD'],
                moreSellAssets: ['ADA', 'AUD', 'BRL', 'DOGE', 'DOT', 'LTC', 'MATIC', 'NGN', 'PLN', 'RON', 'SOL', 'TRY', 'ZAR'],
                modalOn: false,
                resList: [],
            }
        },
        watch: {
          prices() {
              this.calcRates()
            }
        },
        methods: {
            calcRates(){
                const assets = localStorage.assets
                if(assets) this.sellAssets = JSON.parse(assets)
                this.currSellAssets = this.sellAssets.filter(item => item !== this.assetBuy)
                const list = this.currSellAssets.map(item1 => this.prices.find(item2 => item2.symbol === item1))
                const {price: price0} = this.prices.find(item2 => item2.symbol === this.assetBuy)

                this.resList = list.map(item => {
                    const {symbol, price: p} = item
                    const res = p / price0
                    const price = res.toFixed(2)
                    return {symbol, price}
                })
            },
            setAssetBuy(e){
                this.assetBuy = e.target.innerText
                this.calcRates()
            },
            addAsset(e) {
                const assetName = e.target.innerText
                if(!this.sellAssets.includes(assetName)) this.sellAssets.push(assetName)
                localStorage.assets = JSON.stringify(this.sellAssets)
                this.calcRates()
                this.modalOn = false
            },

        }
    }
</script>

<style lang="sass" scoped>

.rates
    display: flex
    flex-direction: column
    width: 100%
    margin-top: 1rem

    &__header
        background: #32CD32
        padding: .5rem 1rem
        margin-bottom: .5rem

    &__ul
        display: flex
        justify-content: flex-start
        align-items: center
        flex-wrap: wrap
        min-height: 7rem
        padding: .25rem

    &__li
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        padding: .75rem
        border: 1px solid #32CD32
        line-height: 1
        margin: .25rem
        width: 9rem
        height: 5rem

    &__li span:first-child
        color: #A61414

    &__li span:last-child
        display: flex
        margin-top: .5rem

    &__ul-buy
        display: flex
        justify-content: flex-start
        flex-wrap: wrap
        margin-top: .5rem
        padding: .25rem

    &__li-buy
        display: flex
        justify-content: center
        align-items: center
        padding: .75rem
        background: #FF9595
        margin: .25rem
        border-radius: .5rem
        cursor: pointer

    &__li-buy:hover
        background: #ffaaaa

button
    display: flex
    justify-content: center
    padding: 1rem
    margin-top: 2rem
    cursor: pointer
    border-radius: .5rem
    background: #439A43
    font-size: .9rem

button:hover
    background: #69ae69

.modal
    display: flex
    justify-content: center
    align-items: center
    position: absolute
    top: 0
    right: 0
    bottom: 0
    left: 0
    background: white

    &__select
        display: flex
        justify-content: center
        align-items: center
        flex-direction: column
        flex: 1
        max-width: 400px
        background: #c3f3c3
        border-radius: .5rem

    &__header
        display: flex
        justify-content: space-between
        width: 100%
        padding: 1rem 1.5rem
        background: #64E664
        border-radius: .5rem .5rem 0 0

    &__header i
        cursor: pointer

    &__ul
        width: 100%

    &__li
        display: flex
        width: 100%
        padding: .75rem 1.5rem
        cursor: pointer

    &__li:last-child
        border-radius: 0 0 .5rem .5rem

    &__li:nth-child(even)
        background: #86E686

    &__li:hover
        background: #439A43

</style>
