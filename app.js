/* ============================================================
   Figanzi Sonidos — app.js
   Responsabilidades:
     1. Registro del Service Worker (PWA / offline)
     2. Animación de las barras de sonido del hero
     3. Scroll animations (IntersectionObserver)
     4. Lógica del formulario → WhatsApp
     5. Smooth scroll para links internos
   ============================================================ */

'use strict';

/* ── 1. SERVICE WORKER ─────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('[SW] Registrado:', reg.scope))
      .catch(err => console.warn('[SW] Error al registrar:', err));
  });
}

/* ── 2. WAVE BARS ──────────────────────────────────────────── */
function initWave() {
  const wave = document.getElementById('wave');
  if (!wave) return;

  const heights = [
    30,55,80,100,70,90,60,110,45,95,
    75,50,85,65,105,40,70,90,55,80,
    100,60,115,50,85,70,95,45,75,110,
    65,90,55,80,105,40,70,95,60,85
  ];

  heights.forEach((h, i) => {
    const bar = document.createElement('span');
    bar.style.height = h + 'px';
    bar.style.animationDelay = (i * 0.06) + 's';
    wave.appendChild(bar);
  });
}

/* ── 3. SCROLL ANIMATIONS ──────────────────────────────────── */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.step, .equip-card, .why-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // animar solo una vez
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
    observer.observe(el);
  });
}

/* ── 4. FORMULARIO → WHATSAPP ──────────────────────────────── */
const WA_NUMBER = '56946541095';

function buildWhatsAppMessage({ nombre, telefono, email, fecha, horario, personas, direccion, tipo, mensaje }) {
  const fechaFormateada = fecha
    ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'No indicada';

  return [
    'Hola! Te hago una consulta desde la web 👋',
    '',
    `*Nombre:* ${nombre}`,
    `*WhatsApp:* ${telefono}`,
    email ? `*Email:* ${email}` : null,
    `*Fecha del evento:* ${fechaFormateada}`,
    `*Horario:* ${horario}`,
    `*Cantidad de personas:* ${personas}`,
    `*Dirección del evento:* ${direccion}`,
    `*Tipo de evento:* ${tipo}`,
    `*Detalles:* ${mensaje || 'Sin detalles adicionales'}`,
  ]
    .filter(line => line !== null)
    .join('\n');
}

function showError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = '#D1000A';
  field.style.boxShadow = '0 0 0 3px rgba(209,0,10,0.15)';

  // Remover error al corregir
  field.addEventListener('input', () => {
    field.style.borderColor = '';
    field.style.boxShadow = '';
  }, { once: true });
}

function clearErrors() {
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });
}

function validateForm(data) {
  const errors = [];
  if (!data.nombre)     { errors.push('nombre');     showError('nombre'); }
  if (!data.direccion) { errors.push('direccion'); showError('direccion'); }
  if (!data.telefono) { errors.push('telefono'); showError('telefono'); }
  if (!data.fecha)    { errors.push('fecha');    showError('fecha'); }
  if (!data.horario)  { errors.push('horario');  showError('horario'); }
  if (!data.personas) { errors.push('personas'); showError('personas'); }
  if (!data.tipo)     { errors.push('tipo');     showError('tipo'); }
  return errors;
}

function enviarConsulta() {
  clearErrors();

  const data = {
    nombre:   document.getElementById('nombre')?.value.trim()   || '',
    telefono: document.getElementById('telefono')?.value.trim() || '',
    email:    document.getElementById('email')?.value.trim()    || '',
    fecha:    document.getElementById('fecha')?.value           || '',
    horario:  document.getElementById('horario')?.value.trim()  || '',
    personas: document.getElementById('personas')?.value        || '',
    tipo:     document.getElementById('tipo')?.value            || '',
    mensaje:  document.getElementById('mensaje')?.value.trim()  || '',
    direccion: document.getElementById('direccion')?.value.trim() || '',
  };

  const errors = validateForm(data);
  if (errors.length) {
    // Scroll al primer campo con error
    const first = document.getElementById(errors[0]);
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const texto = buildWhatsAppMessage(data);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');

  // Mostrar mensaje de éxito
  const formInner = document.getElementById('form-inner');
  const success   = document.getElementById('success');
  if (formInner) formInner.style.display = 'none';
  if (success)   success.style.display   = 'block';
}

// Exponer al HTML (onclick="enviarConsulta()")
window.enviarConsulta = enviarConsulta;

/* ── 5. SMOOTH SCROLL ──────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initWave();
  initScrollAnimations();
  initSmoothScroll();
});
