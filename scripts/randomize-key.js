#!/usr/bin/env node
var crypto = require('crypto'),
    fs = require('fs')

var config = require('../config.js')

process.chdir(__dirname)

var charset = (function () {

    function addRange (a, z) {
        for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
            charset += String.fromCharCode(i)
        }
    }

    var charset = ''
    addRange('a', 'z')
    addRange('A', 'Z')
    addRange('0', '9')
    return charset

})()

function randomPassword () {
    var password = ''
    for (var i = 0; i < 32; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
    }
    return password
}

var newPassword = randomPassword(),
    newPasswordSha1 = crypto.createHash('sha1').update(newPassword).digest('hex')

var content =
    '// auto-generated by ' + __filename + '\n' +
    'exports.port = ' + config.port + '\n' +
    'exports.host = ' + JSON.stringify(config.host) + '\n' +
    'exports.keySha1 = ' + JSON.stringify(newPasswordSha1) + '\n'

fs.writeFileSync('../config.js', content)

console.log('New key is ' + newPassword)
