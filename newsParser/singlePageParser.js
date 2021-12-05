const { JSDOM } = require("jsdom")
const {getPageContent} = require('./helpers/puppeteer.js')
const New = require('../models/new')

const {genImgName} = require('./helpers/genImgName')

const {downloadImage} = require('./downloadImage')

function cleanChunk(chunk) {
    let ch = chunk.split('\n').join(' ').split('\t').map(chunk => chunk.trim()).join(' ')
    ch.split(' ').map(item => {
        if('@#№$%&><}{()'.includes(item.trim())) {
            return ''
        }
        return item
    })
    return ch
}
async function singlePageParser(ecoNews) {
    try{
        for(const ecoNew of ecoNews){
            const detailContent = await getPageContent(ecoNew.url)

            const dom = new JSDOM(detailContent)
            const text_p = dom.window.document.querySelector('.news-detail').querySelectorAll('p')
            const text_chunks = []
            text_p.forEach(p => {
                const chunk = cleanChunk(p.textContent)
                text_chunks.push(chunk)
            })
            const text = text_chunks.join('$/*')
            dom.window.document.querySelector('.news-topinfo').querySelector('.d-flex.align-items-end.align-items-sm-center').querySelector('span:last-of-type').querySelector('svg').remove()
            const views = Number(dom.window.document.querySelector('.news-topinfo').querySelector('.d-flex.align-items-end.align-items-sm-center').querySelector('span:last-of-type').textContent.split('\n').join('').trim())
            const path = `/newsImages/${genImgName()}.${ecoNew.imgURL.split('.')[ecoNew.imgURL.split('.').length-1]}`
            const newLastView = {
                title: ecoNew.title,
                pictures_list: [{picture_path: `.${path}`}],
                text,
                date: ecoNew.date,
                parsed_url: ecoNew.url,
                views_on_parsed_site: views,
            }
            downloadImage(ecoNew.imgURL, path)
            try{
                await New.create(newLastView)
                console.log('New saved')
            } catch(err) {
                console.log(err)
                console.log(newLastView)
            }
        }
    } catch(err) {
        console.log(err)
    }
}

module.exports =  {
    singlePageParser
}