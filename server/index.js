import app from './app.js'
import Robots from "./classes/robots.js"
new Robots()

const port = 5000
app.listen(port, () => {console.log(`Server running on port ${port}`)})

