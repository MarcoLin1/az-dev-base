import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import deepcopy from 'deepcopy';
import ntcw from 'number-to-chinese-words';

import fs from 'fs';
import path from 'path';
import moment from 'moment';

import d from './data';

// const toCurrency = number => number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
const toCurrency = number => number.toFixed().replace(/\d(?=(\d{3})+$)/g, '$&,');

ntcw.labels = Object.assign({}, ntcw.labels, {
  // digits: ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'],
  // units: ['', '拾', '佰', '仟', '萬', '拾', '佰', '仟', '億', '拾', '佰', '仟', '兆', '拾', '佰', '仟', '京', '拾', '佰', '仟', '垓']
  digits: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
  units: ['', '十', '百', '千', '萬', '十', '百', '千', '億', '十', '百', '千', '兆', '十', '百', '千', '京', '十', '百', '千', '垓'],
});

// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
function replaceErrors(key, value) {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce((error, key) => {
      error[key] = value[key];
      return error;
    }, {});
  }
  return value;
}

function errorHandler(error) {
  console.log(JSON.stringify({ error }, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors.map(error => error.properties.explanation).join('\n');
    console.log('errorMessages', errorMessages);
    // errorMessages is a humanly readable message looking like this :
    // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}

const getNickName = (index) => {
  const allChars = '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥';
  return `${allChars[index]}方`;
};

const getContractTitlePrefix = (lv, index) => {
  const number = index + 1;
  switch (lv) {
    case 1:
      return '';
    case 2:
      return `${ntcw.toWords(number)}.  `;
    case 3:
      return `（${ntcw.toWords(number)}）`;
    case 4:
      return `${number}、`;
    default:
      return `${ntcw.toWords(number)}.  `;
  }
};

const normalizeData = (data) => {
  const newData = deepcopy(data);
  const quotationDate = moment(newData.quotation.date, 'YYYYMMDD');
  newData.quotation.quotationDate = quotationDate.format('YYYY.MM.DD');
  newData.quotation.quotationId = `${newData.quotation.date}${new Array(3 - `${newData.quotation.quotationNo}`.length + 1).join('0')}${newData.quotation.quotationNo}`;
  newData.quotation.expiryDate = quotationDate.add(newData.quotation.expiryDays, 'days').format('YYYY.MM.DD');

  newData.total = { price: 0, discount: 0 };

  newData.features = newData.features || [];
  newData.features.forEach((feature, i) => {
    feature.number = i + 1;
    feature.no = `${i + 1}.`;
    if (feature.quantity == null) {
      feature.quantity = 1;
    }
    feature.price = feature.price || 0;

    newData.total.price += feature.price * feature.quantity;

    feature.displayQuantity = toCurrency(feature.quantity);
    feature.displayPrice = toCurrency(feature.price);
  });
  newData.flatFeatures = newData.features.reduce((a, feature) => {
    return [
      ...a,
      ...feature.tasks.map((task, i) => {
        const {
          detail,
          functionList,
        } = task;
        const featureName = i ? '' : `[${feature.featureType}]\n${feature.featureName}`;
        return {
          featureName,
          detail,
          functionList: functionList.map(f => ({ functionName: f })),
        };
      }),
    ];
  }, []);

  newData.discountInfo = newData.discountInfo || {};
  newData.discountInfo.price = newData.discountInfo.price || 0;
  newData.total.discount += newData.discountInfo.price;

  newData.discountInfo.displayPrice = toCurrency(newData.discountInfo.price);

  newData.total.price += newData.total.discount;
  newData.total.displayPrice = toCurrency(newData.total.price);

  newData.total.tax = Math.ceil(newData.total.price * 0.05);
  newData.total.displayTax = toCurrency(newData.total.tax);

  newData.total.priceWithTax = newData.total.price + newData.total.tax;
  newData.total.displayPriceWithTax = toCurrency(newData.total.priceWithTax);

  let leftPrice = newData.total.priceWithTax;
  const paymentInfoLength = newData.paymentInfo.length;
  Object.values(newData.paymentInfo).forEach((paymentInfo, i) => {
    const price = Math.floor(newData.total.priceWithTax * paymentInfo.percent / 100);
    if (i !== paymentInfoLength - 1) {
      paymentInfo.price = price;
      leftPrice -= price;
      paymentInfo.displayPrice = toCurrency(paymentInfo.price);
    } else {
      paymentInfo.price = leftPrice;
      paymentInfo.displayPrice = toCurrency(paymentInfo.price);
    }
  });

  // ===============

  newData.contract = data.getContract(newData);

  const contractDate = moment(newData.contract.date, 'YYYYMMDD');
  const cMinguoYear = `${contractDate.year() - 1911}`
  .split('')
  .map(c => ntcw.toWords(+c))
  .join('');
  newData.contractDate = {
    cMinguoYear,
    cMonth: ntcw.toWords(contractDate.month()),
    cDate: ntcw.toWords(contractDate.date()),
  };
  let maxCompanyLength = 0;
  newData.contract.contractors.forEach((contractor, i) => {
    contractor.nickName = getNickName(i);
    if (maxCompanyLength < contractor.name.length) {
      maxCompanyLength = contractor.name.length;
    }
  });
  maxCompanyLength += 8;
  maxCompanyLength *= 2;
  newData.contract.contractors.forEach((contractor, i) => {
    contractor.nameWithPadding = contractor.name + new Array(maxCompanyLength - contractor.name.length + 1).join(' ');
  });
  const updateTerm = (terms, level) => {
    if (!terms || level > 4) {
      return;
    }
    const nextLevel = level + 1;
    terms.forEach((term, i) => {
      const originalTitle = term[`lv${nextLevel}Title`];
      term[`lv${nextLevel}Title`] = `${getContractTitlePrefix(nextLevel, i)}${originalTitle}`;
      return updateTerm(term[`lv${nextLevel}Terms`], nextLevel);
    });
  };
  updateTerm(newData.contract && newData.contract.lv1Terms, 1);

  return newData;
};

export default function echo(data, err) {
  return new Promise((resolve, reject) => {
    if (err) {
      return reject(err);
    }

    for (let index = 1; index <= 2; index++) {
      // Load the docx file as a binary
      const content = fs
      .readFileSync(path.resolve(__dirname, `input0${index}.docx`), 'binary');

      const zip = new PizZip(content);
      let doc;
      try {
        doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          nullGetter() {
            return '';
          },
        });
      } catch (error) {
        // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
        errorHandler(error);
      }

      // set the templateVariables
      doc.setData(normalizeData(d));

      doc.setOptions({
        nullGetter() {
          return '';
        },
      });
      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
      } catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
        errorHandler(error);
      }

      const buf = doc.getZip()
          .generate({ type: 'nodebuffer' });

      // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
      fs.writeFileSync(path.resolve(__dirname, `output0${index}.docx`), buf);
    }

    return resolve(data);
  });
}
