'use strict'

const doc = `
Read stdin as \`encoding\` and emit as lines.
`
const defaults = {
  encoding: 'utf8',
}

const readline = require('readline')

module.exports = (config, logbus) => {
  process.stdin.setEncoding(config.encoding || defaults.encoding)

  function start() {
    const stream = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'LOGBUS> '
    })
    stream.on('line', (data) => {
      logbus.log.debug({data}, 'received')
      logbus.event(data)
      logbus.stats({events_in: 1, bytes_in: data.length})
    })
    stream.on('end', () => {
      logbus.pipeline.emit('SIGTERM', 'end of input')
    })
    stream.on('error', logbus.error)
    stream.prompt()
  }

  return { doc, defaults, start }
}
