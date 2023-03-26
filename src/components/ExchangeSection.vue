<template>
    <div class="ex">
        <form>
            <div class="ex__header">Конвертация валют</div>
            <div class="ex__content">
                <div class="ex__label">ОТДАЕТЕ</div>
                <div class="ex__row">
                    <div class="ex__column">
                        <input @input="calcBuyAssetQuantity" type="text" v-model="sellQty">
                    </div>
                    <div class="ex__column">
                        <div @click="showList($event)" id="sell" class="ex__select">
                            {{assetSell}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="ex__content">
                <div class="ex__label">ПОЛУЧАЕТЕ</div>
                <div class="ex__row">
                    <div class="ex__column">
                        <input @input="calcSellAssetQuantity" type="text" v-model="buyQty">
                    </div>
                    <div class="ex__column">
                        <div @click="showList($event)" id="buy" class="ex__select">
                            {{assetBuy}}
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <div :class="{error: error}" class="ex__error">
            <span v-if="error">{{error}}</span>
        </div>
    </div>
    <div v-if="modalOn" class="modal">
        <div class="modal__select">
            <div class="modal__header">
                <span>Выберите валюту</span>
                <i @click="modalOn = false" class="fa fa-close"></i>
            </div>
            <div class="modal__ul">
                <div @click="getAsset($event)" v-for="item of currList" :key="item" class="modal__li">
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
                defaultAssetSell: 'USD',
                defaultAssetBuy: 'BTC',
                assetSell: 'USD',
                assetBuy: 'BTC',
                defaultSellQty: 0,
                defaultBuyQty: 0,
                sellQty: 0,
                buyQty: 0,
                list: ['USD', 'EUR', 'UAH', 'GBP', 'BTC', 'ETH', 'BNB', 'XRP'],
                currList: [],
                modalOn: false,
                error: false,
            }
        },
        methods: {
            showList(e) {
                if (e.target.id === 'sell') this.currList = this.list.filter(item => item !== this.assetBuy)
                else if (e.target.id === 'buy') this.currList = this.list.filter(item => item !== this.assetSell)
                this.modalOn = e.target.id
            },
            getAsset(e) {
                if (this.modalOn === 'sell') {
                    this.assetSell = e.target.innerText
                    if(this.assetSell === this.assetBuy && this.assetBuy === 'BTC') this.assetBuy = this.defaultAssetSell
                    else if(this.assetSell === this.assetBuy) this.assetBuy = this.defaultAssetBuy
                }
                else if (this.modalOn === 'buy') this.assetBuy = e.target.innerText
                this.modalOn = false
                this.sellQty = this.defaultSellQty
                this.buyQty = this.defaultBuyQty
                this.error = false
            },
            calcSellAssetQuantity() {
                this.error = false
                if(isNaN(+this.buyQty)) {
                    this.sellQty = '- -'
                    this.error = 'Неправильный формат ввода'
                    return
                }
                else if(this.buyQty === '') {
                    this.sellQty = '- -'
                    return
                }

                const {price: priceSell} = this.prices.find(item => item.symbol === this.assetSell)
                const {price: priceBuy} = this.prices.find(item => item.symbol === this.assetBuy)

                this.sellQty = this.buyQty / (priceSell / priceBuy)

                const {price: usd} = this.prices.find(item => item.symbol === 'USD')
                const qty = this.buyQty * priceBuy / usd

                if(qty > 10000) {
                    this.error = 'Сумма покупки не должна превышать эквивалент 10000USD'
                    return
                }

                this.sellQty = this.sellQty < 1 ? this.sellQty.toFixed(8) : this.sellQty.toFixed(2)
            },
            calcBuyAssetQuantity() {
                this.error = false
                if(isNaN(+this.sellQty)) {
                    this.buyQty = '- -'
                    this.error = 'Неправильный формат ввода'
                    return
                }
                else if(this.sellQty === '') {
                    this.buyQty = '- -'
                    return
                }

                const {price: priceSell} = this.prices.find(item => item.symbol === this.assetSell)
                const {price: priceBuy} = this.prices.find(item => item.symbol === this.assetBuy)
                this.buyQty = priceSell / priceBuy * this.sellQty

                const {price: usd} = this.prices.find(item => item.symbol === 'USD')
                const qty = this.buyQty * priceBuy / usd

                if(qty > 10000) {
                    this.error = 'Сумма покупки не должна превышать эквивалент 10000USD'
                    return
                }

                this.buyQty = this.buyQty < 1 ? this.buyQty.toFixed(8) : this.buyQty.toFixed(2)
            }
        }
    }
</script>

<style lang="sass" scoped>

.ex
    display: flex
    flex-direction: column
    width: 100%
    margin-top: 3rem

    &__header
        background: #32CD32
        padding: .5rem 1rem
        margin-bottom: 1.5rem

    &__content
        display: flex
        flex-direction: column
        width: 100%

    &__label
        display: flex
        width: 100%
        padding: .25rem 1rem
        font-size: .9rem
        background: #86E686

    &__row
        display: flex
        flex: 1 0 auto
        width: 100%
        border: 1px solid #86E686

    &__column
        display: flex
        justify-content: center
        align-items: center
        flex: 1 0 auto
        width: 50%
        padding: 1rem 0
        font-size: 1.5rem
        line-height: 1

    &__column input
        display: flex
        justify-content: center
        align-items: center
        text-align: center
        border: none
        background: none
        outline: none
        height: 100%
        font-family: 'HelveticaNeueRegular', sans-serif
        font-size: 1.5rem
        line-height: 1

    &__select
        display: flex
        justify-content: center
        align-items: center
        border-radius: .5rem
        border: 2px solid #86E686
        padding: .75rem .75rem .75rem 1rem
        cursor: pointer
        font-size: 1rem
        color: #A61414

    &__select::after
        font-family: FontAwesome
        content: "\f0d7"
        margin-left: .25rem
        color: #86E686

    &__error
        display: flex
        align-items: center
        padding: .5rem 1rem
        min-height: 3rem
        margin-top: .25rem
        font-size: .9rem

.error
    color: orangered
    border: 2px solid orangered
    font-size: .9rem

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
