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
  var UPDATED_KEY = PREFIX + 'updatedAt';
  var LANG_KEY = PREFIX + 'lang';

  // ── Contenido por defecto — coincide 1:1 con el texto ya escrito en la página
  // pública. Si el admin no ha tocado nada, el sitio se ve exactamente igual.
  //
  // Bilingüe: todo campo de texto que es contenido real (se traduce con el
  // idioma) se guarda como { en, es } en vez de un string plano. Los nombres
  // propios (marca, nombre del fotógrafo, nombres de artistas, dirección,
  // teléfono, redes) NO se vuelven bilingües a propósito — un nombre propio
  // no se traduce. Ver tr() más abajo: acepta tanto el objeto { en, es } como
  // un string plano viejo (contenido guardado antes de este cambio), así que
  // nada de lo ya guardado se rompe ni desaparece.
  var DEFAULTS = {
    accent: '#ec3013',
    showPricing: true,
    hero: {
      tag: { en: 'REC · PHOTO + VIDEO', es: 'REC · FOTO + VIDEO' },
      locations: { en: 'NYC / NJ · DOMINICAN REPUBLIC · WORLDWIDE', es: 'NYC / NJ · REPÚBLICA DOMINICANA · MUNDIAL' },
      // Nombre de marca — no se traduce.
      titleLine1: 'LA FAMA',
      titleLine2: 'FILMS',
      subtitleLine1: { en: 'VISUALS', es: 'VISUALES' },
      subtitleLine2: { en: 'FOR THE CULTURE.', es: 'PARA LA CULTURA.' }
    },
    about: {
      p1: {
        en: "LaFama Films works with Dominican urban artists on and off the island. We shoot where it's actually happening: the corner, the studio, the club, backstage, the car, the stage. No agency poses.",
        es: 'LaFama Films trabaja con artistas urbanos dominicanos dentro y fuera de la isla. Grabamos donde pasa la cosa: la esquina, el estudio, el club, el backstage, el carro, la tarima. Sin poses de agencia.'
      },
      p2: {
        en: 'We shoot the artists, the block and the night — Dominican culture with New York speed. Photo and video, one crew, one direction.',
        es: 'Grabamos a los artistas, el barrio y la noche — cultura dominicana con velocidad neoyorquina. Foto y video, un solo equipo, una sola dirección.'
      },
      stats: [
        { n: '100+', l: { en: 'MUSIC VIDEOS SHOT', es: 'VIDEOCLIPS RODADOS' } },
        { n: '3', l: { en: 'BASES: NYC · NJ · DR', es: 'BASES: NYC · NJ · RD' } },
        { n: '48H', l: { en: 'REEL DELIVERY', es: 'ENTREGA DE REELS' } }
      ]
    },
    contact: {
      // Nombre de empresa, dirección, teléfono y redes — datos factuales, no
      // se traducen.
      companyName: 'LA FAMA FILMS LLC',
      address: '42 Harding Ave, Westwood, NJ.',
      addressNote: {
        en: 'We shoot in New York, New Jersey, the Dominican Republic, and wherever the project takes us.',
        es: 'Rodamos en Nueva York, New Jersey, República Dominicana y donde haga falta.'
      },
      phone: '+1 (201) 296-1944',
      whatsapp: '12012961944',
      email: 'lafamafilmsllc@gmail.com',
      instagramHandle: '@imangelfilms',
      instagramUrl: 'https://www.instagram.com/imangelfilms/'
    },
    // No hay todavía un nombre/bio real confirmados para el fotógrafo — estos
    // campos son placeholder a propósito (marcados como tal) para que el
    // cliente los reemplace desde el panel admin; no se inventó contenido.
    photographer: {
      // Nombre propio — no se traduce.
      name: '[PHOTOGRAPHER NAME]',
      role: { en: 'PHOTOGRAPHER / DIRECTOR', es: 'FOTÓGRAFO / DIRECTOR' },
      bio: {
        en: '[Bio pending — 2 to 4 lines about approach, style and experience. Replace this text from the admin panel.]',
        es: '[Bio pendiente — 2 a 4 líneas sobre el enfoque, el estilo y la experiencia. Reemplaza este texto desde el panel admin.]'
      }
    },
    portfolio: [
      { id: 'pf01', cat: { en: 'MUSIC VIDEO · NYC · 2026', es: 'VIDEOCLIP · NYC · 2026' }, title: { en: 'ARTIST 01 — REPLACE', es: 'ARTISTA 01 — REEMPLAZAR' }, size: 'large' },
      { id: 'pf02', cat: { en: 'PORTRAIT · 2026', es: 'RETRATO · 2026' }, title: { en: 'ARTIST 02', es: 'ARTISTA 02' }, size: 'small' },
      { id: 'pf03', cat: { en: 'BEHIND THE SCENES · SDQ', es: 'DETRÁS DE CÁMARAS · SDQ' }, title: { en: 'SHOOT 03 — REPLACE', es: 'RODAJE 03 — REEMPLAZAR' }, size: 'wide' },
      { id: 'pf04', cat: { en: 'LIVE · 2026', es: 'EN VIVO · 2026' }, title: { en: 'SHOW 04', es: 'SHOW 04' }, size: 'small' },
      { id: 'pf05', cat: { en: 'STREET · NJ', es: 'CALLE · NJ' }, title: { en: 'FRAME 05', es: 'FRAME 05' }, size: 'small' },
      { id: 'pf06', cat: { en: 'ARTIST VISUALS · 2026', es: 'VISUALES DE ARTISTA · 2026' }, title: { en: 'ARTIST 06 — REPLACE', es: 'ARTISTA 06 — REEMPLAZAR' }, size: 'large' },
      { id: 'pf07', cat: { en: 'STUDIO · 2025', es: 'ESTUDIO · 2025' }, title: { en: 'SESSION 07', es: 'SESIÓN 07' }, size: 'small' },
      { id: 'pf08', cat: { en: 'EVENT · BRONX', es: 'EVENTO · BRONX' }, title: { en: 'FRAME 08', es: 'FRAME 08' }, size: 'small' },
      { id: 'pf09', cat: { en: 'COVER ART · 2026', es: 'ARTE DE PORTADA · 2026' }, title: { en: 'SINGLE 09 — REPLACE', es: 'SINGLE 09 — REEMPLAZAR' }, size: 'square-large' },
      { id: 'pf10', cat: { en: 'FLASH · NIGHT', es: 'FLASH · NOCHE' }, title: { en: 'FRAME 10', es: 'FRAME 10' }, size: 'small' },
      { id: 'pf11', cat: { en: 'LIVE PERFORMANCE · 2026', es: 'TARIMA EN VIVO · 2026' }, title: { en: 'STAGE 11 — REPLACE', es: 'TARIMA 11 — REEMPLAZAR' }, size: 'panorama' },
      { id: 'pf12', cat: { en: 'CAMPAIGN · 2026', es: 'CAMPAÑA · 2026' }, title: { en: 'FRAME 12', es: 'FRAME 12' }, size: 'small' }
    ],
    reels: [
      { id: 'r1', code: 'Dc7Su26xWGA', label: 'REEL 01' },
      { id: 'r2', code: 'DcRxBy7ROxk', label: 'REEL 02' },
      { id: 'r3', code: 'Dc3qsCrRlYM', label: 'REEL 03' }
    ],
    artists: [
      // El nombre del artista no se traduce; el rol/proyecto sí.
      { id: 'a1', name: 'ARTIST 01', role: { en: 'MUSIC VIDEO · 2026 · [NAME HERE]', es: 'VIDEOCLIP · 2026 · [NOMBRE AQUÍ]' }, link: '#work' },
      { id: 'a2', name: 'ARTIST 02', role: { en: 'REELS · 2026 · [NAME HERE]', es: 'REELS · 2026 · [NOMBRE AQUÍ]' }, link: '#work' },
      { id: 'a3', name: 'ARTIST 03', role: { en: 'STUDIO SESSION · [NAME HERE]', es: 'STUDIO SESSION · [NOMBRE AQUÍ]' }, link: '#work' },
      { id: 'a4', name: 'ARTIST 04', role: { en: 'LIVE / TOUR · [NAME HERE]', es: 'LIVE / TOUR · [NOMBRE AQUÍ]' }, link: '#work' },
      { id: 'a5', name: 'ARTIST 05', role: { en: 'CAMPAIGN · [NAME HERE]', es: 'CAMPAÑA · [NOMBRE AQUÍ]' }, link: '#work' }
    ],
    services: [
      { id: 's1', svc: 'Videoclip', title: { en: 'MUSIC VIDEOS', es: 'VIDEOCLIPS' }, desc: { en: 'Concept, 4K shooting, street art direction, and editing cut to the track.', es: 'Concepto, rodaje 4K, dirección de arte de calle y edición al ritmo del track.' }, price: '' },
      { id: 's2', svc: 'Fotografía', title: { en: 'PHOTOGRAPHY · STREET & STUDIO', es: 'FOTOGRAFÍA · CALLE Y ESTUDIO' }, desc: { en: 'Direct flash, cover portraits, press promo, and street sessions.', es: 'Flash directo, retrato de portada, promo para prensa y sesiones en la calle.' }, price: '' },
      { id: 's3', svc: 'Reel', title: { en: 'REELS & CONTENT CREATION', es: 'REELS Y CREACIÓN DE CONTENIDO' }, desc: { en: 'Monthly vertical content packages for IG and TikTok. 48h delivery.', es: 'Paquetes mensuales de contenido vertical para IG y TikTok. Entrega en 48h.' }, price: '' },
      { id: 's4', svc: 'Evento', title: { en: 'EVENTS · LIVE & BACKSTAGE', es: 'EVENTOS · EN VIVO Y BACKSTAGE' }, desc: { en: 'Concerts, club nights, tours, and backstage coverage across NYC, NJ, and DR.', es: 'Conciertos, club nights, giras y cobertura de backstage en NYC, NJ y RD.' }, price: '' },
      { id: 's5', svc: 'Campaña', title: { en: 'BRAND CAMPAIGNS', es: 'CAMPAÑAS DE MARCA' }, desc: { en: 'Brands that want to speak to Latin urban culture without sounding fake.', es: 'Marcas que quieren hablarle a la cultura urbana latina sin sonar falso.' }, price: '' },
      { id: 's6', svc: 'Edición de video', title: { en: 'VIDEO EDITING', es: 'EDICIÓN DE VIDEO' }, desc: { en: 'Editing for footage you already have: music videos, reels, events, or your own material. Color, pacing, and platform-ready delivery.', es: 'Edición para el material que ya tienes grabado: videoclips, reels, eventos o footage propio. Color, ritmo y entrega lista para la plataforma.' }, price: '' }
    ],
    // Qué links del nav público están ocultos (por key). "booking" nunca se
    // guarda acá — el CTA de conversión no se puede ocultar desde el panel.
    navigation: { hidden: [] }
  };

  function isPlainObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  // Campo { en, es } vs string plano viejo (contenido guardado antes de que
  // este campo se volviera bilingüe): si es un objeto con en/es, devuelve el
  // del idioma pedido (con fallback al otro si falta); si es un string
  // (u otro valor), lo devuelve tal cual — así ningún contenido ya guardado
  // se pierde ni queda en blanco, solo no cambia con el idioma hasta que se
  // vuelva a guardar en el formato nuevo.
  function tr(field, lang) {
    if (isPlainObject(field)) {
      return field[lang] || field.en || field.es || '';
    }
    return field == null ? '' : field;
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
      localStorage.setItem(UPDATED_KEY, String(Date.now()));
    } catch (e) {}
    return merged;
  }

  // Sello de tiempo de la última edición real (para el dashboard). No existe
  // un log de actividad — esto es lo único que se puede saber honestamente:
  // cuándo fue la última vez que se guardó contenido.
  function getLastUpdated() {
    try {
      var v = localStorage.getItem(UPDATED_KEY);
      return v ? parseInt(v, 10) : null;
    } catch (e) { return null; }
  }

  function resetContent() {
    try { localStorage.removeItem(CONTENT_KEY); } catch (e) {}
    return deepMerge(DEFAULTS, {});
  }

  // ── Idioma del sitio ─────────────────────────────────────────────────────
  // Preferencia del visitante (o del admin), no contenido — se guarda aparte,
  // separado de lf_content. Default 'en' según lo pedido: el sitio abre en
  // inglés y cualquiera puede pasar a español desde el selector del nav.
  function getLang() {
    try {
      var v = localStorage.getItem(LANG_KEY);
      return v === 'es' ? 'es' : 'en';
    } catch (e) { return 'en'; }
  }
  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang === 'es' ? 'es' : 'en'); } catch (e) {}
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
  // Enumera TODAS las fotos guardadas (cualquier sección) — la Media Library
  // no es un catálogo separado, es un inventario real de lo que ya vive en
  // localStorage bajo lf_photo_*. approxBytes es el tamaño del dataURL en sí
  // (base64 ~33% más grande que el archivo original, pero es lo único medible
  // sin volver a decodificar la imagen).
  function listPhotos() {
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PHOTO_PREFIX) === 0) {
          var dataUrl = localStorage.getItem(k) || '';
          out.push({ id: k.slice(PHOTO_PREFIX.length), dataUrl: dataUrl, approxBytes: dataUrl.length });
        }
      }
    } catch (e) {}
    return out;
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
  // Lista los ids de video guardados, con su tamaño real en bytes (Blob.size
  // — a diferencia de las fotos, acá sí es el tamaño exacto del archivo).
  function listVideos() {
    return openVideoDb().then(function (db) {
      if (!db) return [];
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(VIDEO_STORE, 'readonly');
          var store = tx.objectStore(VIDEO_STORE);
          var keysReq = store.getAllKeys();
          var valuesReq = store.getAll();
          var keys, values;
          keysReq.onsuccess = function () { keys = keysReq.result; done(); };
          valuesReq.onsuccess = function () { values = valuesReq.result; done(); };
          tx.onerror = function () { resolve([]); };
          function done() {
            if (!keys || !values) return;
            resolve(keys.map(function (id, i) { return { id: id, bytes: values[i] ? values[i].size : 0 }; }));
          }
        } catch (e) { resolve([]); }
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
    leads.unshift(Object.assign({ id: 'lead_' + Date.now(), ts: Date.now(), estado: 'NEW' }, lead));
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
    // Los videos viven en IndexedDB, no en localStorage — "restablecer todo"
    // se quedaba corto acá desde que se agregó autoplay de reels.
    listVideos().then(function (vids) {
      vids.forEach(function (v) { removeVideo(v.id); });
    });
  }

  global.LFStore = {
    DEFAULTS: DEFAULTS,
    getContent: getContent,
    setContent: setContent,
    resetContent: resetContent,
    tr: tr,
    getLang: getLang,
    setLang: setLang,
    getPhoto: getPhoto,
    savePhoto: savePhoto,
    removePhoto: removePhoto,
    listPhotos: listPhotos,
    readAndResizeImage: readAndResizeImage,
    saveVideo: saveVideo,
    getVideo: getVideo,
    removeVideo: removeVideo,
    listVideos: listVideos,
    getLastUpdated: getLastUpdated,
    getLeads: getLeads,
    addLead: addLead,
    setLeads: setLeads,
    uid: uid,
    exportBackup: exportBackup,
    importBackup: importBackup,
    resetAll: resetAll
  };
})(window);
