import {message} from 'antd';
import axios from 'axios';
import {Path, Parse, I18n} from 'basic';
import Auth from './../Auth';
import Crypto from './Crypto';

const ApiSave = (key, res) => {
  try {
    localStorage[key] = Parse.jsonEncode(res);
    localStorage[`${key}#EX`] = (new Date()).getTime() + 6e4;
  } catch (e) {
    localStorage.clear();
  }
};
const ApiLoad = (key) => {
  if (localStorage[`${key}#EX`] === undefined || localStorage[`${key}#EX`] < (new Date()).getTime()) {
    localStorage[key] = null;
  }
  return localStorage[key] ? Parse.jsonDecode(localStorage[key]) : null;
};

/**
 * api 请求
 * @param scope
 * @param params
 * @param then
 * @param refresh
 * @constructor
 */
const Http = {
  CacheKeyLimit: 3000,
  PathLogin: null,
  cache: (conf) => {
    if (Array.isArray(conf.scope)) {
      Http.runAll(conf, false);
    } else if (typeof conf.scope === 'string') {
      Http.run(conf, false);
    } else {
      message.error(I18n('SCOPE_ERROR'));
    }
  },
  real: (conf) => {
    if (Array.isArray(conf.scope)) {
      Http.runAll(conf, true);
    } else if (typeof conf.scope === 'string') {
      Http.run(conf, true);
    } else {
      message.error(I18n('SCOPE_ERROR'));
    }
  },
  run: (conf, refresh) => {
    const host = conf.host || null;
    const scope = conf.scope || null;
    const params = conf.params || {};
    const then = conf.then || function () {
    };
    const crypto = conf.crypto || null;
    const header = conf.header || {};
    const queryType = conf.queryType || 'post';
    refresh = typeof refresh === 'boolean' ? refresh : false;
    params.auth_uid = Auth.getUid();
    const key = scope + Parse.jsonEncode(params);
    if (refresh === false && key.length < Http.CacheKeyLimit && ApiLoad(key) !== null) {
      then(ApiLoad(key));
      return;
    }

    axios({
      method: queryType,
      url: host,
      data: Crypto.encode({client_id: Auth.getClientId(), scope: scope, ...params}, crypto),
      config: header
    })
      .then((response) => {
        if (Crypto.is(crypto)) {
          response.data = Crypto.decode(response.data, crypto);
        }
        if (typeof response.data === 'object') {
          if (typeof response.data.code === 'number' && response.data.code === 403) {
            if (Auth.getUid() !== undefined) {
              message.error(I18n('LOGIN_TIMEOUT'), 2.00, () => {
                Path.locationTo(Http.PathLogin);
              });
            }
            then({code: 500, msg: I18n('LIMITED_OPERATION'), data: null});
            return;
          }
          then(response.data);
          if (refresh === false && typeof response.data.code === 'number' && response.data.code === 200 && key.length < Http.CacheKeyLimit) {
            ApiSave(key, response.data);
          }
        } else {
          then({code: 500, msg: I18n('API_ERROR'), data: null});
        }
      })
      .catch((error) => {
        const status = (error.response && error.response.status) ? error.response.status : -1;
        switch (status) {
          case 400:
            error.message = I18n('API_ERROR_QUERY');
            break;
          case 401:
            error.message = I18n('API_ERROR_NOT_AUTH');
            break;
          case 403:
            error.message = I18n('API_ERROR_REJECT');
            break;
          case 404:
            error.message = I18n('API_ERROR_ABORT');
            break;
          case 408:
            error.message = I18n('API_ERROR_TIMEOUT');
            break;
          case 500:
            error.message = I18n('API_ERROR_SERVER');
            break;
          case 501:
            error.message = I18n('API_ERROR_NOT_SERVICE');
            break;
          case 502:
            error.message = I18n('API_ERROR_NET');
            break;
          case 503:
            error.message = I18n('API_ERROR_SERVICE_DISABLE');
            break;
          case 504:
            error.message = I18n('API_ERROR_NET_TIMEOUT');
            break;
          case 505:
            error.message = I18n('API_ERROR_NOT_SUPPORT_HTTP');
            break;
          default:
            error.message = I18n('API_ERROR_DEFAULT') + `(${status})!`;
        }
        then({code: status, msg: error.message, data: null});
      });
  },
  runAll: (conf, refresh) => {
    const host = conf.host || null;
    const scope = conf.scope || null;
    const params = conf.params || {};
    const then = conf.then || function () {
    };
    const crypto = conf.crypto || null;
    const header = conf.header || {};
    refresh = typeof refresh === 'boolean' ? refresh : true;
    if (Array.isArray(params)) {
      params.forEach((p) => {
        p.auth_uid = Auth.getUid();
      });
    } else {
      params.auth_uid = Auth.getUid();
    }
    const realKey = [];
    const real = [];
    const result = [];
    let resultQty = 0;
    scope.forEach((s, idx) => {
      const key = s + Parse.jsonEncode(Array.isArray(params) ? params[idx] : params);
      if (refresh === false && key.length < Http.CacheKeyLimit && ApiLoad(key) !== null) {
        result[idx] = ApiLoad(key);
        resultQty += 1;
      } else {
        realKey[idx] = key;
        real.push(axios.post(host, Crypto.encode({
          client_id: Auth.getClientId(),
          scope: s, ...(Array.isArray(params) ? params[idx] : params)
        }, crypto), header));
      }
    });
    if (resultQty === scope.length) {
      then(result);
      return;
    }
    axios
      .all(real)
      .then((all) => {
        let hasNotAuth = false;
        all.forEach((response, idx) => {
          let pushIdx = idx;
          while (result[pushIdx] !== undefined) {
            pushIdx += 1;
          }
          if (Crypto.is(crypto)) {
            response.data = Crypto.decode(response.data, crypto);
          }
          if (typeof response.data === 'object') {
            if (typeof response.data.code === 'number' && response.data.code === 403) {
              hasNotAuth = true;
            } else if (typeof response.data.code === 'number' && response.data.code === 200) {
              result[pushIdx] = response.data;
              if (refresh === false && realKey[pushIdx].length < Http.CacheKeyLimit) {
                ApiSave(realKey[pushIdx], response.data);
              }
            }
          } else {
            result[pushIdx] = {code: 500, response: I18n('API_ERROR'), data: null};
          }
        });
        if (hasNotAuth === true) {
          if (Auth.getUid() !== undefined) {
            message.error(I18n('LOGIN_TIMEOUT_OR_NOT_PERMISSION'), 2.00, () => {
              Path.locationTo(Http.PathLogin);
            });
          } else {
            message.warning(I18n('OPERATION_NOT_PERMISSION'));
          }
        } else {
          then(result);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
};

export default Http;
