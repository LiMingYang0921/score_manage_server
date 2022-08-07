const mongoose = require('mongoose')
const menuSchema = mongoose.Schema({
  "createTime": {
    type: Date,
    default: Date.now()
  },
  "updateTime": {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('menus', menuSchema)