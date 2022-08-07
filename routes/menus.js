const router = require('koa-router')()
const util = require('../utils/util')
const Menu = require('../models/menuSchema')

router.prefix('/menu')

router.post('/operate', async (ctx) => {
  const { _id, action, ...params } = ctx.request.body
  try {
    let res, info
    if (action === 'add') {
      res = await Menu.create(params)
      info = '创建成功'
    } else if (action === 'edit') {
      info = '编辑成功'
      params.updateTime = new Date()
      res = await Menu.findByIdAndUpdate(_id, params)
    } else {
      res = await Menu.findByIdAndRemove(_id)
      await Menu.deleteMany({ parenId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success('', info)
  } catch (error) {
    // delete params._id
    ctx.body = util.fail(error.stack)
  }
})

module.exports = router