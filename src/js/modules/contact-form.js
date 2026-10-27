import { gsap, lenis, reducedMotion } from '../core.js';

// Booking wizard on contact.html (prototype: nothing is sent, availability is sample data).
// Steps: meeting → interest → date & time → details → review. A live summary sits alongside.
// Pre-fills from CTA links: ?visit=interiors|outdoor|online, ?type=, ?interest=, ?project=

const LABELS = {
  meeting: { showroom: 'In a showroom', property: 'At your property', online: 'Online video call' },
  showroom: { interiors: 'Curtains & blinds · Calle Lagasca 64', outdoor: 'Awnings, pergolas & screens · Calle República Checa 19' },
  type: { home: 'My home', rental: 'Rental property', sale: 'Property for sale', professional: 'Client project (trade)' },
  timing: { asap: 'As soon as possible', '1-3': 'In 1–3 months', '3-6': 'In 3–6 months', exploring: 'Just exploring' },
  contact: { phone: 'Phone call', whatsapp: 'WhatsApp', email: 'Email' },
  lang: { en: 'English', es: 'Español' },
};
// Opening hours drive the available slots (start times)
const HOURS = {
  interiors: { from: 10, to: 17, step: 60 },
  outdoor: { from: 10, to: 13, step: 60 },
  property: { from: 10, to: 16, step: 60 },
  online: { from: 10, to: 17.5, step: 30 },
};
const PROJECTS = { 'villa-albinoni': 'Villa Albinoni' };
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export function initContactForm(container) {
  const form = container.querySelector('[data-booking]');
  if (!form) return;
  const steps = [...form.querySelectorAll('[data-step]')];
  const tabs = [...form.querySelectorAll('[data-step-tab]')];
  const summary = container.querySelector('[data-summary]');
  const btnNext = form.querySelector('[data-next]');
  const btnBack = form.querySelector('[data-back]');
  let step = 1;
  let date = null;
  let time = null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let month = new Date(today.getFullYear(), today.getMonth(), 1);

  const val = (n) => form.querySelector(`[name="${n}"]:checked`)?.value || '';
  const vals = (n) => [...form.querySelectorAll(`[name="${n}"]:checked`)].map((i) => i.closest('label').textContent.trim());
  const slotKey = () => (val('meeting') === 'showroom' ? val('showroom') || 'interiors' : val('meeting') || 'online');

  // ---- prefill from the link ----
  const q = new URLSearchParams(location.search);
  const check = (n, v) => { const el = form.querySelector(`[name="${n}"][value="${v}"]`); if (el) el.checked = true; };
  const visit = q.get('visit');
  if (visit === 'interiors' || visit === 'outdoor') { check('meeting', 'showroom'); check('showroom', visit); }
  if (visit === 'online') check('meeting', 'online');
  if (q.get('type')) check('type', q.get('type'));
  const interest = q.get('interest');
  if (interest === 'curtains') check('products', 'curtains');
  if (interest === 'outdoor') check('products', 'outdoor');
  if (interest === 'several') check('products', 'unsure');
  else if (interest) check('products', interest); // blinds, carpets, wallpaper, tracks…
  if (PROJECTS[q.get('project')]) form.message.value = `I’m interested in a solution inspired by ${PROJECTS[q.get('project')]}.`;
  check('contact', 'phone'); check('lang', 'en');

  // ---- conditional fields ----
  const syncShowIf = () => form.querySelectorAll('[data-show-if]').forEach((el) => {
    const [n, v] = el.dataset.showIf.split('=');
    el.hidden = val(n) !== v;
  });

  // ---- calendar ----
  const grid = form.querySelector('[data-cal-grid]');
  const slotsEl = form.querySelector('[data-slots]');
  const slotsTitle = form.querySelector('[data-slots-title]');
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  // deterministic "taken" slots so the sample calendar looks realistic
  const taken = (d, t) => [...`${iso(d)}${t}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7) % 5 === 0;
  const slotsFor = (d) => {
    const h = HOURS[slotKey()];
    const out = [];
    for (let m = h.from * 60; m <= h.to * 60; m += h.step) {
      const t = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
      const past = d.getTime() === today.getTime() && m <= new Date().getHours() * 60 + new Date().getMinutes() + 60;
      out.push({ t, ok: !past && !taken(d, t) });
    }
    return out;
  };
  const isOpen = (d) => d >= today && d.getDay() !== 0 && d.getDay() !== 6 && slotsFor(d).some((s) => s.ok);

  const renderSlots = () => {
    slotsEl.innerHTML = '';
    if (!date) { slotsTitle.textContent = 'Select a day to see available times'; return; }
    slotsTitle.textContent = fmtDate(date);
    slotsFor(date).forEach(({ t, ok }) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'slot l1'; b.textContent = t; b.disabled = !ok;
      b.setAttribute('aria-pressed', t === time);
      b.addEventListener('click', () => { time = t; form.callme.checked = false; renderSlots(); update(); });
      slotsEl.appendChild(b);
    });
  };
  const renderCal = () => {
    form.querySelector('[data-cal-title]').textContent = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    form.querySelector('[data-cal-prev]').disabled = month <= new Date(today.getFullYear(), today.getMonth(), 1);
    form.querySelector('[data-cal-next]').disabled = month >= maxMonth;
    grid.innerHTML = '';
    const lead = (month.getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) grid.appendChild(document.createElement('span'));
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= days; n++) {
      const d = new Date(month.getFullYear(), month.getMonth(), n);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cal_day l1'; b.textContent = n;
      b.disabled = !isOpen(d);
      b.setAttribute('aria-label', fmtDate(d));
      b.setAttribute('aria-pressed', !!date && d.getTime() === date.getTime());
      if (d.getTime() === today.getTime()) b.classList.add('is-today');
      b.addEventListener('click', () => { date = d; time = null; renderCal(); renderSlots(); update(); });
      grid.appendChild(b);
    }
  };
  form.querySelector('[data-cal-prev]').addEventListener('click', () => { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); renderCal(); });
  form.querySelector('[data-cal-next]').addEventListener('click', () => { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); renderCal(); });

  // ---- files (kept local in the prototype) ----
  form.files.addEventListener('change', () => {
    const names = [...form.files.files].map((f) => f.name);
    form.querySelector('[data-file-list]').textContent = names.length ? names.join(', ') : 'No files chosen';
  });

  // ---- summary + review ----
  const rows = () => {
    const r = [];
    const m = val('meeting');
    if (m) r.push(['Meeting', LABELS.meeting[m]]);
    if (m === 'showroom' && val('showroom')) r.push(['Showroom', LABELS.showroom[val('showroom')]]);
    if (m === 'property' && form.address.value) r.push(['Address', form.address.value]);
    const p = vals('products'); if (p.length) r.push(['Interested in', p.join(', ')]);
    if (val('type')) r.push(['Project', LABELS.type[val('type')]]);
    if (val('timing')) r.push(['Timing', LABELS.timing[val('timing')]]);
    if (form.callme.checked) r.push(['Date & time', 'Call me to arrange']);
    else if (date) r.push(['Date & time', `${fmtDate(date)}${time ? ` · ${time}` : ''}`]);
    if (form.name.value) r.push(['Name', form.name.value]);
    if (form.email.value) r.push(['Email', form.email.value]);
    if (form.phone.value) r.push(['Phone', form.phone.value]);
    if (val('contact')) r.push(['Contact by', LABELS.contact[val('contact')]]);
    if (val('lang')) r.push(['Language', LABELS.lang[val('lang')]]);
    return r;
  };
  const dl = (el, r) => {
    el.innerHTML = '';
    r.forEach(([k, v]) => {
      const div = document.createElement('div');
      const dt = document.createElement('dt'); dt.className = 'text-muted'; dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      div.append(dt, dd); el.appendChild(div);
    });
  };
  const update = () => {
    syncShowIf();
    const r = rows();
    dl(summary, r.length ? r : [['Nothing selected yet', 'Start by choosing how you’d like to meet']]);
    if (step === 5) dl(form.querySelector('[data-review]'), r);
  };

  // ---- validation & navigation ----
  const valid = (n) => {
    if (n === 1) return !!val('meeting') && (val('meeting') !== 'showroom' || !!val('showroom'));
    if (n === 2) return vals('products').length > 0;
    if (n === 3) return form.callme.checked || (!!date && !!time);
    if (n === 4) return form.name.value.trim().length > 1
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())
      && form.phone.value.replace(/\D/g, '').length >= 6
      && form.consent.checked;
    return true;
  };
  const go = (n, { scroll = true } = {}) => {
    step = n;
    steps.forEach((s) => (s.hidden = Number(s.dataset.step) !== n));
    tabs.forEach((t) => {
      const k = Number(t.dataset.stepTab);
      t.classList.toggle('is-active', k === n);
      t.classList.toggle('is-done', k < n);
      if (k === n) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
    });
    btnBack.hidden = n === 1;
    btnNext.textContent = n === 5 ? 'Request booking' : 'Continue';
    if (n === 3) { renderCal(); renderSlots(); }
    update();
    const cur = steps[n - 1];
    if (!reducedMotion) gsap.fromTo(cur, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'arte.out', clearProps: 'transform' });
    if (!scroll) return;
    lenis.scrollTo(form, { offset: -90, duration: 0.8 });
    cur.querySelector('legend')?.focus?.({ preventScroll: true });
  };
  btnNext.addEventListener('click', () => {
    const err = form.querySelector(`[data-err="${step}"]`);
    if (!valid(step)) { if (err) err.hidden = false; return; }
    if (err) err.hidden = true;
    if (step < 5) return go(step + 1);
    finish();
  });
  btnBack.addEventListener('click', () => step > 1 && go(step - 1));
  tabs.forEach((t) => t.addEventListener('click', () => {
    const k = Number(t.dataset.stepTab);
    if (k < step || [...Array(k - 1)].every((_, i) => valid(i + 1))) go(k);
  }));
  form.addEventListener('change', () => { if (form.callme.checked) time = null; update(); if (step === 3) renderSlots(); });
  form.addEventListener('input', update);
  form.addEventListener('submit', (e) => e.preventDefault());

  // ---- finish + calendar file ----
  const finish = () => {
    form.querySelectorAll('.booking_steps, .step, .booking_nav').forEach((el) => (el.hidden = true));
    const done = form.querySelector('[data-done]');
    done.hidden = false;
    const when = form.callme.checked || !date ? 'We’ll call you to arrange a time.' : `Requested for ${fmtDate(date)} at ${time}.`;
    form.querySelector('[data-done-text]').textContent = `${LABELS.meeting[val('meeting')]} — ${when} This prototype doesn’t send anything yet.`;
    form.querySelector('[data-ics]').hidden = form.callme.checked || !date;
    done.focus();
    lenis.scrollTo(form, { offset: -90, duration: 0.8 });
  };
  form.querySelector('[data-ics]').addEventListener('click', () => {
    if (!date || !time) return;
    const [h, m] = time.split(':').map(Number);
    const start = `${iso(date).replace(/-/g, '')}T${pad(h)}${pad(m)}00`;
    const endMin = h * 60 + m + 60;
    const end = `${iso(date).replace(/-/g, '')}T${pad(Math.floor(endMin / 60))}${pad(endMin % 60)}00`;
    const loc = val('meeting') === 'showroom' ? LABELS.showroom[val('showroom')] : val('meeting') === 'property' ? form.address.value : 'Online';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arte del Lusso//Booking//EN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@artedellusso`, `DTSTART;TZID=Europe/Madrid:${start}`, `DTEND;TZID=Europe/Madrid:${end}`,
      'SUMMARY:Arte del Lusso consultation (requested)', `LOCATION:${loc}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'arte-del-lusso-consultation.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  go(1, { scroll: false });
}
