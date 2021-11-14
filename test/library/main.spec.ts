/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import {
  toDashed,
  capitalizeFirstLetter,
  toUnderscore,
  toCurrency,
  toFloatCurrency,
  leftJustify,
 } from 'library';

import {
  data01,
  err01,
} from '../test-data';

declare const describe;
declare const beforeEach;
declare const afterEach;
declare const it;

const { expect } = <any>chai;

describe('Main Test Cases', () => {
  describe('Basic', () => {
    it('toDashed should work', () => {
      const tartgetString = 'azXxxPpp';
      const dashed = toDashed(tartgetString);
      const capitalizeFirstLetterResult = capitalizeFirstLetter(tartgetString);
      expect(capitalizeFirstLetterResult).to.equal('AzXxxPpp');
      const underscore = toUnderscore(tartgetString);
      expect(underscore).to.equal('az_xxx_ppp');

      console.log(' ======= underscore ======= ');
      expect(dashed).to.equal('az-xxx-ppp');

      console.log('toCurrency(334435435435) :', toCurrency(334435435435));
      
      toFloatCurrency(2344353.35344, 2)
      console.log('toFloatCurrency(2344353.35644, 2) :', toFloatCurrency(2344353.35644, 2));
      
      console.log('leftJustify("1", 5, "0") :', leftJustify('1', 5, '0'));
      return true;
    });
  });
});
