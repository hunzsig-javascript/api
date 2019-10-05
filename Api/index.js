import Query from "./Query";

/**
 * api 请求
 * @param scope
 * @param params
 * @param then
 * @param refresh
 * @constructor
 */
const Index = {

  setting: {},

  /**
   * 配置host
   * @param key 唯一key
   * @param host 链接
   * @param type 类型 http | ws
   * @param routerType 类型 scope | restful
   * @param isHash 是否哈希路径，哈希路径自带#号
   * @param crypto 加密方式
   * @param append 附加参数
   */
  config: (key, host, type = 'http', isHash = false, routerType = 'scope', crypto = null, append = null) => {
    Index.setting[key] = {
      host: host,
      type: type.toLowerCase(),
      routerType: routerType,
      isHash: isHash,
      crypto: crypto,
      append: append,
    };
  },

  /**
   * mixed query
   * @param queryType
   * @param apiUniqueKey
   * @returns {Query}
   */
  query: (queryType = 'post', apiUniqueKey = 'default') => {
    const setting = Index.setting[apiUniqueKey];
    if (setting === null) {
      throw 'setting error';
    }
    setting.queryType = queryType;
    return new Query(setting);
  },

  /**
   * get query
   * @param apiUniqueKey
   * @returns {*|Query}
   */
  get: (apiUniqueKey = 'default') => {
    return Index.query('get', apiUniqueKey);
  },

  /**
   * post query
   * @param apiUniqueKey
   * @returns {*|Query}
   */
  post: (apiUniqueKey = 'default') => {
    return Index.query('post', apiUniqueKey);
  },

  /**
   * put query
   * @param apiUniqueKey
   * @returns {*|Query}
   */
  put: (apiUniqueKey = 'default') => {
    return Index.query('put', apiUniqueKey);
  },

  /**
   * delete query
   * @param apiUniqueKey
   * @returns {*|Query}
   */
  delete: (apiUniqueKey = 'default') => {
    return Index.query('delete', apiUniqueKey);
  },

  /**
   * patch query
   * @param apiUniqueKey
   * @returns {*|Query}
   */
  patch: (apiUniqueKey = 'default') => {
    return Index.query('patch', apiUniqueKey);
  },

  /**
   * head query
   * @param apiUniqueKey
   * @returns {*|Query}
   */
  head: (apiUniqueKey = 'default') => {
    return Index.query('head', apiUniqueKey);
  },

};

export default Index;
