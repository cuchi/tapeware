const { saveMockedUrls, getMockedUrls } = require('./mocked-urls.repository');

const updateMockedUrl = ({ name, url, port }) => {
  const urls = getMockedUrls();

  urls[name] = {
    ...urls[name],
    url,
    port: +port,
  };

  const saveDto = { content: urls };

  saveMockedUrls(saveDto);
};

const createMockedUrl = (req) => {
  const { name, url, port } = req.body;
  const createDto = { name, url, port };

  updateMockedUrl(createDto);
};

const nameExists = (name) => {
  const config = getMockedUrls();
  return Boolean(config[name]);
};

const deleteMockedUrl = (name) => {
  const urls = getMockedUrls();
  delete urls[name];

  const saveDto = { content: urls };
  saveMockedUrls(saveDto);
};

module.exports = {
  createMockedUrl,
  updateMockedUrl,
  nameExists,
  deleteMockedUrl,
};
