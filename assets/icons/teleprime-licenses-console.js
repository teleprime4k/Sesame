import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBs4p7kaG0d6GMuMRiThl1W7_ZTncLCBCo',
  authDomain: 'sesameouvretoi-13.firebaseapp.com',
  projectId: 'sesameouvretoi-13',
  storageBucket: 'sesameouvretoi-13.firebasestorage.app',
  messagingSenderId: '167364948430',
  appId: '1:167364948430:web:e1874c21b6d39fd412bb9f',
  measurementId: 'G-VRWJPSC723'
};

const DEFAULT_API = 'https://teleprime4k-licences-api.teleprime4k.workers.dev';
const LS_API_KEY = 'teleprime4kLicenseApiBase';
let cachedLicenses = [];
let injecting = false;

function firebaseAuth() {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  return getAuth(app);
}

function apiBase() {
  return String(localStorage.getItem(LS_API_KEY) || window.TELEPRIME_LICENSE_API || DEFAULT_API).replace(/\/+$/, '');
}

async function adminToken() {
  const user = firebaseAuth().currentUser;
  if (!user || window.appState?.isAdmin !== true) throw new Error('Session administrateur requise.');
  return user.getIdToken(true);
}

async function api(path, options = {}) {
  const token = await adminToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = payload?.error || payload?.message || `HTTP ${response.status}`;
    throw new Error(code);
  }
  return payload;
}

const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const labelPlan = plan => ({'1y':'1 an','2y':'2 ans','3y':'3 ans','4y':'4 ans','5y':'5 ans','lifetime':'À vie ♾️'}[plan] || plan || '—');
const labelStatus = status => ({pending:'Non activée',active:'Active',expired:'Expirée',suspended:'Suspendue',revoked:'Révoquée'}[status] || status || '—');
const statusClass = status => ({pending:'tp-st-unused',active:'tp-st-active',expired:'tp-st-expired',suspended:'tp-st-suspended',revoked:'tp-st-revoked'}[status] || 'tp-st-unused');
const fmt = iso => iso ? new Date(iso).toLocaleString('fr-FR') : '—';

function showToast(message, type = 'success') {
  if (window.showToast) window.showToast(message, type);
  else alert(message);
}

function styles() {
  if (document.getElementById('teleprime-license-console-styles')) return;
  const s = document.createElement('style');
  s.id = 'teleprime-license-console-styles';
  s.textContent = `
  #admin-teleprime-licenses{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;color:#cbd5e1;background:#07111f;border:1px solid #1d334c;border-radius:16px;padding:20px;display:grid;gap:16px}
  .tp-lic-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid #1e293b}.tp-lic-head h3{margin:0;color:#fff;font-size:18px;font-weight:900}.tp-lic-head p{margin:4px 0 0;color:#64748b;font-size:11px}.tp-lic-btn{min-height:40px;border-radius:10px;border:1px solid #27435e;background:#0a1a2d;color:#e2e8f0;padding:0 14px;font-size:11px;font-weight:800;cursor:pointer}.tp-lic-btn:hover{border-color:#22d3ee}.tp-lic-btn.primary{background:#0891b2;border-color:#06b6d4;color:white}.tp-lic-btn.danger{border-color:#7f1d1d;color:#fecaca;background:#2b1016}.tp-lic-btn.warn{border-color:#78350f;color:#fde68a;background:#2a1b08}.tp-lic-btn.ok{border-color:#14532d;color:#bbf7d0;background:#08291c}.tp-lic-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.tp-lic-kpi{background:#0b182a;border:1px solid #1d3249;border-radius:13px;padding:14px}.tp-lic-kpi small{display:block;color:#71839c;font-size:9px;text-transform:uppercase}.tp-lic-kpi strong{display:block;color:#fff;font-size:24px;margin-top:6px}.tp-lic-panel{background:#0a1627;border:1px solid #1d3047;border-radius:14px;padding:15px}.tp-lic-form{display:grid;grid-template-columns:1fr 1fr 1.4fr auto;gap:10px}.tp-lic-field label{display:block;color:#71839c;font-size:9px;text-transform:uppercase;margin-bottom:5px}.tp-lic-input,.tp-lic-select{width:100%;height:42px;box-sizing:border-box;border-radius:9px;border:1px solid #26384f;background:#050d19;color:#fff;padding:0 10px;outline:none}.tp-lic-input:focus,.tp-lic-select:focus{border-color:#22d3ee}.tp-lic-toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.tp-lic-toolbar .tp-lic-input{max-width:320px}.tp-lic-table-wrap{overflow:auto;border:1px solid #1d3047;border-radius:12px}.tp-lic-table{width:100%;border-collapse:collapse;min-width:1050px;background:#07111f}.tp-lic-table th{position:sticky;top:0;background:#0c1a2d;color:#7890ad;text-align:left;font-size:9px;text-transform:uppercase;padding:10px;border-bottom:1px solid #24374e}.tp-lic-table td{padding:10px;border-bottom:1px solid #17283c;font-size:10px;vertical-align:top}.tp-lic-key{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#67e8f9;font-weight:800;letter-spacing:.03em}.tp-lic-status{display:inline-block;padding:4px 8px;border-radius:999px;font-size:8px;font-weight:900;border:1px solid currentColor}.tp-st-active{color:#4ade80}.tp-st-unused{color:#94a3b8}.tp-st-expired{color:#fb923c}.tp-st-suspended{color:#facc15}.tp-st-revoked{color:#f87171}.tp-lic-actions{display:flex;flex-wrap:wrap;gap:5px}.tp-lic-actions button{min-height:30px;padding:0 8px;font-size:8px}.tp-lic-api-warning{padding:11px;border:1px solid #92400e;background:#2a1909;color:#fde68a;border-radius:10px;font-size:10px;line-height:1.5}.tp-lic-empty{text-align:center;padding:28px;color:#64748b}.tp-lic-device{max-width:140px;word-break:break-all;color:#94a3b8}.tp-lic-owner{max-width:180px}.tp-lic-copy{background:none;border:0;color:#22d3ee;cursor:pointer;font-size:9px;padding:2px 0}.tp-lic-modal{position:fixed;inset:0;z-index:140;background:rgba(2,6,23,.9);display:flex;align-items:center;justify-content:center;padding:16px}.tp-lic-modal-card{width:min(520px,100%);background:#0b1628;border:1px solid #334155;border-radius:16px;padding:18px;box-shadow:0 20px 70px rgba(0,0,0,.55)}
  @media(max-width:900px){.tp-lic-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tp-lic-form{grid-template-columns:1fr 1fr}.tp-lic-form .tp-lic-create{grid-column:1/-1}.tp-lic-head{align-items:flex-start;flex-direction:column}}
  @media(max-width:600px){#admin-teleprime-licenses{padding:12px}.tp-lic-grid{display:flex;overflow-x:auto}.tp-lic-kpi{min-width:130px}.tp-lic-form{grid-template-columns:1fr}.tp-lic-form .tp-lic-create{grid-column:auto}.tp-lic-toolbar .tp-lic-input{max-width:none;flex:1 1 100%}.tp-lic-head h3{font-size:15px}}
  `;
  document.head.appendChild(s);
}

function createSection() {
  const section = document.createElement('section');
  section.id = 'admin-teleprime-licenses';
  section.className = 'mobile-anchor';
  section.innerHTML = `
    <div class="tp-lic-head">
      <div><h3>🔐 Console Propriétaire Télé Prime4K</h3><p>Licences application · 1 licence = 1 appareil · clients Sésame et utilisateurs externes.</p></div>
      <div class="tp-lic-toolbar"><button class="tp-lic-btn" data-tp-action="settings">Configurer l’API</button><button class="tp-lic-btn primary" data-tp-action="refresh">Actualiser</button></div>
    </div>
    <div id="tp-lic-api-warning" class="tp-lic-api-warning"></div>
    <div class="tp-lic-grid">
      <div class="tp-lic-kpi"><small>Total</small><strong id="tp-kpi-total">0</strong></div>
      <div class="tp-lic-kpi"><small>Actives</small><strong id="tp-kpi-active">0</strong></div>
      <div class="tp-lic-kpi"><small>Non activées</small><strong id="tp-kpi-unused">0</strong></div>
      <div class="tp-lic-kpi"><small>Expirées</small><strong id="tp-kpi-expired">0</strong></div>
      <div class="tp-lic-kpi"><small>À vie</small><strong id="tp-kpi-life">0</strong></div>
    </div>
    <div class="tp-lic-panel">
      <div style="color:#fff;font-weight:900;font-size:12px;margin-bottom:12px">Créer une licence</div>
      <form id="tp-license-create-form" class="tp-lic-form">
        <div class="tp-lic-field"><label>Durée</label><select id="tp-plan" class="tp-lic-select"><option value="1y">1 an</option><option value="2y">2 ans</option><option value="3y">3 ans</option><option value="4y">4 ans</option><option value="5y">5 ans</option><option value="lifetime">À vie ♾️</option></select></div>
        <div class="tp-lic-field"><label>Type</label><select id="tp-owner-type" class="tp-lic-select"><option value="client">Client Sésame</option><option value="external">Utilisateur externe</option></select></div>
        <div class="tp-lic-field"><label>Nom / référence</label><input id="tp-owner-label" maxlength="120" class="tp-lic-input" placeholder="Nom, prénom ou e-mail" required></div>
        <button class="tp-lic-btn primary tp-lic-create" type="submit">+ Créer la licence</button>
      </form>
    </div>
    <div class="tp-lic-panel">
      <div class="tp-lic-toolbar" style="margin-bottom:11px"><input id="tp-license-search" class="tp-lic-input" type="search" placeholder="Rechercher clé, titulaire, appareil…"><select id="tp-status-filter" class="tp-lic-select" style="width:auto"><option value="">Tous les états</option><option value="pending">Non activées</option><option value="active">Actives</option><option value="expired">Expirées</option><option value="suspended">Suspendues</option><option value="revoked">Révoquées</option></select></div>
      <div id="tp-license-table"></div>
    </div>`;
  return section;
}

function attachSection() {
  if (document.getElementById('admin-teleprime-licenses')) return;
  const host = document.getElementById('admin-console')?.parentElement || document.getElementById('dashboard-top') || document.getElementById('root');
  if (!host) return;
  const section = createSection();
  host.appendChild(section);
  wireSection(section);
}

function addNavigation() {
  if (document.querySelector('[data-teleprime-license-nav]')) return;
  const groups = [...document.querySelectorAll('.admin-nav-group')];
  const targetGroup = groups[groups.length - 1] || document.querySelector('.admin-sidebar');
  if (targetGroup) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'admin-nav-link'; btn.dataset.teleprimeLicenseNav = '1';
    btn.innerHTML = '<i data-lucide="key-round"></i><span>Licences Télé Prime4K</span>';
    btn.onclick = () => openConsole();
    targetGroup.appendChild(btn);
  }
  const mobile = document.querySelector('.mobile-admin-tools-hub');
  if (mobile && !mobile.querySelector('[data-teleprime-license-mobile]')) {
    const btn = document.createElement('button'); btn.type='button'; btn.dataset.teleprimeLicenseMobile='1';
    btn.innerHTML='<i data-lucide="key-round"></i><span>Licences Télé Prime4K</span>'; btn.onclick=()=>openConsole(); mobile.appendChild(btn);
  }
  if (window.lucide?.createIcons) window.lucide.createIcons({root: document});
}

function openConsole() {
  attachSection();
  const section = document.getElementById('admin-teleprime-licenses');
  if (!section) return;
  if (typeof window.mobileGoTo === 'function') window.mobileGoTo('admin-teleprime-licenses');
  setTimeout(() => {
    const title = document.getElementById('admin-workspace-title');
    if (title && document.getElementById('admin-workspace-body')?.contains(section)) title.textContent = 'Licences Télé Prime4K';
    section.scrollIntoView({behavior:'smooth', block:'start'});
    refreshLicenses();
  }, 60);
}

function wireSection(section) {
  section.querySelector('[data-tp-action="refresh"]')?.addEventListener('click', refreshLicenses);
  section.querySelector('[data-tp-action="settings"]')?.addEventListener('click', openSettings);
  section.querySelector('#tp-license-search')?.addEventListener('input', renderTable);
  section.querySelector('#tp-status-filter')?.addEventListener('change', renderTable);
  section.querySelector('#tp-license-create-form')?.addEventListener('submit', createLicense);
  updateApiWarning();
  refreshLicenses();
}

function updateApiWarning() {
  const el = document.getElementById('tp-lic-api-warning'); if (!el) return;
  const base = apiBase();
  const bad = !/^https:\/\//i.test(base);
  el.style.display = 'block';
  el.style.borderColor = bad ? '#92400e' : '#14532d';
  el.style.background = bad ? '#2a1909' : '#08291c';
  el.style.color = bad ? '#fde68a' : '#bbf7d0';
  el.innerHTML = bad ? '<b>Configuration requise :</b> renseignez une adresse HTTPS valide pour le Worker de licences.' : '<b>API connectée :</b> teleprime4k-licences-api · authentification Admin Firebase requise.';
}

async function createLicense(ev) {
  ev.preventDefault();
  try {
    const plan = document.getElementById('tp-plan').value;
    const ownerType = document.getElementById('tp-owner-type').value;
    const ownerLabel = document.getElementById('tp-owner-label').value.trim();
    if (!ownerLabel) return showToast('Indiquez le titulaire de la licence.', 'error');
    const emailGuess = ownerLabel.includes('@') ? ownerLabel : '';
    const result = await api('/api/v1/admin/licenses/create', {method:'POST', body:JSON.stringify({license_type:plan, holder_type:ownerType, holder_name:emailGuess ? '' : ownerLabel, holder_email:emailGuess})});
    document.getElementById('tp-owner-label').value = '';
    const createdKey = result?.license?.license_key || '';
    showToast(`Licence créée : ${createdKey}`);
    await refreshLicenses();
    if (createdKey) await navigator.clipboard?.writeText(createdKey).catch(()=>{});
  } catch (err) { showToast(`Création impossible : ${err.message}`, 'error'); }
}

async function refreshLicenses() {
  const table = document.getElementById('tp-license-table');
  if (!table) return;
  table.innerHTML = '<div class="tp-lic-empty">Chargement des licences…</div>';
  try {
    const result = await api('/api/v1/admin/licenses');
    cachedLicenses = Array.isArray(result.licenses) ? result.licenses : [];
    renderStats(); renderTable();
  } catch (err) {
    table.innerHTML = `<div class="tp-lic-empty">Impossible de charger les licences : ${e(err.message)}</div>`;
  }
}

function renderStats() {
  const q = s => document.getElementById(s);
  q('tp-kpi-total') && (q('tp-kpi-total').textContent = cachedLicenses.length);
  q('tp-kpi-active') && (q('tp-kpi-active').textContent = cachedLicenses.filter(x=>x.status==='active').length);
  q('tp-kpi-unused') && (q('tp-kpi-unused').textContent = cachedLicenses.filter(x=>x.status==='pending').length);
  q('tp-kpi-expired') && (q('tp-kpi-expired').textContent = cachedLicenses.filter(x=>x.status==='expired').length);
  q('tp-kpi-life') && (q('tp-kpi-life').textContent = cachedLicenses.filter(x=>x.license_type==='lifetime').length);
}

function renderTable() {
  const host = document.getElementById('tp-license-table'); if (!host) return;
  const search = String(document.getElementById('tp-license-search')?.value || '').trim().toLowerCase();
  const status = String(document.getElementById('tp-status-filter')?.value || '');
  const rows = cachedLicenses.filter(x => (!status || x.status===status) && (!search || `${x.license_key} ${x.holder_name||''} ${x.holder_email||''} ${x.holder_type||''} ${x.device_name||''} ${x.device_hash||''}`.toLowerCase().includes(search)));
  if (!rows.length) { host.innerHTML='<div class="tp-lic-empty">Aucune licence trouvée.</div>'; return; }
  host.innerHTML = `<div class="tp-lic-table-wrap"><table class="tp-lic-table"><thead><tr><th>Clé</th><th>Titulaire</th><th>Durée</th><th>État</th><th>Appareil</th><th>Activation / expiration</th><th>Actions propriétaire</th></tr></thead><tbody>${rows.map(x=>`<tr>
    <td><div class="tp-lic-key">${e(x.license_key)}</div><button class="tp-lic-copy" data-copy="${e(x.license_key)}">Copier la clé</button></td>
    <td class="tp-lic-owner"><b style="color:#fff">${e(x.holder_name||x.holder_email||'Sans titulaire')}</b><br><span style="color:#64748b">${x.holder_type==='client'?'Client Sésame':'Utilisateur externe'}</span></td>
    <td>${e(labelPlan(x.license_type))}</td>
    <td><span class="tp-lic-status ${statusClass(x.status)}">${e(labelStatus(x.status))}</span></td>
    <td class="tp-lic-device">${x.device_hash ? `${e(x.device_name||'Appareil associé')}<br><small>${e(String(x.device_hash).slice(0,16))}…</small>` : 'Non associé'}</td>
    <td><small>Activée : ${e(fmt(x.activated_at))}<br>Expire : ${x.license_type==='lifetime'?'Jamais':e(fmt(x.expires_at))}<br>Dernier contrôle : ${e(fmt(x.last_validation_at))}</small></td>
    <td><div class="tp-lic-actions">
      ${x.status!=='suspended'&&x.status!=='revoked'?`<button class="tp-lic-btn warn" data-action="suspend" data-key="${e(x.license_key)}">Suspendre</button>`:''}
      ${x.status==='suspended'?`<button class="tp-lic-btn ok" data-action="reactivate" data-key="${e(x.license_key)}">Réactiver</button>`:''}
      ${x.status!=='revoked'?`<button class="tp-lic-btn danger" data-action="revoke" data-key="${e(x.license_key)}">Révoquer</button>`:''}
      ${x.device_hash?`<button class="tp-lic-btn" data-action="reset-device" data-key="${e(x.license_key)}">Réinitialiser appareil</button>`:''}
      ${x.license_type!=='lifetime'?`<button class="tp-lic-btn" data-action="extend" data-key="${e(x.license_key)}">Prolonger</button>`:''}
      <button class="tp-lic-btn" data-action="events" data-key="${e(x.license_key)}">Historique</button>
    </div></td>
  </tr>`).join('')}</tbody></table></div>`;
  host.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',()=>copyKey(btn.dataset.copy)));
  host.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn.dataset.action,btn.dataset.key)));
}

async function copyKey(key) {
  try { await navigator.clipboard.writeText(key); showToast('Clé copiée.'); }
  catch { window.prompt('Copiez la clé :', key); }
}

async function handleAction(action, key) {
  if (action === 'extend') return openExtend(key);
  if (action === 'events') return openEvents(key);
  const messages = {suspend:'Suspendre cette licence ?',reactivate:'Réactiver cette licence ?',revoke:'Révoquer définitivement cette licence ?',"reset-device":'Libérer l’appareil actuel ? La durée restante de la licence sera conservée.'};
  if (!confirm(messages[action] || 'Confirmer cette action ?')) return;
  try {
    await api('/api/v1/admin/licenses/action',{method:'POST',body:JSON.stringify({license_key:key,action})});
    showToast('Licence mise à jour.'); await refreshLicenses();
  } catch(err){ showToast(`Action impossible : ${err.message}`,'error'); }
}

function modal(html) {
  document.getElementById('tp-license-modal')?.remove();
  const m=document.createElement('div');m.id='tp-license-modal';m.className='tp-lic-modal';m.innerHTML=`<div class="tp-lic-modal-card">${html}</div>`;document.body.appendChild(m);return m;
}
function closeModal(){document.getElementById('tp-license-modal')?.remove();}

function openExtend(key) {
  const m=modal(`<h3 style="color:white;margin:0 0 6px">Prolonger la licence</h3><p style="color:#94a3b8;font-size:11px">${e(key)} — la prolongation s’ajoute à la date d’expiration actuelle, ou à aujourd’hui si elle est déjà expirée.</p><select id="tp-extend-years" class="tp-lic-select" style="margin:12px 0"><option value="1">+ 1 an</option><option value="2">+ 2 ans</option><option value="3">+ 3 ans</option><option value="4">+ 4 ans</option><option value="5">+ 5 ans</option></select><div class="tp-lic-toolbar"><button class="tp-lic-btn primary" id="tp-extend-confirm">Confirmer</button><button class="tp-lic-btn" id="tp-modal-close">Annuler</button></div>`);
  m.querySelector('#tp-modal-close').onclick=closeModal;
  m.querySelector('#tp-extend-confirm').onclick=async()=>{try{const years=Number(m.querySelector('#tp-extend-years').value);await api('/api/v1/admin/licenses/action',{method:'POST',body:JSON.stringify({license_key:key,action:'extend',years})});closeModal();showToast(`Licence prolongée de ${years} an${years>1?'s':''}.`);await refreshLicenses();}catch(err){showToast(`Prolongation impossible : ${err.message}`,'error')}};
}

async function openEvents(key) {
  const m=modal(`<h3 style="color:white;margin:0 0 12px">Historique de ${e(key)}</h3><div id="tp-events" class="tp-lic-empty">Chargement…</div><button class="tp-lic-btn" id="tp-modal-close" style="margin-top:12px">Fermer</button>`);m.querySelector('#tp-modal-close').onclick=closeModal;
  try{const result=await api(`/api/v1/admin/events?license_key=${encodeURIComponent(key)}`);const events=result.events||[];m.querySelector('#tp-events').innerHTML=events.length?events.map(x=>`<div style="text-align:left;padding:9px 0;border-bottom:1px solid #1e293b"><b style="color:#fff">${e(x.event_type)}</b><br><small style="color:#64748b">${e(fmt(x.created_at))}${x.details?` · ${e(x.details)}`:''}</small></div>`).join(''):'Aucun événement.';}catch(err){m.querySelector('#tp-events').textContent=`Erreur : ${err.message}`;}
}

function openSettings() {
  const m=modal(`<h3 style="color:white;margin:0 0 6px">API des licences Télé Prime4K</h3><p style="color:#94a3b8;font-size:11px">Collez ici l’adresse HTTPS du Worker Cloudflare de licences. Aucun secret administrateur n’est enregistré dans cette page.</p><input id="tp-api-base" class="tp-lic-input" style="margin:12px 0" value="${e(apiBase())}" placeholder="https://teleprime-licences.votre-compte.workers.dev"><div class="tp-lic-toolbar"><button class="tp-lic-btn primary" id="tp-api-save">Enregistrer</button><button class="tp-lic-btn" id="tp-modal-close">Annuler</button></div>`);
  m.querySelector('#tp-modal-close').onclick=closeModal;
  m.querySelector('#tp-api-save').onclick=()=>{const v=m.querySelector('#tp-api-base').value.trim().replace(/\/+$/,'');if(!/^https:\/\//i.test(v))return showToast('Adresse HTTPS invalide.','error');localStorage.setItem(LS_API_KEY,v);closeModal();updateApiWarning();refreshLicenses();showToast('Adresse API enregistrée.');};
}

function install() {
  if (injecting || window.appState?.isAdmin !== true) return;
  injecting = true;
  try { styles(); attachSection(); addNavigation(); } finally { injecting = false; }
}

const observer = new MutationObserver(() => {
  if (window.appState?.isAdmin === true) requestAnimationFrame(install);
});
observer.observe(document.documentElement, {subtree:true, childList:true});
setInterval(install, 1800);
window.openTelePrimeLicenseConsole = openConsole;
install();
