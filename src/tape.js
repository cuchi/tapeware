const http = require('http')
const https = require('https')
const { createHash } = require('crypto')
const nodeFs = require('fs')
const { join } = require('path')

const { createReadStream, createWriteStream } = nodeFs
const fs = nodeFs.promises

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8080
const recordUrl = process.env.RECORD_URL
const recordPort = process.env.RECORD_PORT || 443
const tapesDir = process.env.TAPES_DIR || 'tapes'

// Let's not care about that for a while
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const serverState = {}

function getTapeDir(data) {
    // TODO: don't hash the entire request
    const hash = createHash('sha256').update(data).digest('hex')
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

function record(clientSocket) {
    const agent = new https.Agent()
    const serverSocket = agent
        .createConnection({ host: recordUrl, port: recordPort })
    
    clientSocket.on('data', async data => {
        const newData = data.toString().replace(`${host}:${port}`, recordUrl)
        serverSocket.write(Buffer.from(newData))

        const { tapeDir } = getTapeDir(data)
        await fs.mkdir(tapeDir, { recursive: true })

        serverSocket.pipe(clientSocket)
        serverSocket.pipe(createWriteStream(
            join(tapeDir, (await getLastEntry(tapeDir) + 1).toString())
        ))
    })
}

function play(clientSocket) {
    clientSocket.on('data', async data => {
        const { tapeDir, hash } = getTapeDir(data)
        const currentEntry = serverState[hash] || 1
        serverState[hash] = currentEntry + 1
        try {
            const lastEntry = await getLastEntry(tapeDir)
            const nextEntry = currentEntry % lastEntry === 0
                ? lastEntry
                : currentEntry % lastEntry
            createReadStream(join(tapeDir, nextEntry.toString()))
                .pipe(clientSocket)
        } catch (error) {
            console.error(`Unknown request ${hash}`)
            clientSocket.write('HTTP/1.1 501 Not Implemented\n\n')
            clientSocket.end()
        }
    })
}

const server = http.createServer().listen(port)
server.on('connection', recordUrl ? record : play)
