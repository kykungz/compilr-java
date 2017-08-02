'use strict'

// require modules
const ip = require('ip')
const fs = require('fs-extra')
const exec = require('child-process-promise').exec
const winston = require('winston')
const bodyParser = require('body-parser')
const express = require('express')
const config = require('./config')

// Constants
const PORT = config.PORT
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({filename: 'server-logs.log'})
  ]
})
const app = express()

app.use(bodyParser.json())        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}))
app.use(express.static('./dist'))

// root
app.get('/', (req, res) => {
  res.sendFile('./dist/index.html', {root: __dirname})
})

app.post('/compile/', async (req, res, next) => {
  const files = req.body.files
  console.log(files)
  let dirname

  try {
    dirname = await fs.mkdtemp('./run/tmp_')
    logger.log('info', `created directory ${dirname}`)

    // create files
    for (let file of files) {
      await fs.writeFile(`${dirname}/${file.name}.java`, file.content)
      logger.log('info', `created file ${dirname}/${file.name}.java`)
    }

    try {
      // compile file
      for (let file of files) {
        await exec(`javac ${dirname}/${file.name}.java`)
        logger.log('info', `compiled ${dirname}/${file.name}.java`)
      }

      const commands = files.map((file) => {
        return `java -cp ${dirname} ${file.name}`
      }).join('|')

      // echo to prevent terminal from freezing on input
      const result = await exec(`ulimit -t ${config.TIMEOUT};echo "" | ${commands}`)

      res.send({
        success: true,
        output: result.stdout
      })
    } catch (err) {
      res.send({
        success: false,
        output: err.stdout + err.stderr
      })
    }
  } catch (e) {
    next(e)
  } finally {
    await fs.remove(dirname)
    logger.log('info', `removed directory ${dirname}`)
  }
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.log('error', err.message)
  res.status(500).render('error', {
    message: err.message,
    error: err
  })
})

// Start server
app.listen(PORT, async () => {
  try {
    await fs.mkdir('run')
    console.log(`created run folder`)
  } catch (e) {
    console.log('run directory already exists')
  } finally {
    console.log(`Running on http://${ip.address()}:${PORT}`)
  }
})
