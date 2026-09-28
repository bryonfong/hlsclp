/* Shared keyboard behavior for the public site navigation. */
(function () {
  'use strict';
  const header = document.querySelector('.site-nav');
  if (!header) return;
  const button = header.querySelector('.nav-burger');
  const links = header.querySelector('nav.links');
  if (!button || !links) return;
  if (!links.id) links.id = 'primary-navigation';
  button.setAttribute('aria-controls', links.id);
  function close(returnFocus) {
    links.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }
  // Page-specific code opens the menu; move focus into it after that handler.
  button.addEventListener('click', () => {
    if (links.classList.contains('open')) links.querySelector('a[href]')?.focus();
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && links.classList.contains('open')) {
      event.preventDefault(); close(true);
    }
  });
  links.addEventListener('click', event => {
    if (event.target.closest('a[href]')) close(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) close(false);
  });
})();
