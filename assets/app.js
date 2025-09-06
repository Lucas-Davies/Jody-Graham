// ---------- Helpers / State ----------
const qs = (sel, ctx=document) => ctx.querySelector(sel);
const qsa = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

const isLoggedIn = () => sessionStorage.getItem('AUTH') === '1';
const setLoggedIn = v => sessionStorage.setItem('AUTH', v ? '1' : '0');
const getUser = () => JSON.parse(localStorage.getItem('USER') || '{}');
const setUser = u => localStorage.setItem('USER', JSON.stringify(u));

// SVG icon helper
function svg(pathD){
  const s = document.createElementNS('http://www.w3.org/2000/svg','svg');
  s.setAttribute('viewBox','0 0 24 24'); s.classList.add('icon');
  const p = document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d', pathD); s.appendChild(p); return s;
}

// ---------- Build Left Ribbon ----------
function buildLeftNav(){
  const left = qs('#nav-left');
  left.innerHTML = '';
  const items = ['Home','Courses','Classes','Online Content','Prices'];
  items.forEach((label, idx)=>{
    const it = document.createElement('div'); it.className='nav-item';
    const a = document.createElement('a');
    a.href='#'; a.className='link' + (idx===0?' active':''); a.textContent = label;
    it.appendChild(a);
    const sm = document.createElement('div'); sm.className='submenu';
    sm.innerHTML = `
      <a href="#">Placeholder 1</a>
      <a href="#">Placeholder 2</a>
      <a href="#">Placeholder 3</a>`;
    it.appendChild(sm);
    left.appendChild(it);

    a.addEventListener('click',(e)=>{
      e.preventDefault();
      const open = it.classList.contains('open');
      qsa('.nav-item').forEach(n=>n.classList.remove('open'));
      it.classList.toggle('open', !open);
    });
  });

  document.addEventListener('click', e=>{
    if(!e.target.closest('.nav-item')) qsa('.nav-item').forEach(n=>n.classList.remove('open'));
  });
}

// ---------- Build Right Ribbon ----------
function buildRightNav(){
  const right = qs('#nav-right');
  right.innerHTML = '';

  if(!isLoggedIn()){
    const login = Object.assign(document.createElement('a'), {className:'pill green', textContent:'Login'});
    const signup= Object.assign(document.createElement('a'), {className:'pill blue',  textContent:'Sign up'});
    login.onclick = () => openModal('login-modal');
    signup.onclick= () => openModal('signup-modal');
    right.append(login, signup);
    return;
  }

  // Notifications
  const bell = Object.assign(document.createElement('button'),{className:'iconbtn',title:'Notifications'});
  bell.appendChild(svg('M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z'));
  bell.onclick = () => alert('Notifications placeholder');

  // Next Class
  const next = Object.assign(document.createElement('button'),{className:'iconbtn',title:'Next class'});
  next.appendChild(svg('M8 7V3h8v4m5 4H3m2 10h14a2 2 0 0 0 2-2V7H3v12a2 2 0 0 0 2 2z'));
  next.onclick = () => openClass();

  // Avatar chip + popover
  const wrap = Object.assign(document.createElement('div'),{style:'position:relative'});
  const chip = Object.assign(document.createElement('button'),{className:'chip',type:'button'});
  const av = Object.assign(document.createElement('div'),{className:'avatar'});
  const u = getUser();
  if(u.avatar){ const img=new Image(); img.src=u.avatar; av.appendChild(img); }
  else { av.textContent=(u.name?.[0]||'?').toUpperCase(); }
  const nm = Object.assign(document.createElement('span'),{className:'name',textContent:u.name||'Profile'});
  chip.append(av,nm);

  const pop = Object.assign(document.createElement('div'),{className:'account-pop'});
  pop.innerHTML = `
    <div class="item" data-act="profile">Profile</div>
    <div class="item" data-act="subscription">Subscription <span class="hint">${u.subLevel||'Free'}</span></div>
    <div class="item" data-act="training">Enrolled training</div>
    <div class="item red" data-act="logout">Log out</div>`;
  wrap.append(chip,pop);

  chip.onclick = (e)=>{ e.stopPropagation(); pop.classList.toggle('open'); };
  document.addEventListener('click', e=>{
    if(!e.target.closest('.account-pop') && !e.target.closest('.chip')) pop.classList.remove('open');
  });
  pop.onclick = (e)=>{
    const act=e.target.closest('.item')?.dataset.act; if(!act) return; pop.classList.remove('open');
    if(act==='profile') openProfile();
    if(act==='subscription') openSub();
    if(act==='training') alert('Training placeholder');
    if(act==='logout') openModal('logout-modal');
  };

  right.append(bell,next,wrap);
}

// ---------- Modal helpers ----------
function openModal(id){ const el=qs('#'+id); el.classList.add('open'); el.setAttribute('aria-hidden','false'); }
function closeModal(id){ const el=qs('#'+id); el.classList.remove('open'); el.setAttribute('aria-hidden','true'); }
function closeAll(){ ['login-modal','signup-modal','profile-modal','logout-modal'].forEach(closeModal); }
qsa('.backdrop .veil').forEach(v=> v.addEventListener('click', closeAll));
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeAll(); closeClass(); }});

// show/hide password
qsa('.showpass').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-for');
    const input = qs('#'+id);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// ---------- Auth click-through ----------
qs('#li-submit').onclick=()=>{
  setLoggedIn(true);
  const email = qs('#li-user').value || 'user@example.com';
  const name = email.split('@')[0];
  const u = getUser();
  setUser({ ...u, name: u.name || name.charAt(0).toUpperCase()+name.slice(1), email, subLevel: u.subLevel || 'Free' });
  closeModal('login-modal'); buildRightNav();
};
qs('#li-cancel').onclick=()=> closeModal('login-modal');

qs('#su-submit').onclick=()=>{
  const first=qs('#su-first').value||'New';
  const last =qs('#su-last').value ||'User';
  const email=qs('#su-email').value||'user@example.com';
  setLoggedIn(true); setUser({name:`${first} ${last}`.trim(), email, subLevel:'Free'});
  closeModal('signup-modal'); buildRightNav();
};
qs('#su-cancel').onclick=()=> closeModal('signup-modal');

qs('#lo-yes').onclick=()=>{ setLoggedIn(false); setUser({}); closeModal('logout-modal'); buildRightNav(); };
qs('#lo-no').onclick =()=> closeModal('logout-modal');

// ---------- Profile ----------
function openProfile(){
  const u=getUser();
  qs('#pr-name').value  = u.name  || '';
  qs('#pr-email').value = u.email || '';
  openModal('profile-modal');
}
qs('#pr-save').onclick=()=>{
  const u=getUser();
  u.name  = qs('#pr-name').value || u.name || 'User';
  u.email = qs('#pr-email').value || u.email || '';
  setUser(u); closeModal('profile-modal'); buildRightNav();
};
qs('#pr-cancel').onclick=()=> closeModal('profile-modal');
qs('#avatar-upload').addEventListener('change', e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=ev=>{ const u=getUser(); u.avatar=ev.target.result; setUser(u); buildRightNav(); };
  r.readAsDataURL(f);
});

// ---------- Next Class (card + mini-player) ----------
const classWrap = qs('#class-wrap');
const hero      = qs('#class-video');
const pip       = qs('#pip');
const pipVid    = qs('#pip-video');

qs('#class-close').onclick = ()=> closeClass();
qs('#to-full').onclick     = ()=> hero.requestFullscreen?.();
qs('#to-pip').onclick      = ()=> openPip();
qs('#pip-close').onclick   = ()=> pip.style.display='none';
qs('#pip-back').onclick    = ()=>{ pip.style.display='none'; classWrap.classList.add('open'); };

function openClass(){ classWrap.classList.add('open'); }
function closeClass(){ classWrap.classList.remove('open'); }
function openPip(){ pipVid.src=''; pipVid.removeAttribute('src'); pip.style.display='block'; classWrap.classList.remove('open'); }
// Draggable PiP
(function(){
  const handle=qs('#pip-drag');
  let ox=0, oy=0, drag=false;
  handle.addEventListener('mousedown',e=>{ drag=true; ox=e.clientX-pip.offsetLeft; oy=e.clientY-pip.offsetTop; e.preventDefault();});
  window.addEventListener('mousemove',e=>{ if(!drag) return; pip.style.left=(e.clientX-ox)+'px'; pip.style.top=(e.clientY-oy)+'px'; pip.style.right='auto'; pip.style.bottom='auto';});
  window.addEventListener('mouseup',()=> drag=false);
})();

// Enrolled avatars (demo data)
(function renderPeople(){
  const stack=qs('#enrolled-stack'); const list=qs('#people-list');
  const people=['Alex','Ben','Casey','Dana','Eli','Fran','Gus'];
  stack.innerHTML=''; list.innerHTML='';
  people.forEach(n=>{
    const a=document.createElement('div'); a.className='avatar'; a.textContent=n[0]; stack.appendChild(a);
    const row=document.createElement('div'); row.style.padding='6px 0'; row.textContent=n; list.appendChild(row);
  });
  qs('#see-people').onclick=()=> list.classList.toggle('open');
})();

// ---------- Init after DOM is ready ----------
document.addEventListener('DOMContentLoaded', ()=>{
  buildLeftNav();
  buildRightNav();
});
