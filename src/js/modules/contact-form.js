// Contact page: preselect fields from the CTA link (?type, ?interest, ?project, ?visit)
// and show the prototype message instead of sending anything.
const TYPES = ['home', 'rental', 'sale', 'professional'];
const PROJECTS = { 'villa-albinoni': 'Villa Albinoni' };

export function initContactForm(container) {
  const form = container.querySelector('[data-contact-form]');
  if (!form) return;
  const q = new URLSearchParams(location.search);

  const type = q.get('type');
  if (TYPES.includes(type)) form.querySelector(`input[name="type"][value="${type}"]`).checked = true;
  if (q.get('interest') === 'curtains') form.interest.value = 'curtains';
  const project = PROJECTS[q.get('project')];
  if (project) form.message.value = `I’m interested in a solution inspired by ${project}.`;
  if (q.get('visit') === 'online') form.querySelector('input[name="meeting"][value="online"]').checked = true;

  const onSubmit = (e) => {
    e.preventDefault();
    form.classList.add('is-sent');
    form.querySelector('[data-form-success]').focus?.();
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}
