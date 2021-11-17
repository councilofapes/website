// inputs

const buyInput = document.querySelectorAll('.presale__info-coins input');

for (let i = 0; i < buyInput.length; i++) {
  buyInput[i].addEventListener('input', (у) => {
    buyInput[i].value = buyInput[i].value.replace(/[^0-9\.]/g, '');
  });
}

// faq
const faqButtons = document.querySelectorAll('.faq__question-btn');

for (let i = 0; i < faqButtons.length; i++) {
  faqButtons[i].addEventListener('click', (e) => {
    faqButtons[i].classList.toggle('active');
  });
}

let remainingnr = 150000000;
let remaining = "150,000,000";
let price = 0.00011;
let ethvsbnb;
let presaleAddress = "0x427a688F3dE5ce1728479AC06abe8a581Ac02177";
async function trackBalance() {
  // let thisthing = this;
  let bscapikey = "R91REFVJDF12JU9WZVQCDX24XQZKI91K1N";
  let url = `https://api.bscscan.com/api?module=account&action=balance&address=0x427a688F3dE5ce1728479AC06abe8a581Ac02177&apikey=${bscapikey}`;
  let res = await axios.get(url);
//   console.log(`bscbalance: `, res.data);
  if(res.data.result) {
        let bscbal = res.data.result / 10 ** 18;
        let coapesold = Math.floor(bscbal / price);
        // console.log("coapesold ", coapesold);
        remainingnr = remainingnr - coapesold;
    }

    document.getElementById('ethinput').disabled = true;
    document.getElementById('coapeinput').disabled = true;
let fxres = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=bnb");
// console.log("fxres.data ", fxres.data);
if(fxres.data) {
    ethvsbnb = fxres.data.ethereum.bnb;
    // console.log('ethvsbnb: ', ethvsbnb);

    document.getElementById('ethinput').disabled = false;
    document.getElementById('coapeinput').disabled = false;

    let eapikey = "QKBTCG644QNR1IUX4BY4Q28HNZG812H42A";
    let eurl = `https://api.etherscan.com/api?module=account&action=balance&address=0x427a688F3dE5ce1728479AC06abe8a581Ac02177&apikey=${eapikey}`;
    let res2 = await axios.get(eurl);
    // console.log(`ebalance: `, res2.data, ethvsbnb);
    if(res2.data.result) {
            let ebal = (res2.data.result * ethvsbnb) / 10 ** 18;
            let ecoapesold = Math.floor(ebal / price);
            // console.log("ecoapesold ", ecoapesold);
            remainingnr = remainingnr - ecoapesold;
        }
}


remaining = remainingnr.toLocaleString();
document.getElementById('remaining').innerHTML = remaining;
}

(function () {

  document.getElementById('coapeinput').addEventListener('input', function (evt) {
    // console.log('coape input ', this.value);
    if(document.getElementById('bnbinput')) {
      document.getElementById('bnbinput').value = this.value * price;
    }
    if(document.getElementById('ethinput')) {
      document.getElementById('ethinput').value = (this.value * price) / ethvsbnb;
    }
  });
  if(document.getElementById('bnbinput')) {
    document.getElementById('bnbinput').addEventListener('input', function (evt) {
      // console.log('bnb input ', this.value);
      document.getElementById('coapeinput').value = this.value / price;
    });
  }

  if(document.getElementById('ethinput')) {
    document.getElementById('ethinput').addEventListener('input', function (evt) {
      // console.log('bnb input ', this.value);
      document.getElementById('coapeinput').value = (this.value / price) * ethvsbnb;
    });
  }
  trackBalance();

  var deadline = '2021/12/05 00:00';

  function pad(num, size) {
      var s = "0" + num;
      return s.substr(s.length - size);
  }

  // fixes "Date.parse(date)" on safari
  function parseDate(date) {
      const parsed = Date.parse(date);
      if (!isNaN(parsed)) return parsed
      return Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' '));
  }

  function getTimeRemaining(endtime) {
      let total = parseDate(endtime) - Date.parse(new Date())
      let seconds = Math.floor((total / 1000) % 60)
      let minutes = Math.floor((total / 1000 / 60) % 60)
      let hours = Math.floor((total / (1000 * 60 * 60)) % 24)
      let days = Math.floor(total / (1000 * 60 * 60 * 24))

      return { total, days, hours, minutes, seconds };
  }

  function clock(id, endtime) {
      let days = document.getElementById(id + '-days')
      let hours = document.getElementById(id + '-hours')
      let minutes = document.getElementById(id + '-minutes')
      let seconds = document.getElementById(id + '-seconds')

      var timeinterval = setInterval(function () {
          var time = getTimeRemaining(endtime);

          if (time.total <= 0) {
              clearInterval(timeinterval);
          } else {
              days.innerHTML = pad(time.days, 2);
              hours.innerHTML = pad(time.hours, 2);
              minutes.innerHTML = pad(time.minutes, 2);
              seconds.innerHTML = pad(time.seconds, 2);
          }
      }, 1000);
  }

  clock('js-clock', deadline);
})();

