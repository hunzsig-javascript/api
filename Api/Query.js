import Auth from './../Auth';
import Http from './Http';
import Ws from './Ws';

/**
 *
 * @param setting
 * @constructor
 */
const Query = function (setting) {

  this.type = setting.type;
  this.host = setting.host;
  this.isHash = setting.isHash;
  this.routerType = setting.routerType;
  this.crypto = setting.crypto;
  this.append = setting.append;
  this.queryType = setting.queryType || 'post';

  /**
   *
   * @param params
   */
  this.appendParams = (params) => {
    params.auth_uid = Auth.getUid();
    if (this.append === null) {
      return;
    }
    for (let key in this.append) {
      if (typeof params[key] === "undefined") { // 可指定,不覆盖
        params[key] = this.append[key];
      }
    }
    return params;
  };

  /**
   * 有缓存
   * @param router
   * @param params
   * @param then
   */
  this.cache = (router, params, then) => {
    params = this.appendParams(params);
    let pathLogin = Auth.getLoginPath();
    let host = this.host;
    let scope = router;
    if (this.isHash) {
      pathLogin = '/#' + pathLogin;
    }
    switch (this.routerType) {
      case "scope":
        break;
      case "restful":
        host = this.host + router;
        scope = '';
        break;
      default:
        console.error('router type error');
        return;
    }
    if (this.routerType === 'restful') {
      pathLogin = '/#' + pathLogin;
    }
    switch (this.type) {
      case 'http':
        Http.PathLogin = pathLogin;
        Http.cache({
          host: host,
          scope: scope,
          params: params,
          then: then,
          crypto: this.crypto,
          queryType: this.queryType,
        });
        break;
      case 'ws':
        Ws.PathLogin = pathLogin;
        Ws.cache({
          host: host,
          scope: scope,
          params: params,
          then: then,
          crypto: this.crypto,
          queryType: 'stream',
        });
        break;
      default:
        console.error('api type error');
        break;
    }
  };

  /**
   * 无缓存
   * @param router
   * @param params
   * @param then
   */
  this.real = (router, params, then) => {
    params = this.appendParams(params);
    let pathLogin = Auth.getLoginPath();
    let host = this.host;
    let scope = router;
    if (this.isHash) {
      pathLogin = '/#' + pathLogin;
    }
    switch (this.routerType) {
      case "scope":
        break;
      case "restful":
        host = this.host + router;
        scope = '';
        break;
      default:
        console.error('router type error');
        return;
    }
    if (this.routerType === 'restful') {
      pathLogin = '/#' + pathLogin;
    }
    switch (this.type) {
      case 'http':
        Http.PathLogin = pathLogin;
        Http.real({
          host: host,
          scope: scope,
          params: params,
          then: then,
          crypto: this.crypto,
          queryType: this.queryType,
        });
        break;
      case 'ws':
        Ws.PathLogin = pathLogin;
        Ws.real({
          host: host,
          scope: scope,
          params: params,
          then: then,
          crypto: Index.crypto,
          queryType: 'stream',
        });
        break;
      default:
        console.error('api type error');
        break;
    }
  };

};

export default Query;
