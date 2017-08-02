'use strict'

// require modules
const config = require('./config')
const fs = require('fs-extra')
const exec = require('child-process-promise').exec

const compilr = {}

compilr.compile = async (req, res, next) => {
  const files = req.body.files
  let dirname

  try {
    // create temp directory
    dirname = await fs.mkdtemp('./run/tmp_')
    this.logger.log('info', `created directory ${dirname}`)

    // create files
    for (let file of files) {
      await fs.writeFile(`${dirname}/${file.name}.java`, file.content)
      this.logger.log('info', `created file ${dirname}/${file.name}.java`)
    }

    try {
      // compile files
      for (let file of files) {
        await exec(`javac ${dirname}/${file.name}.java`)
        this.logger.log('info', `compiled ${dirname}/${file.name}.java`)
      }

      const commands = files.map((file) => {
        return `java -cp ${dirname} ${file.name}`
      }).join('|')

      // run files (echo to prevent terminal from freezing on input)
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
    this.logger.log('info', `removed directory ${dirname}`)
  }
}

compilr.init = (logger) => {
  if (logger) {
    this.logger = logger
  } else {
    this.logger = require('winston')
  }
}

module.exports = compilr
