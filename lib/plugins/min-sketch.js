'use strict'

// Sample events using a sketch:
//
//   https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch
//   https://www.vividcortex.com/blog/2015/07/10/probabilistic-sampling-sketch/

// TODO:
//
// - user-defined category function (eg path for access logs)
// - use status code or severity to weight sample probability (eg 5xx=1, 4xx=.75, 3xx=.5, 2xx=.1)

module.exports = (config, logbus) => {
  let intervalSeconds = config.intervalSeconds
  if (config.interval) {
    logbus.log.warn('`interval` config option deprecated - use `intervalSeconds`')
    intervalSeconds = config.interval
  }
  const nth = config.nth
  let count = 0
  let sample = null

  function start() {
    return new Promise((resolve) => {
      if (intervalSeconds) {
        setInterval(run, intervalSeconds * 1000)
      }
      resolve({stage: logbus.stage})
    })
  }

  function onInput(event) {
    try {
      sample = event
      // TODO: Add sketch logic.
      if (nth != null && count % nth === 0) {
        run()
      }
      // Increment after so that first one gets sampled.
      count++
    }
    catch (err) {
      logbus.error(err)
    }
  }

  function run() {
    if (sample) {
      // Don't sample the same event multiple times.
      const event = sample
      sample = null
      logbus.event(event)
    }
  }

  return { start, onInput }
}
