/* ============================================
   SALON POKE — Website Interactions
   ============================================ */

const salonPoke = (function () {
    'use strict';

    // ----- Navbar scroll effect -----
    const nav = document.getElementById('nav');

    function handleNavScroll() {
        if (window.pageYOffset > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ----- Smooth scroll for anchor links -----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#' || targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = nav.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----- Scroll reveal animations -----
    const revealSelectors = [
        '.about-text', '.about-feature', '.product-card', '.event-detail',
        '.day-card', '.pricing-matrix-row', '.rule-card', '.loyalty-text',
        '.loyalty-card', '.preorder-card', '.gallery-item', '.testimonial',
        '.faq-item', '.book-intro', '.book-form', '.newsletter-inner',
        '.location-info', '.location-map', '.section-head', '.footer-col',
        '.pricing-matrix-head', '.quickbuy-card', '.quickbuy-head'
    ];

    const revealElements = document.querySelectorAll(revealSelectors.join(','));
    revealElements.forEach(el => el.classList.add('fade-up'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, Math.min(index * 50, 400));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // ----- FAQ Accordion -----
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const wasOpen = item.classList.contains('open');
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            // Open clicked if it was closed
            if (!wasOpen) {
                item.classList.add('open');
            }
        });
    });

    // ----- Default date input to today -----
    const dateInput = document.querySelector('input[type="date"][name="date"]');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // ----- Form: Booking -----
    function handleBooking(e) {
        const form = e.target;
        const data = Object.fromEntries(new FormData(form).entries());

        // Simulate submission
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Confirming...';
        btn.disabled = true;

        setTimeout(() => {
            // Show success message
            let successEl = form.querySelector('.form-success');
            if (!successEl) {
                successEl = document.createElement('div');
                successEl.className = 'form-success';
                form.appendChild(successEl);
            }
            successEl.textContent = `✓ Booking received for ${data.name || 'you'} — ${data.day ? data.day.toUpperCase() : ''} ${data.date}. We'll confirm via email within 24 hours.`;
            successEl.classList.add('show');

            btn.textContent = 'Confirmed ✓';
            btn.style.background = 'linear-gradient(135deg, #4ddb8e, #2eb872)';

            // Reset form after delay
            setTimeout(() => {
                form.reset();
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = '';
                successEl.classList.remove('show');
                // Re-set default date
                if (dateInput) {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    dateInput.value = `${yyyy}-${mm}-${dd}`;
                }
            }, 5000);

            console.log('Booking data:', data);
        }, 800);
    }

    // ----- Form: Newsletter -----
    function handleNewsletter(e) {
        const form = e.target;
        const input = form.querySelector('input[type="email"]');
        const btn = form.querySelector('button[type="submit"]');
        const email = input.value;
        const originalText = btn.textContent;

        btn.textContent = 'Subscribing...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = 'Subscribed ✓';
            btn.style.background = 'linear-gradient(135deg, #4ddb8e, #2eb872)';
            input.value = '';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = '';
            }, 3000);

            console.log('Newsletter signup:', email);
        }, 600);
    }

    // ----- Hero box hover parallax -----
    const heroBoxes = document.querySelectorAll('.hero-box');
    if (heroBoxes.length) {
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            heroVisual.addEventListener('mousemove', (e) => {
                const rect = heroVisual.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                heroBoxes.forEach((box, i) => {
                    const factor = (i === 0 ? 1 : -1) * 12;
                    const yFactor = (i === 0 ? 1 : -1) * 8;
                    box.style.transform = `rotate(${(i === 0 ? -8 : 8) + x * factor}deg) translate(${x * factor}px, ${y * yFactor}px)`;
                });
            });
            heroVisual.addEventListener('mouseleave', () => {
                heroBoxes.forEach((box, i) => {
                    box.style.transform = i === 0
                        ? 'rotate(-8deg) translateX(-50px)'
                        : 'rotate(8deg) translateX(50px) translateY(20px)';
                });
            });
        }
    }

    // ----- Product card subtle tilt -----
    document.querySelectorAll('.product-card, .preorder-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (0.5 - y) * 6;
            const rotateY = (x - 0.5) * 6;
            card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ----- Gallery item click -----
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const tag = item.querySelector('.gallery-tag')?.textContent || '';
            const text = item.querySelector('.gallery-text')?.textContent || '';
            console.log('Gallery item clicked:', tag, text);
        });
    });

    // ----- Active nav link highlighting -----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function updateActiveLink() {
        let current = '';
        const scrollPos = window.pageYOffset + 200;
        sections.forEach(section => {
            if (scrollPos >= section.offsetTop) {
                current = section.id;
            }
        });
        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = '#ffd700';
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // ----- Day-card click → scroll to book -----
    document.querySelectorAll('.day-card:not(.day-card-closed)').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('a, button')) return;
            const dayName = card.querySelector('.day-name')?.textContent.toLowerCase() || '';
            const dayMap = {
                'mon': 'mon', 'tue': 'tue', 'wed': 'wed',
                'thu': 'thu', 'fri': 'fri', 'sat': 'sat'
            };
            const dayValue = dayMap[dayName];
            const select = document.querySelector('select[name="day"]');
            if (select && dayValue) {
                select.value = dayValue;
            }
            const book = document.getElementById('book');
            if (book) {
                const navHeight = nav.offsetHeight;
                const targetPosition = book.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ----- Image lazy load fallback -----
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imgObserver.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
    }

    // ----- Year auto-update -----
    const yearEl = document.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ----- Console signature -----
    console.log('%cSALON POKE', 'color:#ffd700;font-size:18px;font-weight:bold;letter-spacing:2px;');
    console.log('%cBristol\'s home for sealed Japanese Pokemon TCG.', 'color:#888;font-size:12px;');

    // Public API
    return {
        handleBooking,
        handleNewsletter
    };
})();
/* ============================================
   SALON POKE �� V2 ADDITIONS (100% Complete)
   ============================================ */

// ----- Open Now live status (reads from siteData so admin edits apply) -----
// Default opening hours — overridden by siteData.openingHours if available
function getDefaultHours() {
    return {
        monThuOpen: '11:00', monThuClose: '19:00',
        friOpen: '11:00', friClose: '22:00',
        satOpen: '11:00', satClose: '19:00',
        sunNote: 'Closed (Private Hire Only)'
    };
}
function parseHM(t) {
    if (!t || typeof t !== 'string' || t.indexOf(':') < 0) return null;
    var p = t.split(':');
    var h = parseInt(p[0], 10);
    var m = parseInt(p[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
}
function fmtHM(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
function getOpenCloseForDay(weekday, hours) {
    var h = hours || getDefaultHours();
    switch (weekday) {
        case 'mon': case 'tue': case 'wed': case 'thu':
            return { open: parseHM(h.monThuOpen), close: parseHM(h.monThuClose) };
        case 'fri':
            return { open: parseHM(h.friOpen), close: parseHM(h.friClose) };
        case 'sat':
            return { open: parseHM(h.satOpen), close: parseHM(h.satClose) };
        case 'sun':
            return { open: -1, close: -1 };
    }
    return null;
}
function updateOpenNow() {
    var badge = document.getElementById('openNowBadge');
    var textEl = document.getElementById('openNowText');
    if (!badge || !textEl) return;

    var hours = (window.salonPokeData && window.salonPokeData.openingHours) || getDefaultHours();
    var now = new Date();
    var ukParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    var weekday = '', hour = 0, minute = 0;
    ukParts.forEach(function (p) {
        if (p.type === 'weekday') weekday = p.value.toLowerCase();
        if (p.type === 'hour') hour = parseInt(p.value, 10);
        if (p.type === 'minute') minute = parseInt(p.value, 10);
    });
    var nowMinutes = hour * 60 + minute;

    var slot = getOpenCloseForDay(weekday, hours);
    var open = false, closesAt = '';
    if (slot && slot.open >= 0) {
        open = nowMinutes >= slot.open && nowMinutes < slot.close;
        closesAt = fmtHM(slot.close);
    }

    if (open) {
        badge.classList.remove('is-closed');
        textEl.textContent = 'Open · until ' + closesAt;
    } else {
        badge.classList.add('is-closed');
        if (weekday === 'sun') {
            textEl.textContent = (hours.sunNote || 'Closed').replace(/\s*\(.*\)/, '');
        } else {
            var order = ['mon','tue','wed','thu','fri','sat','sun'];
            var cur = order.indexOf(weekday);
            var nextOpen = '';
            for (var i = 1; i <= 7; i++) {
                var idx = (cur + i) % 7;
                var d = order[idx];
                if (d === 'sun') continue;
                var slot2 = getOpenCloseForDay(d, hours);
                if (!slot2 || slot2.open < 0) continue;
                var label2 = d.charAt(0).toUpperCase() + d.slice(1);
                if (i === 1 && slot && slot.open >= 0 && nowMinutes < slot.open) {
                    nextOpen = 'today ' + fmtHM(slot.open);
                    break;
                }
                nextOpen = label2 + ' ' + fmtHM(slot2.open);
                break;
            }
            textEl.textContent = 'Closed · opens ' + (nextOpen || 'Mon 11:00');
        }
    }
}
// Initial paint + interval — also re-run when data loads
updateOpenNow();
setInterval(updateOpenNow, 60000);
document.addEventListener('salonpoke:dataLoaded', function () { updateOpenNow(); });

// ----- Legal tabs -----
document.querySelectorAll('.legal-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.legal-tab').forEach(b => b.classList.remove('legal-tab-active'));
        document.querySelectorAll('.legal-panel').forEach(p => p.classList.remove('legal-panel-active'));
        btn.classList.add('legal-tab-active');
        const panel = document.querySelector('[data-panel="' + tab + '"]');
        if (panel) panel.classList.add('legal-panel-active');
    });
});

// ----- Footer legal links -> activate tab -----
document.querySelectorAll('[data-legal-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        const tab = link.dataset.legalTab;
        // Wait for smooth scroll, then activate tab
        setTimeout(() => {
            const tabBtn = document.querySelector('[data-tab="' + tab + '"]');
            if (tabBtn) tabBtn.click();
        }, 600);
    });
});

// ----- Back to top button -----
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    function updateBackToTop() {
        if (window.pageYOffset > 600) backToTop.classList.add('is-visible');
        else backToTop.classList.remove('is-visible');
    }
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================
   SALON POKE — V3 DYNAMIC DATA SYSTEM
   Loads data.json + merges localStorage overrides
   Renders products, schedule, pre-order from data
   ============================================ */

const DATA_KEY = 'salonPokeData';

function getDeep(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
}

function loadSiteData() {
    return fetch('data.json?_=' + Date.now())
        .then(function (r) { return r.json(); })
        .then(function (defaultData) {
            var overrides = {};
            try { overrides = JSON.parse(localStorage.getItem(DATA_KEY) || '{}'); } catch (e) { overrides = {}; }
            return mergeDeep(defaultData, overrides);
        })
        .catch(function () {
            try {
                var stored = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
                return stored || null;
            } catch (e) { return null; }
        });
}

function mergeDeep(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
            if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
                target[k] = mergeDeep(target[k] || {}, source[k]);
            } else {
                target[k] = source[k];
            }
        }
    }
    return target;
}

function renderHeroStats(stats) {
    var el = document.getElementById('heroStats');
    if (!el || !stats) return;
    var html = '';
    for (var i = 0; i < stats.length; i++) {
        var s = stats[i];
        html += '<div class="stat"><div class="stat-num">' + s.value + '</div><div class="stat-label">' + s.label + '</div></div>';
    }
    el.innerHTML = html;
}

function renderProducts(products) {
    var grid = document.getElementById('shopGrid');
    if (!grid || !products) return;
    var html = '';
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var badgeClass = p.tier === 'TOP' ? '' : (p.tier === 'CLASSIC' ? 'badge-mid' : 'badge-entry');
        var productHotClass = p.featured ? ' product-hot' : '';
        var stockHtml = '';
        if (p.stockStatus === 'out') {
            stockHtml = '<div class="stock-badge stock-out">Sold Out</div>';
        } else if (p.stockStatus === 'low' && p.stock > 0 && p.stock < 10) {
            stockHtml = '<div class="stock-badge stock-low">Only ' + p.stock + ' left</div>';
        } else if (p.stock > 0) {
            stockHtml = '<div class="stock-badge stock-in">In Stock</div>';
        }
        var imgHtml = p.img
            ? '<img src="' + p.img + '" alt="' + p.alt + '" class="product-img">' + stockHtml
            : '<div class="product-img-placeholder"><div class="placeholder-text">' + p.name + '<br><span>' + p.code + '</span></div></div>';
        var ctaClass = p.featured ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
        var ctaText = p.featured ? ('Hold One — £' + p.price) : 'Hold One';
        var codeHtml = p.code + (p.jpCode ? (' · ' + p.jpCode) : '');
        html += '<article class="product-card' + productHotClass + '">';
        html += '  <div class="product-badge ' + badgeClass + '">' + p.badgeText + '</div>';
        html += '  <div class="product-img-wrap">' + imgHtml + '</div>';
        html += '  <div class="product-info">';
        html += '    <div class="product-code">' + codeHtml + '</div>';
        html += '    <h3 class="product-name">' + p.name + '</h3>';
        if (p.jpName) html += '    <div class="product-jp">' + p.jpName + '</div>';
        html += '    <p class="product-desc">' + p.desc + '</p>';
        html += '    <a href="#book" class="' + ctaClass + '">' + ctaText + '</a>';
        html += '  </div>';
        html += '</article>';
    }
    grid.innerHTML = html;
}

function formatTime12(t) {
    if (!t) return '';
    var parts = t.split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1] || '00';
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + m + ' ' + suffix;
}

function renderSchedule(schedule) {
    var grid = document.getElementById('weekGrid');
    if (!grid || !schedule) return;
    var html = '';
    for (var i = 0; i < schedule.length; i++) {
        var d = schedule[i];
        var cardClass = 'day-card';
        if (d.isFeatured) cardClass += ' day-card-featured';
        if (d.isClosed) cardClass += ' day-card-closed';
        html += '<div class="' + cardClass + '" data-day="' + d.day.toLowerCase() + '">';
        html += '  <div class="day-head">';
        html += '    <div class="day-name">' + d.day + '</div>';
        html += '    <div class="day-num">' + d.dayNum + '</div>';
        if (d.isFeatured) html += '    <div class="day-flag">★ SIGNATURE</div>';
        html += '  </div>';
        html += '  <div class="day-theme ' + d.themeClass + '">';
        html += '    <div class="day-theme-kicker">' + d.kicker + '</div>';
        html += '    <div class="day-theme-title">' + d.theme + '</div>';
        html += '    <div class="day-theme-jp">' + d.jpTheme + '</div>';
        html += '  </div>';
        var timeText = d.startTime;
        if (d.endTime && d.endTime.indexOf(':') > -1) {
            timeText = formatTime12(d.startTime) + ' – ' + formatTime12(d.endTime);
            if (d.sessionNote) timeText += ' (' + d.sessionNote + ')';
        } else if (d.endTime) {
            timeText += ' – ' + d.endTime;
        }
        html += '  <div class="day-meta">';
        html += '    <div class="day-time">' + timeText + '</div>';
        var capSuffix = d.isClosed ? 'pax min' : 'seats';
        html += '    <div class="day-cap"><span>' + d.seats + '</span> ' + capSuffix + '</div>';
        html += '  </div>';
        html += '  <div class="day-price">';
        if (d.singlePrice) html += '    <span class="day-price-item"><b>£' + d.singlePrice + '</b> single</span>';
        if (d.bundlePrice) html += '    <span class="day-price-item"><b>£' + d.bundlePrice + '</b> bundle</span>';
        if (d.boxPrice) html += '    <span class="day-price-item"><b>£' + d.boxPrice + '</b> box</span>';
        if (d.entryPrice && d.isClosed) {
            html += '    <span class="day-price-item"><b>From £' + d.entryPrice + '</b> group</span>';
        } else if (d.entryPrice && !d.singlePrice && !d.bundlePrice && !d.boxPrice) {
            html += '    <span class="day-price-item"><b>£' + d.entryPrice + '</b> entry</span>';
            html += '    <span class="day-price-item"><b>+packs</b></span>';
        }
        html += '  </div>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

function renderPreorder(items, deposit) {
    var grid = document.getElementById('preorderGrid');
    if (!grid || !items) return;
    var html = '';
    for (var i = 0; i < items.length; i++) {
        var p = items[i];
        var cardClass = 'preorder-card';
        if (p.isUpcoming) cardClass += ' preorder-upcoming';
        var ctaClass = p.isUpcoming ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
        html += '<div class="' + cardClass + '">';
        html += '  <div class="preorder-badge">' + p.badge + '</div>';
        html += '  <div class="preorder-img-wrap">';
        if (p.img) html += '    <img src="' + p.img + '" alt="' + p.alt + '" class="product-img">';
        html += '  </div>';
        html += '  <div class="preorder-info">';
        html += '    <div class="preorder-code">' + p.code + (p.jpCode ? (' · ' + p.jpCode) : '') + '</div>';
        html += '    <h3>' + p.name + '</h3>';
        html += '    <div class="preorder-jp">' + p.jpName + '</div>';
        html += '    <p>' + p.desc + '</p>';
        html += '    <div class="preorder-stock">';
        html += '      <span class="preorder-stock-bar"><span style="width:' + p.reservedPct + '%"></span></span>';
        html += '      <span class="preorder-stock-text">' + p.reservedPct + '% reserved</span>';
        html += '    </div>';
        html += '    <a href="#book" class="' + ctaClass + '">Reserve · £' + deposit + ' deposit</a>';
        html += '  </div>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

function renderPromoBanner(promo) {
    var el = document.getElementById('promoBanner');
    if (!el || !promo) return;
    if (promo.enabled && promo.text) {
        el.style.display = 'flex';
        document.getElementById('promoBannerText').textContent = promo.text;
        var ctaEl = document.getElementById('promoBannerCta');
        if (promo.cta && promo.link) {
            ctaEl.textContent = promo.cta;
            ctaEl.href = promo.link;
            ctaEl.style.display = 'inline-flex';
        } else {
            ctaEl.style.display = 'none';
        }
    } else {
        el.style.display = 'none';
    }
}

function applyDataCfgElements(data) {
    var els = document.querySelectorAll('[data-cfg]');
    for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var path = el.getAttribute('data-cfg');
        var prefix = el.getAttribute('data-cfg-prefix') || '';
        var val = getDeep(data, path);
        if (val !== undefined && val !== null) {
            el.textContent = prefix + val;
        }
    }
}

function applyOpeningHours(data) {
    var el = document.getElementById('locHours');
    if (!el || !data.openingHours) return;
    var h = data.openingHours;
    el.innerHTML =
        '<b>Mon – Thu</b> · ' + h.monThuOpen + ' – ' + h.monThuClose + '<br>' +
        '<b>Friday</b> · ' + h.friOpen + ' – ' + h.friClose + (h.friPackNote ? ' (' + h.friPackNote + ')' : '') + '<br>' +
        '<b>Saturday</b> · ' + h.satOpen + ' – ' + h.satClose + (h.satPackNote ? ' (' + h.satPackNote + ')' : '') + '<br>' +
        '<b>Sunday</b> · ' + h.sunNote;
}

function applyAddress(data) {
    var el = document.getElementById('locAddress');
    if (!el || !data.siteMeta) return;
    el.innerHTML = data.siteMeta.address + '<br>' + data.siteMeta.city + ' ' + data.siteMeta.country + ' ' + data.siteMeta.postcode;
}

function applyContactBlock(data) {
    var el = document.getElementById('locContact');
    if (!el || !data.siteMeta) return;
    var s = data.siteMeta;
    el.innerHTML =
        '<a href="' + s.instagramUrl + '" target="_blank" rel="noopener" class="location-link">Instagram · ' + s.instagramHandle + '</a><br>' +
        '<a href="https://wa.me/' + s.whatsappRaw + '" target="_blank" rel="noopener" class="location-link">WhatsApp · ' + s.phoneDisplay + '</a><br>' +
        '<a href="mailto:' + s.emailPublic + '" class="location-link">' + s.emailPublic + '</a><br>' +
        '<a href="mailto:' + s.emailBookings + '" class="location-link">' + s.emailBookings + ' (reservations)</a>';
}

function applyMap(data) {
    var el = document.getElementById('locMap');
    if (!el || !data.siteMeta) return;
    var addr = encodeURIComponent(data.siteMeta.address + ' ' + data.siteMeta.city + ' ' + data.siteMeta.postcode + ' ' + data.siteMeta.country);
    el.src = 'https://www.google.com/maps?q=' + addr + '&output=embed';
}

// Main init
loadSiteData().then(function (data) {
    if (!data) {
        console.warn('[Salon Poke] Could not load data.json — using static defaults.');
        return;
    }
    window.salonPokeData = data;
    renderHeroStats(data.hero && data.hero.stats);
    renderProducts(data.products);
    renderSchedule(data.schedule);
    renderPreorder(data.preorder, data.pricing ? data.pricing.preorderDeposit : 20);
    renderPromoBanner(data.promo);
    applyDataCfgElements(data);
    applyOpeningHours(data);
    applyAddress(data);
    applyContactBlock(data);
    applyMap(data);
    if (typeof renderPreorderCountdowns === 'function') renderPreorderCountdowns(data);
    document.dispatchEvent(new CustomEvent('salonpoke:dataLoaded', { detail: data }));
    // Hide loading screen once data is rendered
    setTimeout(function() {
        var ls = document.getElementById('loadingScreen');
        if (ls) {
            ls.classList.add('is-hidden');
            setTimeout(function() { if (ls.parentNode) ls.parentNode.removeChild(ls); }, 600);
        }
    }, 250);
});

/* ============================================
   V5 ADDITIONS — 100% TCG Card Store features
   ============================================ */

// ----- Mobile menu toggle -----
(function () {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    function close() {
        links.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('nav-open');
    }
    function open() {
        links.classList.add('is-open');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('nav-open');
    }
    toggle.addEventListener('click', function () {
        if (links.classList.contains('is-open')) close();
        else open();
    });
    // Close on link click (mobile)
    links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { if (window.innerWidth < 1024) close(); });
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    // Reset on resize to desktop
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) close(); });
})();

// ----- Cookie consent (UK GDPR) -----
(function () {
    var KEY = 'salonpoke.cookies.v1';
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (!saved) {
        // Show after 1.5s delay so it doesn't fight the loading screen
        setTimeout(function () { banner.hidden = false; banner.classList.add('is-visible'); }, 1500);
    }
    function dismiss(value) {
        try { localStorage.setItem(KEY, value); } catch (e) {}
        banner.classList.remove('is-visible');
        setTimeout(function () { banner.hidden = true; }, 400);
    }
    var accept = document.getElementById('cookieAccept');
    var reject = document.getElementById('cookieReject');
    if (accept) accept.addEventListener('click', function () { dismiss('accepted'); });
    if (reject) reject.addEventListener('click', function () { dismiss('necessary'); });
})();

// ----- Booking form: real handler (opens WhatsApp with prefilled message) -----
function handleBookingReal(e) {
    if (e && e.preventDefault) e.preventDefault();
    var form = (e && e.target) || document.querySelector('.book-form');
    if (!form) return;
    var data = {};
    try { data = Object.fromEntries(new FormData(form).entries()); } catch (err) { return; }

    var dayMap = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday (Black Bolt · Signature)', sat: 'Saturday (Community)', sun: 'Sunday (Private Hire)' };
    var planMap = { single: 'Single Pack £8', bundle: '3-Pack Bundle £24', box: 'Full Box', byo: 'BYO £15' };

    var lines = [];
    lines.push('Hi Salon Poke! I\'d like to book a seat:');
    lines.push('');
    lines.push('Name: ' + (data.name || '-'));
    lines.push('Email: ' + (data.email || '-'));
    if (data.phone) lines.push('Phone: ' + data.phone);
    lines.push('Date: ' + (data.date || '-'));
    lines.push('Night: ' + (dayMap[data.day] || data.day || '-'));
    lines.push('Plan: ' + (planMap[data.plan] || data.plan || '-'));
    lines.push('Party size: ' + (data.party || '1'));
    if (data.notes) { lines.push(''); lines.push('Notes: ' + data.notes); }

    var msg = encodeURIComponent(lines.join('\n'));
    var waUrl = 'https://wa.me/441175550182?text=' + msg;
    var mailto = 'mailto:book@salonpoke.co.uk?subject=' + encodeURIComponent('Booking request from ' + (data.name || 'website')) + '&body=' + msg;

    // Show success in form
    var btn = form.querySelector('button[type="submit"]');
    var orig = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Opening WhatsApp…'; btn.disabled = true; }
    var successEl = form.querySelector('.form-success');
    if (!successEl) {
        successEl = document.createElement('div');
        successEl.className = 'form-success';
        form.appendChild(successEl);
    }
    successEl.innerHTML = '✓ Booking captured. Opening WhatsApp to confirm with the team — if it does not open, <a href="' + mailto + '" class="link-accent">email us instead</a> or call <a href="tel:+441175550182" class="link-accent">+44 117 555 0182</a>.';
    successEl.classList.add('show');

    // Open WhatsApp in new tab
    try { window.open(waUrl, '_blank', 'noopener'); } catch (err) { window.location.href = waUrl; }

    // Save to localStorage for record
    try {
        var saved = JSON.parse(localStorage.getItem('salonpoke.bookings') || '[]');
        saved.push({ ts: new Date().toISOString(), data: data });
        localStorage.setItem('salonpoke.bookings', JSON.stringify(saved.slice(-50)));
    } catch (err) {}

    setTimeout(function () {
        if (btn) { btn.textContent = orig; btn.disabled = false; }
        form.reset();
        // Re-set default date
        var di = form.querySelector('input[type="date"][name="date"]');
        if (di) {
            var t = new Date();
            di.value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
        }
        var rb = form.querySelector('input[name="plan"][value="bundle"]');
        if (rb) rb.checked = true;
    }, 4000);

    return false;
}

// ----- Newsletter: real handler (mailto to admin + localStorage) -----
function handleNewsletterReal(e) {
    if (e && e.preventDefault) e.preventDefault();
    var form = (e && e.target) || document.querySelector('.newsletter-form');
    if (!form) return;
    var input = form.querySelector('input[type="email"]');
    var btn = form.querySelector('button[type="submit"]');
    var email = (input && input.value || '').trim();
    if (!email || email.indexOf('@') < 1) {
        if (input) input.focus();
        return false;
    }
    var orig = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }

    // Save subscriber locally
    try {
        var subs = JSON.parse(localStorage.getItem('salonpoke.subscribers') || '[]');
        if (subs.indexOf(email) < 0) { subs.push(email); localStorage.setItem('salonpoke.subscribers', JSON.stringify(subs)); }
    } catch (err) {}

    // Email notify admin
var mailto = 'mailto:hello@salonpoke.co.uk?subject=' + encodeURIComponent('Newsletter signup: ' + email) + '&body=' + encodeURIComponent('New newsletter subscriber:\n' + email + '\n\nTimestamp: ' + new Date().toISOString());
    setTimeout(function () {
        if (btn) { btn.textContent = 'Subscribed ✓'; btn.style.background = 'linear-gradient(135deg, #4ddb8e, #2eb872)'; }
        if (input) input.value = '';
        setTimeout(function () {
            if (btn) { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }
        }, 3000);
        // Optionally open email (comment out to be less intrusive)
        // window.location.href = mailto;
    }, 600);
    return false;
}

// Replace the simulated handlers with real ones
if (window.salonPoke) {
    window.salonPoke.handleBooking = handleBookingReal;
    window.salonPoke.handleNewsletter = handleNewsletterReal;
}
// Also rebind via attribute (in case onsubmit fired before this script ran)
document.querySelectorAll('form.book-form, form.newsletter-form').forEach(function (f) {
    f.onsubmit = null;
});

// ----- Pre-order countdown timer -----
function renderPreorderCountdowns(data) {
    if (!data || !data.preorder) return;
    var now = new Date();
    data.preorder.forEach(function (p) {
        var card = document.querySelector('[data-preorder-id="' + p.id + '"]');
        if (!card) return;
        var counterEl = card.querySelector('[data-preorder-countdown]');
        if (!counterEl) return;
        // Try to parse releaseDate
        var parts = (p.releaseDate || '').split(' ');
        var day = parseInt(parts[0], 10);
        var monthMap = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
        var mon = parts[1] ? monthMap[parts[1]] : null;
        var yr = parts[2] ? parseInt(parts[2], 10) : now.getFullYear();
        if (isNaN(day) || mon === null || isNaN(yr)) return;
        var release = new Date(yr, mon, day, 9, 0, 0);
        var diff = release - now;
        function tick() {
            var d = release - new Date();
            if (d <= 0) { counterEl.textContent = 'Released!'; counterEl.classList.add('is-released'); return; }
            var days = Math.floor(d / 86400000);
            var hours = Math.floor((d % 86400000) / 3600000);
            var mins = Math.floor((d % 3600000) / 60000);
            counterEl.textContent = 'Drops in ' + days + 'd ' + hours + 'h ' + mins + 'm';
        }
        tick();
        if (!card._preorderTimer) card._preorderTimer = setInterval(tick, 60000);
    });
}

// Update active nav indicator to use class instead of inline style
(function () {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;
    function update() {
        var scrollPos = window.pageYOffset + 200;
        var current = '';
        sections.forEach(function (s) { if (scrollPos >= s.offsetTop) current = s.id; });
        navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + current) link.classList.add('is-active');
            else link.classList.remove('is-active');
        });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// Update renderPreorder to add data-preorder-id and countdown element
(function () {
    var orig = window.renderPreorder;
    window.renderPreorder = function (items, deposit) {
        if (orig) orig(items, deposit);
        // After render, attach data-preorder-id and inject countdown slot
        var grid = document.getElementById('preorderGrid');
        if (!grid) return;
        var cards = grid.querySelectorAll('.preorder-card');
        for (var i = 0; i < cards.length && i < items.length; i++) {
            cards[i].setAttribute('data-preorder-id', items[i].id);
            if (!cards[i].querySelector('[data-preorder-countdown]')) {
                var cd = document.createElement('div');
                cd.className = 'preorder-countdown';
                cd.setAttribute('data-preorder-countdown', '');
                cards[i].appendChild(cd);
            }
        }
        if (typeof renderPreorderCountdowns === 'function') renderPreorderCountdowns({ preorder: items });
    };
})();
