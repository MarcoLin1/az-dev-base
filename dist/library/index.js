"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultCallbackPromise = exports.capitalizeFirstLetter = void 0;
exports.isFunction = isFunction;
exports.isFunctionV2 = isFunctionV2;
exports.toUnderscore = exports.toSafename = exports.toFloatCurrency = exports.toDashed = exports.toCurrency = exports.toCamel = exports.rightJustify = exports.lowerTheFirstLetter = exports.leftJustify = void 0;

var defaultCallbackPromise = function defaultCallbackPromise(_ref) {
  var result = _ref.result,
      error = _ref.error;

  if (error) {
    return Promise.reject(error);
  }

  return Promise.resolve(result);
};

exports.defaultCallbackPromise = defaultCallbackPromise;
var getClass = {}.toString;

function isFunction(object) {
  return object && getClass.call(object) === '[object Function]';
}

function isFunctionV2(object) {
  return typeof object === 'function';
}

var lowerTheFirstLetter = function lowerTheFirstLetter(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

exports.lowerTheFirstLetter = lowerTheFirstLetter;

var toCamel = function toCamel(str) {
  return str.replace(/_([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

exports.toCamel = toCamel;

var toUnderscore = function toUnderscore(str) {
  return str.replace(/([A-Z])/g, function (g) {
    return "_".concat(g.toLowerCase());
  });
};

exports.toUnderscore = toUnderscore;

var toDashed = function toDashed(str) {
  return lowerTheFirstLetter(toCamel(str)).replace(/([A-Z])/g, function (g) {
    return "-".concat(g.toLowerCase());
  });
};

exports.toDashed = toDashed;

var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.capitalizeFirstLetter = capitalizeFirstLetter;

var toSafename = function toSafename(str) {
  return toDashed(str).replace(/-/g, '').toLowerCase();
};

exports.toSafename = toSafename;

var toCurrency = function toCurrency(number) {
  return number.toFixed().replace(/\d(?=(\d{3})+$)/g, '$&,');
};

exports.toCurrency = toCurrency;

var toFloatCurrency = function toFloatCurrency(v) {
  var d = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  return parseFloat(v).toFixed(d).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

exports.toFloatCurrency = toFloatCurrency;

var leftJustify = function leftJustify(s, length, _char) {
  var fill = [];

  while (fill.length + s.length < length) {
    fill[fill.length] = _char;
  }

  return fill.join('') + s;
};

exports.leftJustify = leftJustify;

var rightJustify = function rightJustify(s, length, _char2) {
  var fill = [];

  while (fill.length + s.length < length) {
    fill[fill.length] = _char2;
  }

  return s + fill.join('');
};

exports.rightJustify = rightJustify;