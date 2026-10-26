// R1-N: navigation presentation only. No domain actions or persistent storage.
const compact = matchMedia('(width < 1024px)');
const workspaceKey = hash => {
  const [area, id] = hash.replace(/^#/, '').split('/');
  return ['applications', 'tracker'].includes(area) && id?.startsWith('APP-') ? `${area}/${id}` : area || 'evidence';
};
let currentKey, drawer, trigger, globalNav, localNav, globalHome, localHome, previousOverflow;
let pendingDestination = false;
let backgroundState = [], savedScroll = {x:0,y:0}, previousPadding;
const views = new Map();

function remember() {
  const main = document.querySelector('main');
  if (!main) return;
  views.set(currentKey, {
    fields: [...main.querySelectorAll('input:not([type=file]),textarea,select')].map((el, i) => ({
      i, id: el.id, name: el.name, value: el.value, checked: el.checked
    })),
    disclosures: [...main.querySelectorAll('details')].map(el => ({label: el.querySelector('summary')?.textContent, open: el.open}))
  });
}
function restoreView() {
  const saved = views.get(currentKey);
  if (!saved) return;
  views.delete(currentKey);
  const main = document.querySelector('main');
  const fields = [...main.querySelectorAll('input:not([type=file]),textarea,select')];
  for (const field of saved.fields) {
    const el = fields[field.i];
    if (el && el.id === field.id && el.name === field.name) {
      el.value = field.value;
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = field.checked;
    }
  }
  for (const el of main.querySelectorAll('details')) {
    const state = saved.disclosures.find(d => d.label === el.querySelector('summary')?.textContent);
    if (state) el.open = state.open;
  }
}
function measureHeader() {
  const height = document.querySelector('#app > header')?.getBoundingClientRect().height || 96;
  document.documentElement.style.setProperty('--navigation-header-height', `${height}px`);
}
function targetForHash() {
  const parts = location.hash.slice(1).split('/');
  const section = ['applications', 'tracker'].includes(parts[0]) ? parts[2] || parts[1] : parts[1];
  const container = document.getElementById(section);
  return section && section !== 'overview' && container
    ? container.querySelector('h1,h2,h3') || container
    : document.querySelector('main .hero h1') || document.querySelector('main');
}
function arrive() {
  measureHeader();
  const target = targetForHash();
  if (!target) return;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.scrollIntoView({block: 'start', behavior: 'instant'});
  target.focus({preventScroll: true});
}
function closeDrawer(reason = 'dismiss') {
  if (!drawer?.open) return;
  // Suppress native opener restoration; restore deliberately after cleanup to
  // preserve scroll on dismissal and destination focus on navigation/resize.
  trigger.disabled = true;
  drawer.close();
  document.body.style.overflow = previousOverflow;
  document.body.style.paddingRight = previousPadding;
  for (const [el, inert] of backgroundState) el.inert = inert;
  backgroundState = [];
  if (reason === 'dismiss') window.scrollTo({left:savedScroll.x,top:savedScroll.y,behavior:'instant'});
  trigger.disabled = false;
  trigger.setAttribute('aria-expanded', 'false');
  if (reason === 'dismiss') {
    trigger.focus({preventScroll: true});
    const position = {...savedScroll}, route = location.hash;
    requestAnimationFrame(() => {if (!drawer.open && location.hash === route) window.scrollTo({left:position.x,top:position.y,behavior:'instant'});});
  }
}
function openDrawer() {
  if (!compact.matches || drawer.open) return;
  previousOverflow = document.body.style.overflow;
  previousPadding = document.body.style.paddingRight;
  savedScroll = {x:window.scrollX,y:window.scrollY};
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = gutter + 'px';
  backgroundState = [...document.querySelectorAll('#app > header,#app > .layout,.skip')].map(el => [el,el.inert]);
  for (const [el] of backgroundState) el.inert = true;
  drawer.showModal();
  document.body.style.overflow = 'hidden';
  trigger.setAttribute('aria-expanded', 'true');
  drawer.querySelector('[data-navigation-close]').focus({preventScroll: true});
}
function placeNavigation() {
  const wasOpen = drawer?.open;
  const focusedNavigation = drawer?.contains(document.activeElement) || document.activeElement === trigger;
  if (!compact.matches && wasOpen) closeDrawer('resize');
  if (compact.matches) {
    drawer.querySelector('[data-global-group]').append(globalNav);
    drawer.querySelector('[data-local-group]').append(localNav);
  } else {
    globalHome.after(globalNav);
    localHome.after(localNav);
  }
  measureHeader();
  if (!compact.matches && (wasOpen || focusedNavigation)) arrive();
  else if (compact.matches && (globalNav.contains(document.activeElement) || localNav.contains(document.activeElement))) trigger.focus({preventScroll:true});
  else if (document.activeElement?.matches('main h1, main h2, main h3') && document.activeElement.getBoundingClientRect().top < document.querySelector('header').getBoundingClientRect().bottom + 12) arrive();
}
function activate(event) {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!globalNav.contains(link) && !localNav.contains(link)) return;
  remember();
  pendingDestination = true;
  closeDrawer('navigation');
  if (link.hash === location.hash) {
    views.delete(currentKey);
    event.preventDefault();
    pendingDestination = false;
    arrive();
  }
}

export const navigationShell = {
  mount() {
    if (drawer?.open) closeDrawer('navigation');
    currentKey = workspaceKey(location.hash);
    if (document.querySelector('header .identity')?.textContent === 'Your workspace') views.clear();
    globalNav = document.querySelector('header nav');
    localNav = document.querySelector('aside nav');
    globalHome = document.createComment('desktop global navigation');
    localHome = document.createComment('desktop contextual navigation');
    globalNav.before(globalHome);
    localNav.before(localHome);
    trigger = document.createElement('button');
    trigger.className = 'navigation-toggle';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Open navigation');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'unified-navigation');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    document.querySelector('#app > header').append(trigger);
    drawer = document.createElement('dialog');
    drawer.id = 'unified-navigation';
    drawer.className = 'navigation-drawer';
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'navigation-title');
    drawer.innerHTML = '<div class="navigation-drawer-header"><h2 id="navigation-title">Navigation</h2><button type="button" data-navigation-close aria-label="Close navigation">Close</button></div><section data-global-group aria-labelledby="navigation-global-title"><h3 id="navigation-global-title">Global navigation</h3></section><hr><section data-local-group aria-labelledby="navigation-context-title"><h3 id="navigation-context-title">Contextual navigation</h3><p class="navigation-context-name"></p><p class="navigation-context-identity"></p></section>';
    drawer.querySelector('.navigation-context-name').textContent = document.querySelector('aside .overline').textContent;
    const kicker = document.querySelector('main .hero .overline')?.textContent || '';
    const heading = document.querySelector('main .hero h1')?.textContent || '';
    drawer.querySelector('.navigation-context-identity').textContent = kicker.startsWith('Application ·') ? `${heading} · ${kicker}` : currentKey === 'vacancies' && document.querySelector('#vacancy h2') ? `${document.querySelector('#vacancy h2').textContent} · ${document.querySelector('#vacancy .overline').textContent}` : '';
    document.querySelector('#app').append(drawer);
    trigger.onclick = openDrawer;
    drawer.querySelector('[data-navigation-close]').onclick = () => closeDrawer();
    drawer.addEventListener('cancel', event => {event.preventDefault(); closeDrawer();});
    drawer.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const items = [...drawer.querySelectorAll('button,a[href]')].filter(el => !el.disabled);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    });
    globalNav.addEventListener('click', activate);
    localNav.addEventListener('click', activate);
    restoreView();
    placeNavigation();
    if (pendingDestination) {pendingDestination = false; arrive();}
  },
  sectionChange() {
    if (workspaceKey(location.hash) !== currentKey) return false;
    views.delete(currentKey);
    const selected = location.hash.split('/').at(-1);
    for (const link of localNav.querySelectorAll('a')) {
      if (link.hash.split('/').at(-1) === selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    // Existing same-workspace consequences are scrolling and route selection.
    // Keep the live DOM so disclosures, pending form input and file controls survive.
    if (pendingDestination) {pendingDestination = false; arrive();}
    else {measureHeader(); const target=targetForHash(); target?.scrollIntoView({block:'start',behavior:'instant'});}
    return true;
  }
};
compact.addEventListener('change', () => {if (drawer?.isConnected) placeNavigation();});
window.addEventListener('resize', () => {
  measureHeader();
  const focused = document.activeElement;
  if (focused?.matches('main h1, main h2, main h3') && focused.getBoundingClientRect().top < document.querySelector('header').getBoundingClientRect().bottom + 12) focused.scrollIntoView({block:'start',behavior:'instant'});
});
