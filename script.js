'use strict';
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
  main.inert = false; footer.inert = false;
}
menuToggle.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); return; }
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', '메뉴 닫기');
  mobileNav.hidden = false;
  document.body.classList.add('menu-open');
  main.inert = true; footer.inert = true;
  mobileNav.querySelector('a').focus();
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (mobileNav.hidden) return;
  if (event.key === 'Escape') { closeMenu(); menuToggle.focus(); }
  if (event.key === 'Tab') {
    const focusable = [menuToggle, ...mobileNav.querySelectorAll('a,button')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scenes = [...document.querySelectorAll('.hero-scene')];
const motionToggle = document.querySelector('.motion-toggle');
const nextScene = document.querySelector('.scene-next');
const sceneProgress = document.querySelector('.scene-track > span');
let sceneIndex = 0, sceneTimer;
let motionPaused = reducedMotion.matches;
let heroVisible = true;
const sceneDuration = 8000;
function scheduleScene() {
  clearTimeout(sceneTimer);
  if (!motionPaused && !document.hidden && heroVisible) sceneTimer = setTimeout(() => showScene(sceneIndex + 1), sceneDuration);
}
function updateMotion() {
  document.body.classList.toggle('motion-paused', motionPaused || document.hidden || !heroVisible);
  motionToggle.setAttribute('aria-label', motionPaused ? '배경 움직임 재생' : '배경 움직임 일시정지');
  motionToggle.setAttribute('aria-pressed', String(motionPaused));
  motionToggle.querySelector('path').setAttribute('d', motionPaused ? 'm8 5 11 7-11 7Z' : 'M8 5v14M16 5v14');
  scheduleScene();
}
function showScene(index) {
  sceneIndex = (index + scenes.length) % scenes.length;
  scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === sceneIndex));
  document.querySelector('.scene-current').textContent = String(sceneIndex + 1).padStart(2,'0');
  sceneProgress.style.animation = 'none';
  void sceneProgress.offsetWidth;
  sceneProgress.style.animation = '';
  scheduleScene();
}
nextScene.addEventListener('click', () => showScene(sceneIndex + 1));
motionToggle.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
reducedMotion.addEventListener('change', event => { motionPaused = event.matches; updateMotion(); });
document.addEventListener('visibilitychange', updateMotion);
new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; updateMotion(); }, {threshold:0}).observe(hero);
updateMotion();
const floating = document.querySelector('.floating-contact');
let ticking = false;
function updateScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-solid', y > 72);
  const floatingVisible = y > hero.offsetHeight * .8;
  floating.classList.toggle('visible', floatingVisible);
  floating.tabIndex = floatingVisible ? 0 : -1;
  floating.setAttribute('aria-hidden', String(!floatingVisible));
  if (!reducedMotion.matches && y < hero.offsetHeight) document.querySelector('.hero-scenes').style.transform = `translate3d(0,${Math.min(y * .15,140)}px,0)`;
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } }, {passive:true});
window.addEventListener('resize', updateScroll);
updateScroll();
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  });
}, {rootMargin:'-20% 0px -50% 0px'});
document.querySelectorAll('main>section[id]').forEach(section => sectionObserver.observe(section));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, {threshold:.08});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
if (!reducedMotion.matches) document.documentElement.classList.add('js');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el=entry.target, target=Number(el.dataset.count);
    if (!reducedMotion.matches) {
      const start=performance.now();
      function tick(time) { const progress=Math.min((time-start)/1200,1);el.textContent=String(Math.round(target*(1-Math.pow(1-progress,3))));if(progress<1)requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
    }
    counterObserver.unobserve(el);
  });
}, {threshold:.5});
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
const tabs=[...document.querySelectorAll('[role="tab"]')];
function selectServiceTab(index, focus = false) {
  tabs.forEach((tab,i) => {
    const selected=i===index;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
  });
  if(focus)tabs[index].focus();
}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectServiceTab(i));
  tab.addEventListener('keydown',event=>{
    let index;
    if(event.key==='ArrowRight')index=(i+1)%tabs.length;
    if(event.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;
    if(event.key==='Home')index=0;
    if(event.key==='End')index=tabs.length-1;
    if(index!==undefined){event.preventDefault();selectServiceTab(index,true);}
  });
});

const dialog = document.querySelector('#inquiry-dialog');
const form = document.querySelector('#inquiry-form');
const status = document.querySelector('#form-status');
const fallback = document.querySelector('#copy-fallback');
let dialogTrigger;
let sending = false;
let clearStatusOnNextOpen = false;
const submitButton = form.querySelector('[type="submit"]');
const submitLabel = submitButton.querySelector('.submit-label');

document.querySelectorAll('[data-service], [data-inquiry]').forEach(button => {
  button.addEventListener('click', () => {
    dialogTrigger = button;
    if (button.dataset.service && !sending) form.elements.service.value = button.dataset.service;
    if (!sending && clearStatusOnNextOpen) {
      status.textContent = '';
      status.removeAttribute('data-state');
      clearStatusOnNextOpen = false;
    }
    fallback.hidden = true;
    closeMenu();
    document.body.classList.add('dialog-open');
    dialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus();
});

const now = new Date();
const dateInput = form.elements.date;
dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
document.querySelector('#year').textContent = now.getFullYear();

function inquiryText() {
  const values = new FormData(form);
  return [
    '한진개발 현장 인력 공급 문의', '',
    `작업 분야: ${values.get('service')}`,
    `현장 위치: ${values.get('location').trim()}`,
    `투입 희망 날짜: ${values.get('date')}`,
    `필요 인원: ${values.get('count')}명`,
    `담당자 연락처: ${values.get('contact').trim()}`,
    `요청 내용: ${values.get('notes').trim() || '없음'}`,
    '', '공급 가능 여부와 상담 안내를 부탁드립니다.'
  ].join('\n');
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;
  for (const name of ['location', 'contact']) {
    const field = form.elements[name];
    field.value = field.value.trim();
  }
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const payload = {
    from_name: '한진개발 홈페이지 문의',
    subject: `한진개발 현장 인력 문의 | ${values.get('service')}`,
    '작업 분야': values.get('service'),
    '현장 위치': values.get('location'),
    '투입 희망 날짜': values.get('date'),
    '필요 인원': `${values.get('count')}명`,
    '담당자 연락처': values.get('contact'),
    '요청 내용': values.get('notes').trim() || '없음',
    botcheck: Boolean(values.get('botcheck'))
  };
  const controls = [...form.querySelectorAll('input, select, textarea, button')];
  const disabledBefore = controls.map(control => control.disabled);
  sending = true;
  clearStatusOnNextOpen = false;
  form.setAttribute('aria-busy', 'true');
  controls.forEach(control => { control.disabled = true; });
  submitLabel.textContent = '전송 중…';
  status.dataset.state = 'sending';
  status.textContent = '문의 내용을 보내고 있습니다. 잠시만 기다려 주세요.';
  try {
    await HanjinMail.send(form.dataset.accessKey, payload);
    form.reset();
    fallback.hidden = true;
    document.querySelector('#inquiry-preview').value = '';
    status.dataset.state = 'success';
    status.textContent = '문의가 접수되었습니다. 확인 후 안내해 드리겠습니다.';
    clearStatusOnNextOpen = true;
  } catch (error) {
    status.dataset.state = 'error';
    status.textContent = error.message;
  } finally {
    sending = false;
    form.removeAttribute('aria-busy');
    controls.forEach((control, index) => { control.disabled = disabledBefore[index]; });
    submitLabel.textContent = '문의 보내기';
  }
});
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const text = inquiryText();
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = '문의 내용을 복사했습니다. 이메일이나 상담 시 활용해 주세요.';
    fallback.hidden = true;
  } catch {
    fallback.hidden = false;
    const preview = document.querySelector('#inquiry-preview');
    preview.value = text;
    preview.focus();
    preview.select();
    status.textContent = '아래 문의 내용을 선택해 복사해 주세요.';
  }
});
