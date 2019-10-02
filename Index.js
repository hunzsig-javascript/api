import Auth from './Auth';
import Connect from "./Connect";

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
  auth: Auth,

  /**
   * 配置host
   * @param key 唯一key
   * @param host 链接
   * @param type 类型 http | ws
   * @param crypto 加密方式
   * @param append 附加参数
   */
  set: (key, host, type = 'HTTP', crypto, append) => {
    Index.setting[key] = {
      host: host,
      type: type.toUpperCase(),
      crypto: crypto || null,
      append: append || null,
    };
  },

  /**
   *
   * @param hostKey
   * @returns {Connect}
   */
  connect: (hostKey = 'default') => {
    const setting = Index.setting[hostKey];
    if (setting === null) {
      throw 'setting error';
    }
    return new Connect(setting);
  },

};

export default Index;
