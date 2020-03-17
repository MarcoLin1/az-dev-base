import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import deepcopy from 'deepcopy';
import ntcw from "number-to-chinese-words";

import fs from 'fs';
import path from 'path';

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
  let maxCompanyLength = 0;
  newData.contractors.forEach((contractor, i) => {
    contractor.nickName = getNickName(i);
    if (maxCompanyLength < contractor.name.length) {
      maxCompanyLength = contractor.name.length;
    }
  });
  maxCompanyLength += 8;
  maxCompanyLength *= 2;
  newData.contractors.forEach((contractor, i) => {
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

const appName = '客戶預約管理系統';

const d = {
  appName,
  contractors: [
    { name: '○○○公司', representative: '', address: '', id: '' },
    { name: '思序網路有限公司', representative: '陳宗麟', address: '臺北市松山區敦化北路218號7樓', id: '52570902' },
  ],
  contract: {
    lv1Title: 'xxxx',
    lv1Desc: '茲就甲方委託乙方進行軟體程式設計事宜，雙方特訂立條款如后，以資共守：',
    lv1Terms: [
      {
        lv2Title: '標的物',
        lv2Desc: `甲方委託乙方完成「${appName}」軟體設計案，其內容明細及規格如附件一所載(以下簡稱本軟體)。`,
      },
      {
        lv2Title: '工程進度',
        lv2Terms: [
          {
            lv3Title: '乙方應依附件二之《日程計劃進度表》之規定，進行本軟體之設計事宜，且乙方在依《日程計劃進度表》之規定提示各階段成果予甲方時，須經甲方確認無誤後，始得進行下一階段之設計事宜，至最後之設計成果交付甲方時為止。',
          },
          {
            lv3Title: '為便於乙方執行本軟體之設計事宜，甲方應免費提供其認為適當之資料予乙方參考。',
          },
          {
            lv3Title: '如甲方認為本標的物之設計有變更必要時，一經甲方通知，乙方應為辦理；若前述甲方要求變更之項目並未超出附件一所示之範圍時，則乙方不得向甲方要求額外之變更費用，但若前述變更項目超出附件一所示之範圍時，由雙方另行協議本件標的物之進度及應追加之費用。',
          },
        ],
      },
      {
        lv2Title: '報酬及付款條件',
        lv2Desc: '本軟體之報酬總計新台幣(下同)      元整(含稅)，並由甲方依下列條件以現金或即期票方式付予乙方：',
        lv2Terms: [
          {
            lv3Title: '本合約簽訂時，支付本軟體報酬總額的      %，計     元整(含稅)。',
          },
          {
            lv3Title: '乙方提交本軟體試作版本予甲方時，經甲方確認主要功能無誤後，支付本軟體報酬總額的     %，計     元整(含稅)。',
          },
          {
            lv3Title: '乙方提交本軟體予甲方時，支付本軟體報酬總額的     %，計     元整(含稅)。',
          },
          {
            lv3Title: '本軟體經甲方驗收無誤後，支付報酬總額的     %，計   元整(含稅)。',
          },
        ],
      },
      {
        lv2Title: '交付及驗收',
        lv2Terms: [
          {
            lv3Title: '乙方應於約定之期限屆滿前完成本軟體，並將本軟體及相關文件交由甲方進行驗收；但經甲方同意或因不可歸責於乙方之事由致本軟體之完成遲延時，不在此限。',
          },
          {
            lv3Title: '甲方於驗收時若發現乙方交付之本軟體不符合附件一之要求或含有不符合實用之瑕疵時，應通知乙方進行修正，乙方應於接獲甲方通知後十五天內將上述瑕疵修正完成，並將修改完成後之本軟體交付甲方再依前述流程進行測試驗收，至驗收合格為止。',
          },
        ],
      },
      {
        lv2Title: '擔保',
        lv2Terms: [
          {
            lv3Title: '乙方保證本軟體係其自行創作完成，絕無抄襲或侵犯他人智慧財產權等情事，如有任何第三人主張前述侵權責任時，乙方應協助甲方提出抗辯，並負擔所有經法院判決確定之賠償額及費用，但前述乙方之賠償責任以本軟體之報酬總價金為限。',
          },
          {
            lv3Title: '前述侵權主張經法院判決結果確認本軟體有侵害其他第三人之智慧財產權時，乙方應依甲方要求將上述涉嫌侵害他人權利之部分予以重作或修改至完全沒有侵害之狀況。',
          },
        ],
      },
      {
        lv2Title: '保密義務',
        lv2Terms: [
          {
            lv3Title: '任一方對因本合約而知悉或持有之他方商業機密，應負保密義務，且未經他方書面同意前，不得將前述機密資訊為合約目的外之使用或洩漏予他人。接受機密資訊之ㄧ方並應採取必要措施，防止機密資訊被竊、洩漏。',
          },
          {
            lv3Title: '本保密義務存續至本合約終止或解除後一年，但對非因收受機密資訊方之違約而使其成為公開、眾所周知或公共財產之資訊者，不在此限。',
          },
        ],
      },
      {
        lv2Title: '智慧財產權歸屬',
        lv2Terms: [
          {
            lv3Title: '乙方在本專案中，使用其他廠商或自身發展完成之工具性軟體、共用元件、軟體函式庫(Software Library)或開發框架(Framework)，其著作權與智慧財產權屬原廠商所有，甲方僅具使用權，非經原廠商書面同意，甲方不得為任何形式之複製或主張。',
          },
          {
            lv3Title: '乙方同意授權甲方於前述乙方自身發展完成之部分，於本軟體範圍內之備份、維護、更新、新功能開發、或其他合理之軟體維運或開發行為目的下，有在任何地點使用、複製、修改、製作衍生物、授權他人使用該部分之權利，以及其他乙方所有除轉讓權以外之權利。乙方不得撤銷此項授權，且甲方不須因此支付任何費用。',
          },
          // {
          //   lv3Title: '乙方同意授權甲方於前述乙方自身發展完成之部分，有在任何地點使用、複製、修改、製作衍生物、授權他人使用該新開發部分之權利，以及其他乙方所有除轉讓權以外之權利。乙方不得撤銷此項授權，且甲方不須因此支付任何費用。',
          // },
          // {
          //   lv3Title: '乙方為本專案產品新開發部分之著作人，擁有該新開發部分之著作權，並授權甲方於該新開發部分之著作權存續期間，有在任何地點使用、複製、修改、製作衍生物、授權他人使用該新開發部分之權利，以及其他乙方所有除轉讓權以外之權利。乙方不得撤銷此項授權，且甲方不須因此支付任何費用。',
          // },
          {
            lv3Title: '依本合約新開發完成之著作(含軟體、原始程式碼、文件及各項紀錄)，乙方為著作人，其著作財產權於著作完成同時讓與甲方，甲方有權永久保存及無償使用，乙方並承諾不行使其著作人格權。',
          },
          {
            lv3Title: '乙方同意依甲方之要求，協助甲方辦理前述智慧財產權取得或登記之一切必要手續。',
          },
        ],
      },
      {
        lv2Title: '合約終止與違約責任',
        lv2Terms: [
          {
            lv3Title: '本合約存續期間內，任一方倘有解散、歇業、破產、重整或清算等情事發生時，本合約視為禁止。',
          },
          {
            lv3Title: '乙方提交本軟體試作版本予甲方時，若其核心功能無法符合甲方實務使用，甲方得終止本合約。雙方得另議試作軟體及其報酬之交付事宜。',
          },
          {
            lv3Title: '除經甲方書面同意外，乙方進度嚴重落後，顯無法在約定期限內完成本設計工作時，甲方得終止本合約。',
          },
          {
            lv3Title: '任一方違反本合約之規定，且未在接獲他方書面通知後三十日內予以改善或改善不完全時，無違約之一方可終止本合約，並得向違約之ㄧ方請求賠償其因此所受之損害。',
          },
          {
            lv3Title: '本合約存續期間內，因客觀之技術條件變化、第三方服務供應商之服務變動或其他不可歸咎於乙方之技術問題，導致合約無法履行，雙方得協議終止本合約，並另議終止合約相關事宜。',
          },
        ],
      },
      {
        lv2Title: '保固責任',
        lv2Terms: [
          {
            lv3Title: '本軟體自驗收合格之次日起，應由乙方保固一年，於保固期間內發現有不具備約定之品質，不適於通常或約定使用之軟體瑕疪者，乙方應無條件進行瑕疵修正，至甲方驗收合格為止。',
          },
          {
            lv3Title: '保固期間內，甲方或甲方委託之第三人，對本軟體、其相關資料庫或各項軟、硬體設定值進行變更及修改時，保固期限立即中止，且乙方承擔之保固責任立即消滅，甲方不得再就軟體瑕疪，要求乙方進行無條件之瑕疵修正。',
          },
          {
            lv3Title: '保固期滿後，雙方得另議軟體維護合約，或由甲方或甲方委託之第三人進行軟體保固及維護。',
          },
        ],
      },
      {
        lv2Title: '轉讓限制',
        lv2Desc: '非經他方書面同意，任一方不得將本合約之權利義務移轉或讓與第三人。',
      },
      {
        lv2Title: '其它',
        lv2Terms: [
          {
            lv3Title: '本合約所附之各項附件均構成本合約之ㄧ部分；且本合約一經雙方合法簽署後，將取代雙方先前就本合約所為之任何口頭或書面之承諾或協議。',
          },
          {
            lv3Title: '本合約非經雙方書面同意不得修改，如有修改，應以書面為之。',
          },
          {
            lv3Title: '本合約任何條款倘有無效、可撤銷、不合法或不可執行之情況者，並不影響其他條款之效力，且本合約之其他條款，均繼續有效。',
          },
          {
            lv3Title: '不論何時，若任一方對本合約任何條款所載權利不予主張時，該項作為或不作為不得解釋為對該條款或對本合約其他條款所載權利之放棄。',
          },
          {
            lv3Title: '本合約如有未盡事宜，依中華民國相關法令或資訊業界慣例解釋之。',
          },
          {
            lv3Title: '甲、乙雙方同意對於本合約所引起之任何疑義、糾紛，將依誠信原則解決之；如有訴訟之必要時，並同意以台灣台北地方法院為第一審管轄法院。',
          },
          {
            lv3Title: '本合約自雙方簽署後生效；本合約壹式貳份，由雙方各執乙份為憑。',
          },
        ],
      },
      // {
      //   lv2Title: '報酬及付款條件',
      //   lv2Desc: '本軟體之報酬總計新台幣(下同)      元整(含稅)，並由甲方依下列條件以現金或即期票方式付予乙方：',
      //   lv2Terms: [
      //     {
      //       lv3Title: '項目1.',
      //       lv3Desc: 'xxxxx',
      //       lv3Terms: [
      //         {
      //           lv4Title: '乙方應依附件二之《日程計劃進度表》之規定，進行本軟體之設計事宜，且乙方在依《日程計劃進度表》之規定提示各階段成果予甲方時，須經甲方確認無誤後，始得進行下一階段之設計事宜，至最後之設計成果交付甲方時為止。',
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
  },
  tasks: [
    {
      task: 'John',
      detail: 'Doe',
      function: '+44546546454',
      x: true,
    },
    {
      task: 'Jane',
      detail: 'Doe',
      function: '+445476454',
      x: false,
    },
  ],
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
