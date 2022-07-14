function createRegex(digit) {
    digit = Number(digit);
    return {
        uptoOneDecimal: new RegExp(`[\\+\\-\\d]*\.[\\d]{${digit - 1}}`, 'g'),
        twoDecimalDigit: new RegExp(`(?<=[\\d]*\\.[\\d]{${digit - 1}})[\\d]`, 'g'),
        threeDecimalDigit: new RegExp(`(?<=[\\d]*\\.[\\d]{${digit}})[\\d]`, 'g'),
        anyNonZeroDigitsAfterThreeDecimalDigit: new RegExp(`(?<=[\\d]*\\.[\\d]{${digit + 1},})[1-9]`, 'g'),
        noOfDecimalDigits: new RegExp(`(?<=[\\d]*[\\.])[\\d]*`, 'g'),
        noOfIntegerDigits: new RegExp(`[\\d]+(?=[\\.][\\d]+)`, 'g'),
        checkSign: new RegExp(`[\\+\\-](?=[\\.][\\d]+)`, 'g'),
        oddRegex: new RegExp(`[13579]`, 'g')
    };
}

const arrList = ['0.003', '.005', '0.0050001', '7.2550000190', '7.255', '7.2550000',
    '12.992', '12340.999', '123.995001', '999.99612322', '7.09612322',
    '1234.', '6789', ".", -12.346, "-.2345", "-.", '6.0422', '6.4872',
    '6.997', '6.06500', '7.485', '6.755000', '8.995', '6.06501', '7.4852007', ''];

function roundOffRules(num) {
    // Validate Case for this type of input: "1234." or "."
    const d = num.match(regexInfo.noOfDecimalDigits)?.toString().length;
    num = num + (d === undefined ? '.0' : d === 0 ? '0' : '');

    const uptoSingleDigit = num.match(regexInfo.uptoOneDecimal)?.[0];
    const nth = Number(num.match(regexInfo.twoDecimalDigit)?.[0]);
    const np1th = Number(num.match(regexInfo.threeDecimalDigit)?.[0]);
    const np1next = Number(num.match(regexInfo.anyNonZeroDigitsAfterThreeDecimalDigit)?.[0]);
    const nth_idOdd = /[13579]/g.test(nth);
    const carry = !np1th ? 0 : np1th > 5 ? 1 : np1th < 5 ? 0 : np1next ? 1 : nth_idOdd ? 1 : 0;
    const rule = !np1th ? 'GR' : np1th > 5 ? 'R1' : np1th < 5 ? 'R2' : np1next ? 'R3' : nth_idOdd ? 'R4' : 'R5';
    // console.log(uptoSingleDigit, nth, np1th, np1next, '(',nth_idOdd,')', carry);

    let roundOffValue;
    if (nth === 9 && carry) {
        roundOffValue = (Number(`${uptoSingleDigit}` + `${nth ? nth : 0}`) + Number(`0.0${carry}`)).toString();
    } else {
        roundOffValue = (uptoSingleDigit + ((nth ? nth : 0) + carry)).toString();
    }
    // Beaufity number upto two decimal places
    const dd = roundOffValue.match(regexInfo.noOfDecimalDigits)?.toString().length;
    roundOffValue = roundOffValue + (dd === undefined ? '.00' : dd === 1 ? '0' : '');
    const id = roundOffValue.match(regexInfo.noOfIntegerDigits)?.toString().length;
    if (id === undefined) {
        roundOffValue = roundOffValue.match(regexInfo.checkSign)?.length ? roundOffValue.replace(regexInfo.checkSign, '$&0') : ('0' + roundOffValue);
    }

    console.log(`${roundOffValue} (${num})`);
    return `<strong>${roundOffValue}</strong> ${rule ? ('<span style="color:red">(<strong>' + rule + '</strong>)</span>') : ''}`;
}

function getData(arr) {
    let result = `<table style="width:100%">
                    <tr>
                        <th>Actual Number</th>
                        <th>Round-Off Value</th>
                    </tr>`;
    arr.forEach(ele => {
        result += `<tr>
                        <td><strong>${ele}</strong></td>
                        <td>${roundOffRules(ele.toString())}</td>
                    </tr>`;
    });
    return result + `</table>`;
}

/**
 * Create Regular Expressions
 */
let regexInfo = createRegex(2);

/**
 * Main Function
 */
const btnSubmit = document.getElementById('submit');
btnSubmit?.addEventListener("click", onSubmit);

function onSubmit() {
    const n1 = document.getElementById("dcnumber");
    // e.preventDefault();
    document.getElementById('rfnumber').innerHTML = roundOffRules(n1.value ? n1.value : 0);
}

/**
*  Show Sample Data
*/
// function onDPSubmit() {
//     const n2 = document.getElementById("dcPlace").value;
//     regexInfo = createRegex(n2 ? n2 : 2);
//     document.getElementById('sample_data').innerHTML = `<h3>Example (2 Decimal Places)</h3><hr>${roundOffRules(arrList, true)}`;
// }

/**
*  Default Call during page loading time
*/
createRegex(2);
document.getElementById('sample_data').innerHTML = getData(arrList);
onSubmit();
