const stream = require('stream');
const {promisify} = require('util');
const fs = require('fs');
const got = require('got');


const pipeline = promisify(stream.pipeline)


async function downloadImage(url, path) {
    try{
        await pipeline(
            got.stream(url),
            fs.createWriteStream(`../public${path}`)
        )
        console.log('Image loaded')
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    downloadImage
}