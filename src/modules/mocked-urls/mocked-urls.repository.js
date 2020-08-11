const fs = require("fs");

const MOCKED_URLS = "./static/mocked-urls.json";

const getMockedUrls = () => {
  return JSON.parse(fs.readFileSync(MOCKED_URLS, "utf8"));
};

const saveMockedUrls = ({content}) => {
  fs.writeFileSync(MOCKED_URLS, JSON.stringify(content));
};

module.exports = {
  getMockedUrls,
  saveMockedUrls
}
