// lf-store.js — almacenamiento compartido entre el sitio público (La Fama Films.dc.html)
// y el panel administrativo (Panel Admin.dc.html). Mismo patrón que jm_photo_* en el
// proyecto Jalip Motorsport: todo vive en localStorage del navegador (prototipo sin
// backend); cuando haya hosting + backend real, este archivo es el único que hay que
// reemplazar por llamadas a una API.
(function (global) {
  'use strict';

  var PREFIX = 'lf_';
  var CONTENT_KEY = PREFIX + 'content';
  var LEADS_KEY = PREFIX + 'leads';
  var PHOTO_PREFIX = PREFIX + 'photo_';

  // ── Contenido por defecto — coincide 1:1 con el texto ya escrito en la página
  // pública. Si el admin no ha tocado nada, el sitio se ve exactamente igual.
  var DEFAULTS = {
    accent: '#ec3013',
    showPricing: true,
    hero: {
      tag: 'REC · PHOTO + VIDEO',
      locations: 'NYC / NJ · DOMINICAN REPUBLIC · WORLDWIDE'
    },
    about: {
      p1: 'LaFama Films trabaja con artistas urbanos dominicanos dentro y fuera de la isla. Grabamos donde pasa la cosa: la esquina, el estudio, el club, el backstage, el carro, la tarima. Sin poses de agencia.',
      p2: 'We shoot the artists, the block and the night — Dominican culture with New York speed. Photo and video, one crew, one direction.',
      stats: [
        { n: '100+', l: 'VIDEOCLIPS RODADOS' },
        { n: '3', l: 'BASES: NYC · NJ · RD' },
        { n: '48H', l: 'ENTREGA DE REELS' }
      ]
    },
    contact: {
      companyName: 'LA FAMA FILMS LLC',
      address: '42 Harding Ave, Westwood, NJ.',
      addressNote: 'Rodamos en Nueva York, New Jersey, República Dominicana y donde haga falta.',
      phone: '+1 (201) 296-1944',
      whatsapp: '12012961944',
      email: 'lafamafilmsllc@gmail.com',
      instagramHandle: '@imangelfilms',
      instagramUrl: 'https://www.instagram.com/imangelfilms/'
    },
    // No hay todavía un nombre/bio real confirmados para el fotógrafo — estos
    // tres campos son placeholder a propósito (marcados como tal) para que el
    // cliente los reemplace desde el panel admin; no se inventó contenido.
    photographer: {
      name: '[NOMBRE DEL FOTÓGRAFO]',
      role: 'PHOTOGRAPHER / DIRECTOR',
      bio: '[Bio pendiente — 2 a 4 líneas sobre el enfoque, el estilo y la experiencia. Reemplaza este texto desde el panel admin.]'
    },
    portfolio: [
      { id: 'pf01', cat: 'MUSIC VIDEO · NYC · 2026', title: 'ARTISTA 01 — REEMPLAZAR', size: 'large' },
      { id: 'pf02', cat: 'PORTRAIT · 2026', title: 'ARTISTA 02', size: 'small' },
      { id: 'pf03', cat: 'BEHIND THE SCENES · SDQ', title: 'RODAJE 03 — REEMPLAZAR', size: 'wide' },
      { id: 'pf04', cat: 'LIVE · 2026', title: 'SHOW 04', size: 'small' },
      { id: 'pf05', cat: 'STREET · NJ', title: 'FRAME 05', size: 'small' },
      { id: 'pf06', cat: 'ARTIST VISUALS · 2026', title: 'ARTISTA 06 — REEMPLAZAR', size: 'large' },
      { id: 'pf07', cat: 'STUDIO · 2025', title: 'SESIÓN 07', size: 'small' },
      { id: 'pf08', cat: 'EVENT · BRONX', title: 'FRAME 08', size: 'small' },
      { id: 'pf09', cat: 'COVER ART · 2026', title: 'SINGLE 09 — REEMPLAZAR', size: 'square-large' },
      { id: 'pf10', cat: 'FLASH · NIGHT', title: 'FRAME 10', size: 'small' },
      { id: 'pf11', cat: 'LIVE PERFORMANCE · 2026', title: 'TARIMA 11 — REEMPLAZAR', size: 'panorama' },
      { id: 'pf12', cat: 'CAMPAIGN · 2026', title: 'FRAME 12', size: 'small' }
    ],
    reels: [
      { id: 'r1', code: 'Dc7Su26xWGA', label: 'REEL 01' },
      { id: 'r2', code: 'DcRxBy7ROxk', label: 'REEL 02' },
      { id: 'r3', code: 'Dc3qsCrRlYM', label: 'REEL 03' }
    ],
    artists: [
      { id: 'a1', name: 'ARTISTA 01', role: 'VIDEOCLIP · 2026 · [NOMBRE AQUÍ]', link: '#work' },
      { id: 'a2', name: 'ARTISTA 02', role: 'REELS · 2026 · [NOMBRE AQUÍ]', link: '#work' },
      { id: 'a3', name: 'ARTISTA 03', role: 'STUDIO SESSION · [NOMBRE AQUÍ]', link: '#work' },
      { id: 'a4', name: 'ARTISTA 04', role: 'LIVE / TOUR · [NOMBRE AQUÍ]', link: '#work' },
      { id: 'a5', name: 'ARTISTA 05', role: 'CAMPAÑA · [NOMBRE AQUÍ]', link: '#work' }
    ],
    services: [
      { id: 's1', svc: 'Videoclip', title: 'VIDEOCLIPS / MUSIC VIDEOS', desc: 'Concepto, rodaje 4K, dirección de arte de calle y edición al ritmo del track.', price: '' },
      { id: 's2', svc: 'Fotografía', title: 'FOTOGRAFÍA · STREET & STUDIO', desc: 'Flash directo, retrato de portada, promo para prensa y sesiones en la calle.', price: '' },
      { id: 's3', svc: 'Reel', title: 'REELS & CONTENT CREATION', desc: 'Paquetes mensuales de contenido vertical para IG y TikTok. Entrega en 48h.', price: '' },
      { id: 's4', svc: 'Evento', title: 'EVENTOS · LIVE & BACKSTAGE', desc: 'Conciertos, club nights, giras y cobertura de backstage en NYC, NJ y RD.', price: '' },
      { id: 's5', svc: 'Campaña', title: 'CAMPAÑAS DE MARCA', desc: 'Marcas que quieren hablarle a la cultura urbana latina sin sonar falso.', price: '' },
      { id: 's6', svc: 'Edición de video', title: 'EDICIÓN DE VIDEO', desc: 'Edición para el material que ya tienes grabado: videoclips, reels, eventos o footage propio. Color, ritmo y entrega lista para la plataforma.', price: '' }
    ]
  };

  function isPlainObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  function deepMerge(base, over) {
    if (!isPlainObject(over)) return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (var k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      if (isPlainObject(base[k]) && isPlainObject(over[k])) {
        out[k] = deepMerge(base[k], over[k]);
      } else {
        out[k] = over[k];
      }
    }
    return out;
  }

  function safeParse(json, fallback) {
    try {
      var v = JSON.parse(json);
      return v === undefined || v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function getContent() {
    var saved = safeParse(localStorage.getItem(CONTENT_KEY), null);
    return saved ? deepMerge(DEFAULTS, saved) : deepMerge(DEFAULTS, {});
  }

  function setContent(partial) {
    var current = safeParse(localStorage.getItem(CONTENT_KEY), {});
    var merged = deepMerge(deepMerge(DEFAULTS, current), partial);
    // Solo persistimos lo que difiere de vacío: guardamos el objeto completo
    // fusionado para simplificar (el tamaño es pequeño, es solo texto).
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(merged));
    } catch (e) {}
    return merged;
  }

  function resetContent() {
    try { localStorage.removeItem(CONTENT_KEY); } catch (e) {}
    return deepMerge(DEFAULTS, {});
  }

  // ── Fotos ────────────────────────────────────────────────────────────────
  function getPhoto(id) {
    try { return localStorage.getItem(PHOTO_PREFIX + id) || ''; } catch (e) { return ''; }
  }
  function savePhoto(id, dataUrl) {
    try { localStorage.setItem(PHOTO_PREFIX + id, dataUrl); return true; } catch (e) { return false; }
  }
  function removePhoto(id) {
    try { localStorage.removeItem(PHOTO_PREFIX + id); } catch (e) {}
  }

  // ── Videos (IndexedDB) ──────────────────────────────────────────────────
  // localStorage tiene ~5-10MB de cupo total y solo guarda strings — un
  // video, aunque sea corto, no cabe ahí. IndexedDB sí soporta blobs
  // binarios y da muchísimo más espacio, así que los reels con autoplay
  // (para hacer scroll y que reproduzcan solos) se guardan aquí.
  var VIDEO_DB = 'lf_videos_db';
  var VIDEO_STORE = 'videos';
  var videoDbPromise = null;
  function openVideoDb() {
    if (videoDbPromise) return videoDbPromise;
    videoDbPromise = new Promise(function (resolve) {
      if (!global.indexedDB) { resolve(null); return; }
      var req;
      try { req = global.indexedDB.open(VIDEO_DB, 1); } catch (e) { resolve(null); return; }
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(VIDEO_STORE)) req.result.createObjectStore(VIDEO_STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
    });
    return videoDbPromise;
  }
  function saveVideo(id, blob) {
    return openVideoDb().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(VIDEO_STORE, 'readwrite');
          tx.objectStore(VIDEO_STORE).put(blob, id);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        } catch (e) { resolve(false); }
      });
    });
  }
  function getVideo(id) {
    return openVideoDb().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(VIDEO_STORE, 'readonly');
          var req = tx.objectStore(VIDEO_STORE).get(id);
          req.onsuccess = function () { resolve(req.result || null); };
          req.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
    });
  }
  function removeVideo(id) {
    return openVideoDb().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(VIDEO_STORE, 'readwrite');
          tx.objectStore(VIDEO_STORE).delete(id);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        } catch (e) { resolve(false); }
      });
    });
  }

  // Redimensiona/comprime antes de guardar — una foto de cámara sin comprimir
  // llenaría el localStorage del navegador (~5-10MB) en pocas unidades.
  function readAndResizeImage(file, maxW, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxW / img.width);
        var w = Math.round(img.width * scale) || 1;
        var h = Math.round(img.height * scale) || 1;
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { cb(null); };
      img.src = reader.result;
    };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  // ── Leads del formulario de booking ─────────────────────────────────────
  function getLeads() {
    return safeParse(localStorage.getItem(LEADS_KEY), []);
  }
  function addLead(lead) {
    var leads = getLeads();
    leads.unshift(Object.assign({ id: 'lead_' + Date.now(), ts: Date.now(), estado: 'Nuevo' }, lead));
    try { localStorage.setItem(LEADS_KEY, JSON.stringify(leads)); } catch (e) {}
    return leads;
  }
  function setLeads(leads) {
    try { localStorage.setItem(LEADS_KEY, JSON.stringify(leads)); } catch (e) {}
  }

  // ── Utilidades para el panel admin ──────────────────────────────────────
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function exportBackup() {
    var out = { content: getContent(), leads: getLeads(), photos: {} };
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PHOTO_PREFIX) === 0) out.photos[k.slice(PHOTO_PREFIX.length)] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }

  function importBackup(data) {
    if (!data || typeof data !== 'object') return false;
    try {
      if (data.content) localStorage.setItem(CONTENT_KEY, JSON.stringify(deepMerge(DEFAULTS, data.content)));
      if (data.leads) localStorage.setItem(LEADS_KEY, JSON.stringify(data.leads));
      if (data.photos) {
        for (var id in data.photos) {
          if (Object.prototype.hasOwnProperty.call(data.photos, id)) {
            localStorage.setItem(PHOTO_PREFIX + id, data.photos[id]);
          }
        }
      }
      return true;
    } catch (e) { return false; }
  }

  function resetAll() {
    try {
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) toRemove.push(k);
      }
      toRemove.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }

  global.LFStore = {
    DEFAULTS: DEFAULTS,
    getContent: getContent,
    setContent: setContent,
    resetContent: resetContent,
    getPhoto: getPhoto,
    savePhoto: savePhoto,
    removePhoto: removePhoto,
    readAndResizeImage: readAndResizeImage,
    saveVideo: saveVideo,
    getVideo: getVideo,
    removeVideo: removeVideo,
    getLeads: getLeads,
    addLead: addLead,
    setLeads: setLeads,
    uid: uid,
    exportBackup: exportBackup,
    importBackup: importBackup,
    resetAll: resetAll
  };
})(window);
