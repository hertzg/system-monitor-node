var fs = require('fs'),
    os = require('os')

function Monitor () {

    function push (array, value) {
        array.push(value)
        if (array.length > limit) array.shift()
    }

    var limit = 1000

    var freememHistory = [],
        loadavgHistory = [],
        networkHistory = [];

    (function () {

        var prevSent, prevReceived, prevCheckTime;
    
        setInterval(function () {

            var now = Date.now()
            push(loadavgHistory, {
                time: now,
                value: os.loadavg(),
            })
            push(freememHistory, {
                time: now,
                value: os.freemem(),
            })

            fs.readFile('/proc/net/dev', 'utf8', function (err, content) {
                var sent = 0, received = 0
                var lines = content.split('\n')
                lines.shift()
                lines.shift()
                lines.pop()
                lines.forEach(function (line) {
                    var values = line.replace(/^\s+/, '').split(/:?\s+/)
                    if (values[0] != 'lo') {
                        sent += Number(values[9])
                        received = Number(values[1])
                    }
                })
                if (prevCheckTime) {
                    var duration = now - prevCheckTime
                    push(networkHistory, {
                        time: now,
                        sent: (sent - prevSent) / duration,
                        received: (received - prevReceived) / duration,
                    })
                }
                prevSent = sent
                prevReceived = received
                prevCheckTime = now
            })

        }, 1000 * 60)

    })()

    return {
        getStatus: function () {
            return {
                dateNow: Date.now(),
                uptime: os.uptime(),
                totalmem: os.totalmem(),
                loadavg: os.loadavg(),
                freemem: os.freemem(),
                loadavgHistory: loadavgHistory,
                freememHistory: freememHistory,
                networkHistory: networkHistory,
            }
        },
        getState: function () {
            return {
                loadavgHistory: loadavgHistory,
                freememHistory: freememHistory,
                networkHistory: networkHistory,
            }
        },
        setState: function (state) {
            loadavgHistory = state.loadavgHistory
            freememHistory = state.freememHistory
            networkHistory = state.networkHistory
        },
    }

}

module.exports = Monitor
