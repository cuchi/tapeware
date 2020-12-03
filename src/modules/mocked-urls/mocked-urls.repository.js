const { join } = require('path');
const fs = require('fs');

const mockedUrlsPath = process.env.MOCKED_URLS_PATH || 'mocked-urls.json';

const getMockedUrls = () =>
  JSON.parse(fs.readFileSync(join(__dirname, mockedUrlsPath), 'utf8'));

const saveMockedUrls = ({ content }) => {
  fs.writeFileSync(join(__dirname, mockedUrlsPath), JSON.stringify(content));
};

module.exports = {
  getMockedUrls,
  saveMockedUrls,
};
