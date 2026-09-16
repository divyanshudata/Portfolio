document.getElementById('year').textContent = new Date().getFullYear();

// active nav link on scroll
const links = document.querySelectorAll('.nav-link');
const sections = [...links].map(l => document.querySelector(l.getAttribute('href')));

const setActive = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomThreshold = document.documentElement.scrollHeight - 60;

  let idx = 0;

  // When scrolled to or near the bottom of the page, activate the last section (Contact)
  if (scrollPosition >= bottomThreshold) {
    idx = sections.length - 1;
  } else {
    sections.forEach((s, i) => {
      if (s) {
        const top = s.getBoundingClientRect().top;
        if (top <= Math.max(160, window.innerHeight * 0.35)) {
          idx = i;
        }
      }
    });
  }

  links.forEach(l => l.classList.remove('active'));
  if (links[idx]) {
    links[idx].classList.add('active');
  }
};

links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

window.addEventListener('scroll', setActive, { passive: true });
window.addEventListener('resize', setActive);
setActive();

// contact form: direct AJAX submission via FormSubmit with multi-tier fail-safe
async function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('form-status');

  // Honeypot check: if filled, silently exit (blocks bots, protects quota)
  const honey = form.querySelector('input[name="_honey"]')?.value;
  if (honey) {
    return false;
  }

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    return false;
  }

  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending message...';
  statusEl.className = 'form-status';
  statusEl.innerHTML = '';
  statusEl.style.display = 'none';

  // 10-second timeout controller so the button never hangs on bad networks
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://formsubmit.co/ajax/vdivyanshu448@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: `New Portfolio Message from ${name}`,
        _template: 'table',
        _captcha: 'false'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (response.ok) {
      statusEl.className = 'form-status success';
      statusEl.textContent = 'Message sent successfully! I will get back to you soon.';
      statusEl.style.display = 'block';
      form.reset();
    } else {
      throw new Error(data.message || 'Submission rejected by server');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Primary submission issue, activating fallback options:', error);

    // Prepare mailto link with the exact message preserved
    const mailSubject = encodeURIComponent(`Message from ${name} via Portfolio`);
    const mailBody = encodeURIComponent(`${message}\n\n---\nFrom: ${name} (${email})`);
    const mailtoUrl = `mailto:vdivyanshu448@gmail.com?subject=${mailSubject}&body=${mailBody}`;

    statusEl.className = 'form-status error';
    statusEl.innerHTML = `
      <div>Could not reach the server (ad-blocker or network issue).</div>
      <div style="margin-top: 8px;">
        <a href="${mailtoUrl}" target="_blank" rel="noopener">→ Click here to send via Email App</a>
        <span style="opacity: 0.6; margin: 0 6px;">or</span>
        <button type="button" id="retry-post-btn" style="background:none; border:none; color:var(--copper); text-decoration:underline; font-family:inherit; font-size:inherit; cursor:pointer;">submit via Direct Web Route</button>
      </div>
    `;
    statusEl.style.display = 'block';

    const retryBtn = document.getElementById('retry-post-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        // Native browser submit bypasses CORS and fetch restrictions
        form.submit();
      });
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }

  return false;
}


