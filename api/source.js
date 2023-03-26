export async function getPrices() {

    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price`)
        return await res.json()
    }
    catch(e) {
        console.log(e)
    }

}