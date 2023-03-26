<template>
    <div class="app">
        <header>Best Exchange App</header>
        <main>
            <exchange-section :prices="prices"></exchange-section>
            <rates-section :prices="prices"></rates-section>
            <button @click="onClick" :disabled="disabledOn">{{btnContent}}</button>
        </main>
        <footer><i class="fa fa-copyright"></i> 2023 Best Exchange App</footer>
    </div>
</template>

<script>

    import ExchangeSection from "./components/ExchangeSection"
    import RatesSection from "./components/RatesSection"
    import {getPrices} from "../api/source"

    export default {
        name: "App",
        components: {
            ExchangeSection,
            RatesSection
        },
        data() {
            return {
                prices: [],
                disabledOn: false,
                btnDefaultContent: 'ОБНОВИТЬ ДАННЫЕ',
                btnContent: '',
            }
        },
        async mounted() {
            this.btnContent = this.btnDefaultContent
            await this.getPrices()
        },
        methods: {
            onClick() {
                this.delayBtn()
                this.getPrices()
                this.disabledOn = true
            },
            delayBtn() {
                const cb = () => {
                    this.btnContent = timer--
                    if(timer === 0) {
                        this.btnContent = this.btnDefaultContent
                        clearInterval(timerId)
                        this.disabledOn = false
                    }
                }
                const timerId = setInterval(cb, 1000)
                let timer = 5
            },
            async getPrices() {
                const res = await getPrices()
                const fiatRaw = res.filter(item => item.symbol.startsWith('BTC'))
                const fiat = fiatRaw.map(item => {
                    return {
                        symbol: item.symbol.replace('BTC', ''),
                        price: 1 / item.price
                    }
                })
                let crypto = res.filter(item => item.symbol.endsWith('BTC'))
                crypto = crypto.map(item => {
                    return {
                        symbol: item.symbol.replace('BTC', ''),
                        price: item.price
                    }
                })
                this.prices = fiat.concat(crypto)
                this.prices = this.prices.map(item => {
                    return {
                        symbol: item.symbol.replace('USDT', 'USD'),
                        price: item.price
                    }
                })
                this.prices.push({symbol: 'BTC', price: 1})
            },
        }
    }
</script>

<style lang="sass" scoped>

button
    display: flex
    justify-content: center
    padding: 1rem
    width: 100%
    margin-top: 1rem
    border-radius: .5rem
    cursor: pointer
    background: #439A43
    font-size: .9rem

button:hover
    background: #69ae69

</style>