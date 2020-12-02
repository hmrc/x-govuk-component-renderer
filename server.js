const port = process.env.PORT || 3000;
const app = require('./src/app');

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
