const http = require('http')
const proxy = require('http-proxy')
const nodeFs = require('fs')
const { join } = require('path')
const hashObject = require('object-hash')
const { createReadStream, createWriteStream } = nodeFs

const fs = nodeFs.promises

const port = process.env.PORT || 8080
const targetUrl = process.env.TARGET
const targetPort = process.env.TARGET_PORT || 443
const tapesDir = process.env.TAPES_DIR || 'tapes'

const serverState = {}

function getTapeDir(req) {
    const hash = hashObject({
        path: req.path,
        headers: req.headers,
        body: req.body
    })
    return { tapeDir: join(tapesDir, hash), hash }
}

async function getLastEntry(tapeDir) {
    return Math.max(
        0,
        ...(await fs.readdir(tapeDir))
            .map(Number)
            .filter(n => !Number.isNaN(n))
    )
}

function sanitizeRequest(req) {
    req.setHeader('host', targetUrl)
}

function record() {
    const server = proxy
        .createProxyServer({
            target: `https://${targetUrl}:${targetPort}`,
            secure: false
        })
        .listen(port)

    server.on('proxyReq', async req => {
        sanitizeRequest(req)
        const { tapeDir } = getTapeDir(req)

        await fs.mkdir(tapeDir, { recursive: true })
        req.socket.pipe(createWriteStream(
            join(tapeDir, (await getLastEntry(tapeDir) + 1).toString())
        ))
    })
}

function play() {
    const dummyServer = http.createServer()
    dummyServer.listen(0)

    const proxyServer = proxy
        .createProxyServer({
            target: `http://localhost:${dummyServer.address().port}`
        })
        .listen(port)
    proxyServer.on('proxyReq', async (req, _req, res) => {
        sanitizeRequest(req)
        const { tapeDir, hash } = getTapeDir(req)
        const currentEntry = serverState[hash] || 1
        serverState[hash] = currentEntry + 1
        try {
            const lastEntry = await getLastEntry(tapeDir)
            const nextEntry = currentEntry % lastEntry === 0
                ? lastEntry
                : currentEntry % lastEntry
            createReadStream(join(tapeDir, nextEntry.toString()))
                .pipe(res.socket)
        } catch (error) {
            console.error(`Unknown request ${hash}`)
            res.socket.write('HTTP/1.1 501 Not Implemented\n\n')
            res.socket.end()
        }
    })
}

if (['r', 'rec', 'record'].includes(process.argv[2])) {
    console.log(`Recording tapes for target ${targetUrl}...`)
    record()
} else {
    console.log(`Playing recorded tapes from target ${targetUrl}`)
    play()
}
