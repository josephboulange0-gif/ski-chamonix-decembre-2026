document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    const reveal = () => {
        reveals.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('active');
        });
    };
    window.addEventListener('scroll', reveal);
    reveal();

    initBudgetCalculator();
});

// Devis CVM : 2 nuitées gîte privatisé 1650 € + adhésion groupe 50 € + taxe de séjour 0,80 € x personnes x 2 nuits.
function initBudgetCalculator() {
    const slider = document.getElementById('people');
    if (!slider) return;

    const FIXED = 1650 + 50;
    const TAX_PER_PERSON = 0.8 * 2;
    const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    const out = document.getElementById('people-out');
    const per = document.getElementById('per-person');
    const total = document.getElementById('total');
    const warn = document.getElementById('warn');

    const update = () => {
        const n = Number(slider.value);
        const sum = FIXED + TAX_PER_PERSON * n;
        out.textContent = n;
        per.textContent = euro.format(sum / n);
        total.textContent = 'Total du devis : ' + euro.format(sum);
        warn.textContent = n < 15
            ? 'Le gîte est privatisé : le tarif ne baisse pas quand on est moins nombreux.'
            : '';
    };

    slider.addEventListener('input', update);
    update();
}
