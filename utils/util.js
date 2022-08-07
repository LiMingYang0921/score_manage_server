const log4js = require('./log4j')

const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, // 参数错误
  USER_ACCOUNT_ERROR: 20001, // 账号或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登入
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001 // 认证失败或TOEKEN过期
}

module.exports = {
  pager ({ pageNum = 1, pageSize = 10 }) {
    const skipIndex = (pageNum - 1) * pageSize
    return {
      page: {
        pageNum,
        pageSize
      },
      skipIndex
    }
  },
  success (data = '', message = '', code = CODE.SUCCESS) {
    log4js.debug('data', data)
    return { data, message, code }
  },
  fail (message = '', code = CODE.BUSINESS_ERROR, data = '') {
    log4js.debug('message', message)
    return { message, code, data }
  },
  CODE
}
