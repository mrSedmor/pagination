// Якщо використовуєте бандлер використайте одну із закоментованих форм запису
// import spriteHref from "./images/sprite.svg";
// const spriteHref = require("./sprite.svg");
const spriteHref = "./sprite.svg";

class Pagination {
  /*
  selector - контейтер для пагінації; селектор або елемент.
  buttonsCount - кількість кнопок зі сторінками, які будуть строврені в DOM
  config - див метод tune; обов'язково передайде всі аргументи
*/
  constructor({ selector, buttonsCount, ...config }) {
    this.refs = {
      container: selector instanceof Element ? selector : document.querySelector(selector),
    };
    this.pageSelectedCallback = (page) => {};
    this.refs.container.addEventListener("click", this.clickHandler.bind(this));
    this.createComponent(buttonsCount);
    this.tune(config);
  }
  /*
  Функція переналаштовує та перемальовує пагінацію
  page - номер активної сторінки
  totalPages - всього сторінок
  pageSelectedCallback - колбек функція, що буде викликана при натисканні на кнопку із номером сторінки
  maxButtons - кількість кнопок з номерами сторінок
  hasDots - true, якщо використовувати кнопку "..."

  Передайте тільки ті аргументи, що відрізняютсья від попереднього виклика метода.
*/
  tune({ page, totalPages, pageSelectedCallback, maxButtons, hasDots }) {
    this.page = page ?? this.page;
    this.totalPages = totalPages ?? this.totalPages;
    this.pageSelectedCallback = pageSelectedCallback ?? this.pageSelectedCallback;

    const hide = this.totalPages < 2;
    this.refs.container.classList.toggle("hidden", hide);
    if (hide) {
      return;
    }

    this.maxButtons = maxButtons ? (maxButtons % 2 === 1 ? maxButtons : maxButtons + 1) : this.maxButtons; //Math.trunc(x / 2) * 2 + 1
    this.hasDots = hasDots ?? this.hasDots;
    this.noDots = !hasDots;

    const n = Math.min(this.maxButtons, this.totalPages);
    for (let i = 0; i < n; i += 1) {
      this.refs.buttons[i].classList.remove("hidden");
    }
    for (let i = n; i < this.refs.buttons.length; i += 1) {
      this.refs.buttons[i].classList.add("hidden");
    }
    this.updateModel(this.page);
    this.render();
  }

  clickHandler(event) {
    const target = event.target.closest(".pagin__button");
    if (!target) {
      return;
    }

    const pageTarget = Number(target.dataset.target);
    if (pageTarget === NaN) {
      return;
    }
    this.updateModel(pageTarget);
    this.render();
    this.pageSelectedCallback(pageTarget);
  }

  // Метод створює HTML розмітку пагінації та вставляє її в контейнер
  createComponent(maxButtons) {
    const buttonsMarkup = [];
    buttonsMarkup.push(`
  <button type="submit" class="pagin__button pagin__button-left">
    <svg>
      <use href="${spriteHref}#icon-arrow-left"></use>
    </svg>
  </button>`);
    for (let i = maxButtons; i > 0; i -= 1) {
      buttonsMarkup.push('<button type="submit" class="pagin__button pagin__button-page"></button>');
    }
    buttonsMarkup.push(`
  <button type="submit" class="pagin__button pagin__button-right">
    <svg>
      <use href="${spriteHref}#icon-arrow-right"></use>
    </svg>
  </button>`);
    this.refs.container.innerHTML = buttonsMarkup.join("");
    this.refs.leftArrow = this.refs.container.querySelector(".pagin__button-left");
    this.refs.rightArrow = this.refs.container.querySelector(".pagin__button-right");
    this.refs.buttons = this.refs.container.querySelectorAll(".pagin__button-page");
  }
  // Оновлює модель пагінації
  // page - нова активна сторінка
  updateModel(page) {
    this.page = page;
    this.leftArrow = {
      hidden: page === 1,
      target: page - 1,
    };
    this.rightArrow = {
      hidden: page === this.totalPages,
      target: page + 1,
    };
    this.buttons = [];
    const pushButton = (caption, target) => {
      this.buttons.push({ caption, target, isCurrent: caption === page });
    };

    if (this.totalPages <= this.maxButtons) {
      for (let i = 1; i <= this.totalPages; i += 1) {
        pushButton(i, i);
      }
      return;
    }

    const noLeftArrow = page <= Math.trunc(this.maxButtons / 2) + 1;
    const hasLeftArrow = !noLeftArrow;
    const noRightArrow = page >= this.totalPages - Math.trunc(this.maxButtons / 2);
    const hasRightArrow = !noRightArrow;

    if (this.noDots) {
      let iPage = 1;
      if (hasLeftArrow && noRightArrow) {
        iPage = this.totalPages - this.maxButtons + 1;
      }
      if (hasLeftArrow && hasRightArrow) {
        iPage = page - Math.trunc(this.maxButtons / 2);
      }

      for (let i = 1; i <= this.maxButtons; i += 1, iPage += 1) {
        pushButton(iPage, iPage);
      }
    }
    if (this.hasDots) {
      pushButton(1, 1);
      if (hasLeftArrow) {
        pushButton("...", page - Math.trunc(this.maxButtons / 2) - 1);
      } else {
        pushButton(2, 2);
      }
      let iPage = 3;
      if (hasLeftArrow && noRightArrow) {
        iPage = this.totalPages - this.maxButtons + 3;
      }
      if (hasLeftArrow && hasRightArrow) {
        iPage = page - Math.trunc(this.maxButtons / 2) + 2;
      }

      for (let i = 1; i <= this.maxButtons - 4; i += 1, iPage += 1) {
        pushButton(iPage, iPage);
      }

      if (hasRightArrow) {
        pushButton("...", page + Math.trunc(this.maxButtons / 2) + 1);
      } else {
        pushButton(this.totalPages - 1, this.totalPages - 1);
      }

      pushButton(this.totalPages, this.totalPages);
    }
  }
  // Оновлює вид пагінації на сторінці
  render() {
    this.refs.leftArrow.classList.toggle("hidden", this.leftArrow.hidden);
    this.refs.leftArrow.dataset.target = this.leftArrow.target;
    this.refs.rightArrow.classList.toggle("hidden", this.rightArrow.hidden);
    this.refs.rightArrow.dataset.target = this.rightArrow.target;

    this.buttons.forEach(({ caption, target, isCurrent }, index) => {
      const buttonRef = this.refs.buttons[index];
      buttonRef.textContent = caption;
      buttonRef.dataset.target = target;
      buttonRef.classList.toggle("current", isCurrent);
    });
  }
}

// Приклад використання пагінації

/*
  Задача.
  Нехай для мобільних пристроїв із шириною екрана не більше 480 px буде не більше 
  5 кнопок з номерами сторінок і не буде використовуватись кнопка '...'.
  Для пристроїв більшої ширини буде не більше 9 кнопок та буде використано '...'.
*/
const MOBILE_WIDTH = 480;
let isMobileWidth = window.innerWidth <= MOBILE_WIDTH;
const MOBILE_MAX_BUTTONS = 5;
const DESKTOP_MAX_BUTTONS = 9;

// Створюємо компонент.
const pagination = new Pagination({
  selector: ".pagination",
  buttonsCount: DESKTOP_MAX_BUTTONS,
  page: 1,
  totalPages: 1000,
  pageSelectedCallback: console.log.bind(null, "Обрано сторінку №"),
  maxButtons: isMobileWidth ? MOBILE_MAX_BUTTONS : DESKTOP_MAX_BUTTONS,
  hasDots: !isMobileWidth,
});

// Відстежуємо змішу ширини екрану, щоб змінювати зовнішній вигляд пагінації
window.addEventListener("resize", windowResizeHandler);

function windowResizeHandler(event) {
  let isMobileNewWidth = window.innerWidth <= MOBILE_WIDTH;
  if (isMobileWidth && !isMobileNewWidth) {
    pagination.tune({
      maxButtons: DESKTOP_MAX_BUTTONS,
      hasDots: true,
    });
  }
  if (!isMobileWidth && isMobileNewWidth) {
    pagination.tune({
      maxButtons: MOBILE_MAX_BUTTONS,
      hasDots: false,
    });
  }
  isMobileWidth = isMobileNewWidth;
}
