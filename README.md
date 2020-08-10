# Tapeware

Record and play requests to mock APIs when running integration and e2e tests.

This project is just a proof of concept... yet!

### Record
```
RECORD_URL=my-real-api.example.com node index.js
```

This will save indexed requests to a `tapes` directory.

### Play
```
node index.js
```
