const { JSDOM } = require('jsdom')

const {getPageContent} = require('./helpers/puppeteer')
const {singlePageParser} = require('./singlePageParser')
require('dotenv').config()
const mongoose = require('mongoose')

const New = require('../models/new')
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const sites = [
    'https://kamtoday.ru/news/ecologics/?PAGEN_1='
]
let pages = 1
async function parseNews() {
    sites.forEach(site => {
        const ecoNews = []
        new Promise(async (resolve, reject) => {
            for(let page = 1; page <= pages; page++) {
                const url = `${site}${page}`
                const pageContent = await getPageContent(url)
                const dom = new JSDOM(pageContent)
                console.log(`Page ${page} loading...`)
                dom.window.document.querySelectorAll('.news-item').forEach((newItem, index, newItemArr) => {
                    let imgPath;
    
                    if(index > 0) {
                        imgPath = Array.from(newItem.querySelector('.image-wrap').getAttribute('style').split('url')[1]).filter(n => {
                            return !'();'.includes(n)
                        }).join('')
                    } else if(index == 0) {
                        imgPath = Array.from(newItem.getAttribute('style').split('url')[1]).filter(n => {
                            return !'();'.includes(n)
                        }).join('')
                    }
    
                    const imgURL = `${(new URL(site)).origin}${imgPath}`

                    const ecoNew = {
                        url: `${(new URL(site)).origin}${newItem.querySelector('.news-link').getAttribute('href')}`,
                        title: newItem.querySelector('.name').textContent,
                        date: correctDate(newItem.querySelector('.date').textContent),
                        imgPath: `./newsImages/${imgURL.split('/')[imgURL.split('/').length-1]}`,
                        imgURL
                    }
                    ecoNews.push(ecoNew)
                    if(page === pages && newItemArr.length-1 === index) {
                        resolve()
                    }
                })
            }
        })
            .then(result => {
                console.log(`${ecoNews.length} news to load`)
                singlePageParser(ecoNews)
            })
        
    })
    
}
function clearNews() {
    New.find()
        .then(news => {
            news.forEach(newItem => {
                New.findByIdAndDelete(newItem._id, () => {})
            })
        })
}
function correctDate(date) {
    if(date.split(',')[0] == 'сегодня') {
        const dateNow = new Date()
        let time = date.split(',')[1].trim()
        let day = dateNow.getDate()
        let month = dateNow.getMonth()+1
        let year = dateNow.getFullYear()
        return new Date(`${time} ${month}.${day}.${year}`)
    }
    if(date.split(',')[0] == 'вчера') {
        const dateNow = new Date(Date.now()-86400000)
        let time = date.split(',')[1].trim()
        let day = dateNow.getDate()
        let month = dateNow.getMonth()+1
        let year = dateNow.getFullYear()
        return new Date(`${time} ${month}.${day}.${year}`)
    }
    const months = {
        янв: '01',
        фев: '02',
        мар: '03',
        апр: '04',
        мая: '05',
        июн: '06',
        июл: '07',
        авг: '08',
        сен: '09',
        окт: '10',
        ноя: '11',
        дек: '12'
    }
    Number(months[date.split(',')[0].split(' ')[1].slice(0, 3)])
    let day = date.split(',')[0].split(' ')[0]
    let clearDay = date.split(',')[0].split(' ')[0].toString().length === 1 ? `0${date.split(',')[0].split(' ')[0].toString()}` : day.toString()
    return new Date(`${date.split(',')[1].trim()} ${months[date.split(',')[0].split(' ')[1].slice(0, 3)]}.${clearDay}.2021`)
}
parseNews()
// clearNews() 
module.exports = {
    parseNews
}

