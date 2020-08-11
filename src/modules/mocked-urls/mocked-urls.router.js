const express = require("express");
const {
  deleteMockedUrl,
  updateMockedUrl,
  nameExists,
  createMockedUrl
} = require("./mocked-urls.service");
const {getMockedUrls} = require("./mocked-urls.repository");

const {validateCreationFields, validateUpdateFields, validateDeleteParam} = require("./mocked-urls.validation-middleware");

const router = express.Router();

router.get("/mocked-urls", (req, res) => {
  res.send(getMockedUrls());
});

router.post("/mocked-urls", validateCreationFields, (req, res) => {
  createMockedUrl(req)
  res.send(getMockedUrls());
});

router.put("/mocked-urls/:name", validateUpdateFields, (req, res) => {
  const name = req.params.name;
  const isValid = nameExists(name);
  if (!isValid) {
    return res.status(404).send({
      errors: [ {location: "param", msg: "Not found", param: "name"}]
    });
  }

  const {url, port} = req.body;
  const updateDto = {name, url, port};

  updateMockedUrl(updateDto);
  res.send(getMockedUrls());
});

router.delete("/mocked-urls/:name", validateDeleteParam, (req, res) => {
  const name = req.params.name;
  const isValid = nameExists(name);
  if (!isValid) {
    return res.status(404).send({
      errors: [{location: "param", msg: "Not found", param: "name"}]
    });
  }

  deleteMockedUrl(req.params.name)
  res.send(getMockedUrls());
});

module.exports = router;
