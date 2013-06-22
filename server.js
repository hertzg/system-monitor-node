var crypto = require('crypto'),
    fs = require('fs'),
    http = require('http'),
    url = require('url')

var config = require('./config.js'),
    Monitor = require('./classes/Monitor.js')

process.chdir(__dirname)

fs.readFile('state.json', function (err, stateContent) {

    function shutdown () {
        fs.writeFileSync('state.json', JSON.stringify(monitor.getState()))
        process.exit(0)
    }

    var state
    if (!err) {
        fs.unlinkSync('state.json')
        try {
            state = JSON.parse(stateContent)
        } catch (e) {
        }
    }

    var monitor = Monitor()
    if (state) monitor.setState(state)

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    http.createServer(function (req, res) {
        var key = req.url.substr(1)
        if (key && crypto.createHash('sha1').update(key).digest('hex') == config.keySha1) {
            res.setHeader('Content-Type', 'application/json')
            res.end(
                JSON.stringify(monitor.getStatus())
            )
        } else {
            res.statusCode = 403
            res.end('403 Forbidden')
        }
    }).listen(config.port, config.host)

})
