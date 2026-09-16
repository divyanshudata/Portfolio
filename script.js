document.getElementById('year').textContent = new Date().getFullYear();

// active nav link on scroll
const links = document.querySelectorAll('.nav-link');
const sections = [...links].map(l => document.querySelector(l.getAttribute('href')));
const setActive = () => {
  let idx = 0;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= 140) idx = i; });
  links.forEach(l => l.classList.remove('active'));
  links[idx].classList.add('active');
};
window.addEventListener('scroll', setActive);
setActive();

// contact form: replace with your own backend / form service (e.g. Formspree)
function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  window.location.href = `mailto:you@example.com?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message + '\n\nFrom: ' + email)}`;
  return false;
}
