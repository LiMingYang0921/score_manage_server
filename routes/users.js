/**
 * 用户管理模块
 */
var mongoose = require('mongoose');
const router = require('koa-router')()
const User = require('./../models/userSchema')
const Counter = require('./../models/counterSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
const md5 = require('md5')

router.prefix('/users')
router.post('/login', async (ctx) => {
  try {
    const { account, password } = ctx.request.body
    /**
     * 返回指定字段的第一种方式
     * const res = await User.findOne({ account, password }, 'userId userName userEmail state role deptId roleList')
     * 第二种 1返回，2不返回，默认2
     * const res = await User.findOne({ account, password }, {'userId': 1})
     * 第三种
     * const res = await User.findOne({ account, password }).select('userId')
     */
    console.log({ account, password });
    const res = await User.findOne({ account: 132, password: 123 }, 'userId userName userEmail state role deptId roleList')
    console.log('res=> ', res);
    const data = res._doc
    const token = jwt.sign({
      data
    }, 'imooc', { expiresIn: '1h' })
    if (res) {
      data.token = token
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('账号或密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.message)
  }
})

router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  let params = {}
  if (userId) {
    params.userId = userId
  }
  if (userName) {
    params.userName = userName
  }
  if (state) {
    params.state = state
  }
  try {
    const query = User.find(params, { _id: 0, userPwd: 0 })
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await User.countDocuments(params)
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})

router.post('/delete', async (ctx) => {
  const { userIds } = ctx.request.body
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
  if (res.matchedCount) {
    ctx.body = util.success(res, `共删除成功${res.matchedCount}条`)
    return
  }
  ctx.body = util.fail('删除失败')
})


// 用户新增/编辑
router.post('/operate', async (ctx) => {
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body
  if (action === 'add') {
    if (!userName || !userEmail || !deptId) {
      ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
      return
    }
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    if (res) {
      ctx.body = util.fail(`有重复的用户`)
    } else {
      const doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName: md5('123456'),
          userPwd: '123456',
          userEmail,
          role: 1,
          roleList,
          job,
          state,
          deptId,
          mobile
        })
        user.save();
        ctx.body = util.success('', '用户创建成功')
      } catch (error) { ctx.body = util.success(error.stack, '用户创建失败') }
    }
  } else {
    if (!deptId) {
      ctx.body = util.fail('部门参数错误', util.CODE.PARAM_ERROR)
      return
    }
    try {
      const res = await User.findOneAndDelete({ userId }, { mobile, job, state, roleList, deptId })
      ctx.body = util.success('', '修改成功')
    } catch {
      ctx.body = util.fail(res, '修改失败')
    }
  }
})


module.exports = router

// http://localhost:8080/api/users/delete
// http://localhost:8080/api/users/list?state=1&pageNum=1&pageSize=10
