const fs = require("fs");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const PORT = 9001;
const SERVICES_PATH = "./static/services.json";

app.use(bodyParser.json());

app.get("/services", (_, res) => {
  res.send(getConfig());
});

app.put("/services/:name", (req, res) => {
  const name = req.params.name;
  const { url, port } = req.body;
  const updateDto = { name, url, port };

  if (!name) {
    // TODO validate all dto fields
  }

  const config = getConfig();
  if (!config[name]) {
    // TODO handle ["name"] should exist
  }

  updateService(updateDto);
  res.send(getConfig());
});

app.post("/services", (req, res) => {
  const { name, url, port } = req.body;
  const createDto = { name, url, port };

  updateService(createDto);

  res.send(getConfig());
});

app.delete("/services/:name", (req, res) => {
  const name = req.params.name;
  if (!name) {
    // TODO handle ["name", "url", "port"] is required
  }

  const config = getConfig();
  if (!config[name]) {
    // TODO handle ["name", "url", "port"] is invalid
  }

  delete config[name];

  const saveDto = { content: config };
  saveConfig(saveDto);

  res.send(getConfig());
});

const updateService = ({ name, url, port }) => {
  const config = getConfig();

  config[name] = {
    ...config[name],
    url,
    port: +port,
  };

  const saveDto = { content: config };
  
  saveConfig(saveDto);
};

const getConfig = () => {
  // TODO handle "file does not exist"
  return JSON.parse(fs.readFileSync(SERVICES_PATH, "utf8"));
};

const saveConfig = ({ content }) => {
  // TODO validate unique url and port
  fs.writeFileSync(SERVICES_PATH, JSON.stringify(content));
};

app.listen(PORT, () => {
  console.log(`🚀 Listening at http://localhost:${PORT}`);
});
