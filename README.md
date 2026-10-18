# Arte — стартов шаблон за сайт на имотен девелопър

Стартов проект, който пресъздава **оформлението, анимациите, интеракциите и технологичния стек** на сайтове
като lenvalproperties.com. Целият код, текстове, лого и изображения са оригинални placeholder-и:
нищо не е копирано от оригиналния сайт (снимки, видеа, шрифтове, текстове, скриптове).
Сменете ги със собствените си материали.

## Стек

| Оригинал (Webflow)                         | Тук                                              |
| ------------------------------------------ | ------------------------------------------------ |
| Webflow CMS + jQuery                       | Vite 8 (multi-page), vanilla ES modules          |
| GSAP 3.15: ScrollTrigger, SplitText, CustomEase, Flip | същото (npm `gsap`)                    |
| Lenis (smooth scroll)                      | Lenis, синхронизиран с GSAP ticker               |
| Barba.js (page transitions)                | Barba.js 2 + overlay преход                      |
| Swiper                                     | Swiper 11 (галерия на Projects)                  |
| Видео сенки на листа, WebGL fluid cursor   | процедурни сенки + лек 2D canvas „светлинна следа“ |
| Helvetica Now / Financier Display (платени)| Inter Tight / Newsreader (Google Fonts)          |

## Стартиране

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Структура

```
index.html, about.html, projects.html, contact.html   # страници (Barba containers)
partials/              # споделени части, включвани с <!-- @include partials/x.html -->
  shell-top.html       # прелоудър, преход, cookies, хедър, fluid cursor
  shell-bottom.html    # floating tip, CTA модал с форма, мобилно меню
  footer.html, logo.html
src/css/main.css       # токени, флуидна rem скала, 12-колонна решетка, секции
src/js/core.js         # GSAP плъгини, custom eases, Lenis
src/js/main.js         # Barba lifecycle: init/destroy на модулите за всяка страница
src/js/modules/*.js    # по един модул на ефект (виж долу)
public/img/            # генерирани SVG placeholder изображения
```

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
| Стикнати full-screen проекти, предишният се свива/затъмнява, брояч P1/04 | `data-projects`, `data-project-card` | `projects.js` |
| Архитектурна скица, рисувана при скрол | `data-sketch` (или сложете свой `<svg>` вътре) | `sketch.js` |
| Pinned секция, думите се разтварят | `data-purpose`, `data-purpose-word` | `purpose.js` |
| Табове с услуги (autoplay, wipe на снимки) | `data-tabs`, `data-tab-*` | `tabs.js` |
| Курсор-кръг с етикет („View project“) | `data-tip="Текст"` на всеки елемент | `cursor.js` |
| Светлинна следа след курсора | автоматично (само desktop) | `cursor.js` |
| Хедърът сменя цвета си според секцията отдолу | `data-bg="dark|light|color"` на секциите | `header.js` |
| Часовник в хедъра | `data-clock data-tz="Europe/Sofia"` | `header.js` |
| Футър: огромно лого, „фенерче“ под курсора | `data-footer-logo` | `footer.js` |
| Списък с проекти с плаващ preview | `data-plist`, `data-plist-item data-img` | `project-list.js` |
| Модали (CTA форма, мобилно меню) | `data-modal-open="cta"`, `data-modal-close` | `modal.js` |
| Cookies банер | автоматично, пази избора в localStorage | `cookies.js` |
| „Завъртете устройството“ при landscape на телефон | автоматично | CSS |

## Решетка и мерни единици

- Дизайнът е за 1440px (desktop) и 375px (mobile). `html { font-size }` скалира с ширината,
  така че `1rem` = 16 дизайн-пиксела: пишете размерите като `px / 16` rem.
- 12 колони (4 на мобилно), gap 16px, страничен отстъп 8px.
- Теми: `.theme_on-dark`, `.theme_on-color` (светъл текст), без клас = светъл фон.

## Следващи стъпки

- Сменете `public/img/*.svg` със снимки (по желание `<video>` за hero и сенките).
- Свържете формата в `modal.js` с реален endpoint.
- При нужда от CMS: Astro/Eleventy с данни за проектите — HTML структурата е готова за шаблониране.
