const port = process.env.PORT || 3000
const app = require('.')

app.listen(port, () => console.log(`Listening on port ${port}`))
