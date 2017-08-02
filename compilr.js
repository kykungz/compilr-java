'use strict'

// require modules
const config = require('./config')
const exec = require('child-process-promise').exec

const compilr = {}

compilr.init = (logger) => {
  if (logger) {
    this.logger = logger
  } else {
    this.logger = require('winston')
  }
}

compilr.compile = async (dirname, files) => {
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

    return {
      success: true,
      output: result.stdout
    }
  } catch (err) {
    return {
      success: false,
      output: err.stdout + err.stderr
    }
  }
}

module.exports = compilr
