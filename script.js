/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===== MOBILE MENU ===== */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}

/* ===== INTERSECTION OBSERVER ===== */
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ===== PRODUCT CARDS → PRE-FILL FORM ===== */
document.querySelectorAll('.product-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const product = link.dataset.product;
        const select  = document.getElementById('producto');
        if (select && product) select.value = product;
        document.getElementById('cotizacion').scrollIntoView({ behavior: 'smooth' });
    });
});

/* ===== FORM SUBMISSION ===== */
/*
  Para habilitar el envío por email configura Formspree:
  1. Ve a https://formspree.io y crea cuenta con ventas@vilumax.cl
  2. Crea un nuevo formulario
  3. Reemplaza 'YOUR_FORM_ID' abajo con tu Form ID (ej: 'xpzgkdbn')
*/
const FORMSPREE_ID = 'mjgjqqqg';

const form       = document.getElementById('cotizacion-form');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = submitBtn.querySelector('.btn-text');
const btnLoader  = submitBtn.querySelector('.btn-loader');
const formWrap   = document.querySelector('.cotizacion-form-wrap');
const formSuccess = document.getElementById('formSuccess');

function setLoading(on) {
    submitBtn.disabled = on;
    btnText.style.display   = on ? 'none'   : 'inline';
    btnLoader.style.display = on ? 'inline' : 'none';
}

function showSuccess() {
    form.style.display = 'none';
    formSuccess.style.display = 'block';
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function buildMailtoFallback(data) {
    const subject = encodeURIComponent(`Cotización VILUMAX – ${data.get('producto') || 'consulta'}`);
    const body = encodeURIComponent([
        `Nombre:   ${data.get('nombre')   || ''}`,
        `Empresa:  ${data.get('empresa')  || ''}`,
        `Email:    ${data.get('email')    || ''}`,
        `Teléfono: ${data.get('telefono') || ''}`,
        ``,
        `Producto: ${data.get('producto') || ''}`,
        ``,
        `Detalle:`,
        data.get('mensaje') || ''
    ].join('\n'));
    return `mailto:ventas@vilumax.cl?subject=${subject}&body=${body}`;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    ['nombre', 'email', 'producto', 'mensaje'].forEach(id => {
        const el = document.getElementById(id);
        const wrap = id === 'producto' ? el.closest('.select-wrap') : el;
        if (!el.value.trim()) {
            wrap.classList.add('error');
            valid = false;
        } else {
            wrap.classList.remove('error');
        }
    });
    if (!valid) return;

    setLoading(true);
    const formData = new FormData(form);

    if (FORMSPREE_ID !== 'YOUR_FORM_ID') {
        try {
            const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                showSuccess();
                return;
            }
        } catch (_) {
            // fall through to mailto
        } finally {
            setLoading(false);
        }
    } else {
        setLoading(false);
    }

    // Fallback: open mailto
    window.location.href = buildMailtoFallback(formData);
    setTimeout(showSuccess, 500);
});

// Remove error state on input
form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
        const target = el.tagName === 'SELECT' ? el.closest('.select-wrap') : el;
        target.classList.remove('error');
    });
});
