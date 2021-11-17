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

(function () {

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