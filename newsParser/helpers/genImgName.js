const {randomBytes} = require('crypto')

function genImgName() {
    return randomBytes(10).toString('hex')
}

module.exports = {
    genImgName
}

