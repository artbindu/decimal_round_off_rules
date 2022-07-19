function createRegex(digit) {
    digit = Number(digit);
    return {
        roundOffPlace: digit ? digit : 2, // default round-off value 2
        beforeRounOffDigit_regx: new RegExp(`[\\+\\-\\d]*\.[\\d]{${digit - 1}}`, 'g'),
        roundOffDigit_regx: new RegExp(`(?<=[\\d]*\\.[\\d]{${digit - 1}})[\\d]`, 'g'),
        firstDiscardDigit_regx: new RegExp(`(?<=[\\d]*\\.[\\d]{${digit}})[\\d]`, 'g'),
        anyNonZeroDiscardDigit_regx: new RegExp(`(?<=[\\d]*\\.[\\d]{${digit + 1},})[1-9]`, 'g'),
        noOfDecimalDigits: new RegExp(`(?<=\\d*\\.)[\\d]*`, 'g'),
        noOfIntegerDigits: new RegExp(`[\\d]+(?=[\\.][\\d]+)`, 'g'),
        checkSign: new RegExp(`[\\+\\-](?=[\\.][\\d]+)`, 'g')
    };
}

addDecimalDigits = ((d) => {
    let s = '';
    for (let i = 0; i < d; i++) s += '0';
    return s;
})

const arrList = ['0.003', '9.9999999999999999', '.005', '0.0050001', '7.2550000190', '7.255', '7.2550000',
    '12.992', '12340.999', '123.995001', '999.99612322', '7.09612322',
    '1234.', '6789', ".", -12.346, "-.2345", "-.", '6.0422', '6.4872',
    '6.997', '6.06500', '7.485', '6.755000', '8.995', '6.06501', '7.4852007', '', '0'];

function roundOffRules(num, isDefaultData = false) {
    if (!num || !/\d/g.test(num)) {
        return `<strong>-</strong>`;
    }
    // Validate Case for this type of input: "1234." or "."
    let roundOffValue;
    if(num.match(regexInfo.noOfDecimalDigits)?.toString().length > regexInfo.roundOffPlace) {
        const beforeRounOffDigit = num.match(regexInfo.beforeRounOffDigit_regx)?.[0];
        const roundOffDigit = Number(num.match(regexInfo.roundOffDigit_regx)?.[0]);
        const firstDiscardDigit = Number(num.match(regexInfo.firstDiscardDigit_regx)?.[0]);
        const anyNonZeroDiscardDigit = Number(num.match(regexInfo.anyNonZeroDiscardDigit_regx)?.[0]);
        const idOddRoundOffDigit = /[13579]/g.test(roundOffDigit);
        const carry = !firstDiscardDigit ? 0 : firstDiscardDigit > 5 ? 1 : firstDiscardDigit < 5 ? 0 : anyNonZeroDiscardDigit ? 1 : idOddRoundOffDigit ? 1 : 0;
        const rule = !firstDiscardDigit ? 'GR' : firstDiscardDigit > 5 ? 'R1' : firstDiscardDigit < 5 ? 'R2' : anyNonZeroDiscardDigit ? 'R3' : idOddRoundOffDigit ? 'R4' : 'R5';
        // console.log(beforeRounOffDigit, roundOffDigit, firstDiscardDigit, anyNonZeroDiscardDigit, '(',idOddRoundOffDigit,')', carry);

        if (roundOffDigit === 9 && carry) {
            roundOffValue = (Number(`${beforeRounOffDigit}` + `${roundOffDigit ? roundOffDigit : 0}`) + Number(`0.${addDecimalDigits(regexInfo.roundOffPlace - 1)}${carry}`)).toString();
        } else {
            roundOffValue = (beforeRounOffDigit + ((roundOffDigit ? roundOffDigit : 0) + carry)).toString();
        }
    } else {
        roundOffValue = num;
        rule = "GN";
    }

    // Beaufity number upto two decimal places
    const dd = roundOffValue.match(regexInfo.noOfDecimalDigits)?.toString().length;
    roundOffValue = roundOffValue + (dd === undefined ? `.${addDecimalDigits(regexInfo.roundOffPlace)}` : dd < regexInfo.roundOffPlace ? addDecimalDigits(regexInfo.roundOffPlace - dd) : '');
    const id = roundOffValue.match(regexInfo.noOfIntegerDigits)?.toString().length;
    if (id === undefined) {
        roundOffValue = roundOffValue.match(regexInfo.checkSign)?.length ? roundOffValue.replace(regexInfo.checkSign, '$&0') : ('0' + roundOffValue);
    }

    console.log(`${roundOffValue} (${num}) --- ${isDefaultData}`);
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
                        <td>${roundOffRules(ele.toString(), true)}</td>
                    </tr>`;
    });
    return result + `</table>`;
}

/**
 * Create Regular Expressions
 */
let regexInfo = createRegex(3);

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
function onDPSubmit() {
    const n2 = document.getElementById("dcPlace").value;
    if (n2) {
        regexInfo = createRegex(Number(n2));
        document.getElementById('sample_data').innerHTML = getData(arrList);
        onSubmit();
    } else {
        alert("Enter Round-Off Place between 1-10")
    }
}

/**
*  Default Call during page loading time
*/
document.getElementById('sample_data').innerHTML = getData(arrList);
onSubmit();
