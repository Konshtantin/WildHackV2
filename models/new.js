const {Schema, model} = require('mongoose')

const newSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    pictures_list: [
        {
            picture_path: {
                type: String,
                required: true
            }
        }
    ],
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    parsed_url: {
        type: String,
        required: true,
        unique: true
    },
    views_on_parsed_site: {
        type: Number,
    },
    views: {
        type: Number,
        default: 0
    }
})

module.exports = model('new', newSchema)

