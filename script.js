document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initSnow();
    initLights();
    initBudget();
});

function initReveal() {
    const items = document.querySelectorAll('.reveal');
    const check = () => items.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 70) el.classList.add('active');
    });
    window.addEventListener('scroll', check, { passive: true });
    check();
}

/* Neige douce : un canvas par bandeau, en pause quand il n'est plus visible. */
function initSnow() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.snow-canvas').forEach(canvas => {
        if (reduce) return;
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, flakes = [], running = false, raf = 0;

        const resize = () => {
            const r = canvas.parentElement.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = r.width; h = r.height;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round(Math.min(130, w / 9));
            flakes = Array.from({ length: count }, () => newFlake(true));
        };
        const newFlake = (anywhere) => ({
            x: Math.random() * w,
            y: anywhere ? Math.random() * h : -10,
            r: Math.random() * 1.9 + 0.5,
            v: Math.random() * 0.7 + 0.25,
            d: Math.random() * Math.PI * 2,
            s: Math.random() * 0.012 + 0.004
        });
        const frame = () => {
            ctx.clearRect(0, 0, w, h);
            for (const f of flakes) {
                f.d += f.s;
                f.x += Math.sin(f.d) * 0.35 + 0.08;
                f.y += f.v;
                if (f.y > h + 5 || f.x > w + 10) Object.assign(f, newFlake(false), { x: Math.random() * w });
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + f.r * 0.2) + ')';
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(frame);
        };
        const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
        const stop = () => { running = false; cancelAnimationFrame(raf); };

        resize();
        window.addEventListener('resize', resize);
        new IntersectionObserver(es => es[0].isIntersecting ? start() : stop()).observe(canvas.parentElement);
    });
}

/* Guirlande lumineuse sur le haut du bandeau d'accueil. */
function initLights() {
    const svg = document.getElementById('lights');
    if (!svg) return;
    const path = svg.querySelector('path');
    const total = path.getTotalLength();
    const colors = ['#ffcf7a', '#ff8f6b', '#fff0c9', '#ffbf5e', '#e9677a'];
    const n = 34;
    for (let i = 0; i <= n; i++) {
        const p = path.getPointAtLength((total / n) * i);
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y + 5); c.setAttribute('r', 4.2);
        c.setAttribute('fill', colors[i % colors.length]);
        c.setAttribute('filter', 'url(#glow)');
        c.setAttribute('class', 'bulb');
        c.style.animationDelay = (i * 0.37 % 2.8) + 's';
        svg.appendChild(c);
    }
}

/* Simulation du budget par personne. Hypothèses détaillées sur la page budget. */
function initBudget() {
    const slider = document.getElementById('people');
    if (!slider) return;

    const LODGING_FIXED = 1650 + 50;      // devis CVM : 2 nuits (forfait Mont-Blanc Unlimited compris) + adhésion groupe
    const TAX_PER_PERSON = 0.8 * 2;       // taxe de séjour, 2 nuits
    const TRANSPORT = 50;                 // voiture, frais partagés (retour d'expérience Pointe Percée)
    const FOOD = 20;                      // repas du week-end
    const RENTAL = 60;                    // location matériel de ski, 2 jours

    const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    const $ = id => document.getElementById(id);

    const update = () => {
        const n = Number(slider.value);
        const lodging = (LODGING_FIXED + TAX_PER_PERSON * n) / n;
        const withRental = $('opt-rental').checked;

        $('people-out').textContent = n;
        $('v-lodging').textContent = euro.format(lodging);
        $('v-transport').textContent = euro.format(TRANSPORT);
        $('v-food').textContent = euro.format(FOOD);
        $('v-rental').textContent = euro.format(RENTAL);
        $('l-rental').classList.toggle('off', !withRental);

        const base = lodging + TRANSPORT + FOOD;
        $('per-person').textContent = euro.format(base + (withRental ? RENTAL : 0));
        $('hint').textContent = 'Gîte : ' + euro.format(LODGING_FIXED + TAX_PER_PERSON * n) + ' à partager entre ' + n + ' personnes';

        $('scen-a').textContent = euro.format(base);
        $('scen-b').textContent = euro.format(base + RENTAL);
    };

    slider.addEventListener('input', update);
    $('opt-rental').addEventListener('change', update);
    update();
}
