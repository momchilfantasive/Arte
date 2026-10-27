# Arte — стартов шаблон за сайт на имотен девелопър

Стартов проект, който пресъздава **оформлението, анимациите, интеракциите и технологичния стек** на сайтове
като lenvalproperties.com. Кодът и текстовете са оригинални (текстовете са placeholder-и).
Снимките и видеата са на клиента (Arte del Lusso, взети от partners.artedellusso.es / Sanity CDN),
оптимизирани: снимки до 2000px JPG, видеа — 10-секундни клипове 1600px H.264 без звук.

## Стек

| Оригинал (Webflow)                         | Тук                                              |
| ------------------------------------------ | ------------------------------------------------ |
| Webflow CMS + jQuery                       | Vite 8 (multi-page), vanilla ES modules          |
| GSAP 3.15: ScrollTrigger, SplitText, CustomEase, Flip | същото (npm `gsap`)                    |
| Lenis (smooth scroll)                      | Lenis, синхронизиран с GSAP ticker               |
| Barba.js (page transitions)                | Barba.js 2 + overlay преход                      |
| Swiper                                     | Swiper 11 (галерия на Projects)                  |
| Видео сенки на листа, WebGL fluid cursor   | процедурни сенки + лек 2D canvas „светлинна следа“ |
| Helvetica Now / Financier Display (платени)| Inter Tight / Spectral (Google Fonts)            |

## Стартиране

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Структура

Съдържанието следва content handoff документа на ARTE del Lusso (английски текстове, 8 страници).
Маршрутите от документа са плоски файлове, за да работи билдът от всеки базов URL:

| Маршрут в документа         | Файл                  |
| --------------------------- | --------------------- |
| `/`                         | `index.html`          |
| `/solutions/curtains/`      | `curtains.html`       |
| `/solutions/outdoor/`       | `outdoor.html`        |
| `/projects/`                | `projects.html`       |
| `/projects/villa-albinoni/` | `villa-albinoni.html` |
| `/showrooms/`               | `showrooms.html`      |
| `/professionals/`           | `professionals.html`  |
| `/contact/`                 | `contact.html`        |

```
partials/              # споделени части, включвани с <!-- @include partials/x.html -->
  shell-top.html       # прелоудър, преход, cookies, хедър, fluid cursor
  shell-bottom.html    # floating tip, галерия (lightbox), мобилно меню
  footer.html, logo.html
src/css/main.css       # токени, флуидна rem скала, 12-колонна решетка, секции
src/js/core.js         # GSAP плъгини, custom eases, Lenis
src/js/main.js         # Barba lifecycle: init/destroy на модулите за всяка страница
src/js/modules/*.js    # по един модул на ефект (виж долу)
public/img/            # снимки на клиента по ключовете от документа (quinta, albinoni…)
public/video/          # клип с тенти на клиента (Outdoor CTA)
```

Формата за контакт е прототип: попълва се от параметрите `?type=`, `?interest=curtains`,
`?project=villa-albinoni` и `?visit=online` и при изпращане само показва съобщение.

## Анимации и интеракции

| Ефект | Как се ползва | Модул |
| --- | --- | --- |
| Прелоудър: линии на решетката, брояч 00→100%, думите се разтварят по решетката (Flip), снимка в центъра, wipe нагоре | автоматично при първо зареждане | `preloader.js` |
| Преход между страници (overlay с линии + лого) | всеки вътрешен линк | `transition.js` |
| Текст „rolls“ при hover | `data-hover-roll` + двойни `.nav-item_label` | CSS |
| Редове текст изплуват при скрол (SplitText, masks) | `data-reveal` | `reveal.js` |
| Fade-up / clip reveal / рисуващи се линии | `data-reveal-fade`, `data-clip-reveal`, `data-bg-lines` | `reveal.js` |
| Паралакс | `data-parallax-img`, `data-parallax-inner`, `data-parallax-bg` | `parallax.js` |
| Hero: бавен zoom-out + избутване при скрол | `data-hero-bg`, `data-hero-title` | `hero.js` |
| Стикнати full-screen проекти, брояч, бутони Previous / Next | `data-projects`, `data-project-card` | `projects.js` |
| Архитектурна скица, рисувана при скрол | `data-sketch` (или сложете свой `<svg>` вътре) | `sketch.js` |
| Pinned секция, думите се разтварят | `data-purpose`, `data-purpose-word` | `purpose.js` |
| Табове (стрелки/Home/End, wipe на снимки, autoplay по избор) | `data-tabs`, `data-tab-*`, `data-tabs-autoplay` | `tabs.js` |
| Курсор-кръг с етикет („View project“) | `data-tip="Текст"` на всеки елемент | `cursor.js` |
| Светлинна следа след курсора | автоматично (само desktop) | `cursor.js` |
| Хедърът сменя цвета си според секцията отдолу | `data-bg="dark|light|color"` на секциите | `header.js` |
| Часовник в хедъра, активна секция в навигацията | `data-clock data-tz="Europe/Madrid"`, `data-nav` | `header.js` |
| Футър: огромно лого, „фенерче“ под курсора | `data-footer-logo` | `footer.js` |
| Списък с проекти с плаващ preview | `data-plist`, `data-plist-item data-img` | `project-list.js` |
| Мобилно меню | `data-menu-open`, `data-modal-close` | `modal.js` |
| Галерия: брояч, Prev/Next, Escape, стрелки, заключен скрол | `data-gallery-open="0"` + `<ul data-gallery-list>` | `lightbox.js` |
| Акордеон | `data-accordion`, `data-accordion-btn` | `accordion.js` |
| Плавен скрол до котви | `<a href="#id">` | `main.js` |
| Попълване на формата от линка | `?type=…&interest=…` | `contact-form.js` |
| Cookies банер | автоматично, пази избора в localStorage | `cookies.js` |
| „Завъртете устройството“ при landscape на телефон | автоматично | CSS |

## Решетка и мерни единици

- Дизайнът е за 1440px (desktop) и 375px (mobile). `html { font-size }` скалира с ширината,
  така че `1rem` = 16 дизайн-пиксела: пишете размерите като `px / 16` rem.
- 12 колони (4 на мобилно), gap 16px, страничен отстъп 8px.
- Теми: `.theme_on-dark`, `.theme_on-color` (светъл текст), без клас = светъл фон.

## Следващи стъпки

- Свържете формата в `contact-form.js` с реален endpoint и календар за консултации.
- При нужда от CMS: Astro/Eleventy с данни за проектите — HTML структурата е готова за шаблониране.
