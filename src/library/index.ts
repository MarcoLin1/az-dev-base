const defaultCallbackPromise = ({ result, error }) => {
  if (error) {
    return Promise.reject(error);
  }
  return Promise.resolve(result);
};

// https://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
const getClass = {}.toString;
function isFunction(object) {
  return object && getClass.call(object) === '[object Function]';
}

function isFunctionV2(object) {
  return typeof object === 'function';
}

const lowerTheFirstLetter = str => (str.charAt(0).toLowerCase() + str.slice(1));
const toCamel = str => str.replace(/_([a-z])/g, g => g[1].toUpperCase());
const toUnderscore = str => str.replace(/([A-Z])/g, g => `_${g.toLowerCase()}`);
const toDashed = str => lowerTheFirstLetter(toCamel(str)).replace(/([A-Z])/g, g => `-${g.toLowerCase()}`);
const capitalizeFirstLetter = str => (str.charAt(0).toUpperCase() + str.slice(1));
const toSafename = str => toDashed(str).replace(/-/g, '').toLowerCase();

const toCurrency = number => number.toFixed().replace(/\d(?=(\d{3})+$)/g, '$&,');
const toFloatCurrency = (v, d = 2) => parseFloat(v).toFixed(d).replace(/\d(?=(\d{3})+\.)/g, '$&,');


const leftJustify = function (s, length, char) {
  const fill : any[] = [];
  while (fill.length + s.length < length) {
    fill[fill.length] = char;
  }
  return fill.join('') + s;
};

const rightJustify = function (s, length, char) {
  const fill : any[] = [];
  while (fill.length + s.length < length) {
    fill[fill.length] = char;
  }
  return s + fill.join('');
};

export {
  lowerTheFirstLetter,
  toDashed,
  toSafename,
  toCamel,
  toUnderscore,
  capitalizeFirstLetter,
  toCurrency,
  toFloatCurrency,
  defaultCallbackPromise,
  isFunction,
  isFunctionV2,

  leftJustify,
  rightJustify,
};
