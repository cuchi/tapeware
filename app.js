const bodyParser = require("body-parser");
const express = require("express");

const mockedUrlsRouter = require('./src/modules/mocked-urls/mocked-urls.router')

const app = express();
const port = process.env.PORT || 9001;

app.use(bodyParser.json());
app.use(mockedUrlsRouter)

app.listen(PORT, () => {
  console.log(`🚀 Listening at http://localhost:${PORT}`);
});
