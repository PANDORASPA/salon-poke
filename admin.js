/* ============================================
   SALON POKE — Admin Dashboard Logic
   ============================================ */

(function () {
    'use strict';

    const DATA_KEY = 'salonPokeData';
    const AUTH_KEY = 'salonPokeAuth';
    const PASSWORD_KEY = 'salonPokePassword';

    let siteData = null;
    let dirty = false;

    // ----- Default password = salonpoke2026 (overridable via localStorage) -----
    function getPassword() {
        return localStorage.getItem(PASSWORD_KEY) || 'salonpoke2026';
    }
    function setPassword(p) {
        localStorage.setItem(PASSWORD_KEY, p);
    }

    // ----- Session token -----
    function setAuth(token) {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ token: token, ts: Date.now() }));
    }
    function getAuth() {
        try {
            var a = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null');
            if (!a) return null;
            // Expire after 12 hours
            if (Date.now() - a.ts > 12 * 3600 * 1000) {
                sessionStorage.removeItem(AUTH_KEY);
                return null;
            }
            return a;
        } catch (e) { return null; }
    }
    function clearAuth() {
        sessionStorage.removeItem(AUTH_KEY);
    }

    // ----- Toast -----
    function toast(msg, isError) {
        var t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.toggle('error', !!isError);
        t.classList.add('show');
        clearTimeout(t._timer);
        t._timer = setTimeout(function () { t.classList.remove('show'); }, 2400);
    }

    // ----- Login -----
    var loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var pw = document.getElementById('loginPassword').value;
        if (pw === getPassword()) {
            setAuth('ok');
            showApp();
            document.getElementById('loginError').textContent = '';
            document.getElementById('loginPassword').value = '';
        } else {
            document.getElementById('loginError').textContent = '✕ Wrong password';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function () {
        clearAuth();
        document.getElementById('adminApp').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        toast('Logged out');
    });

    // ----- Show app if already logged in -----
    function showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminApp').style.display = 'grid';
        loadDataAndRender();
    }

    if (getAuth()) showApp();

    // ----- Load data -----
    function loadDataAndRender() {
        document.getElementById('statusText').textContent = 'Loading…';
        fetch('data.json?_=' + Date.now())
            .then(function (r) { return r.json(); })
            .then(function (defaultData) {
                var overrides = {};
                try { overrides = JSON.parse(localStorage.getItem(DATA_KEY) || '{}'); } catch (e) {}
                siteData = mergeDeep(defaultData, overrides);
                document.getElementById('statusText').textContent = 'Loaded · saved';
                renderAll();
            })
            .catch(function () {
                siteData = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
                if (!siteData) {
                    toast('Failed to load data.json', true);
                    return;
                }
                document.getElementById('statusText').textContent = 'Loaded from cache';
                renderAll();
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

    // ----- Render all editors -----
    function renderAll() {
        bindSectionNav();
        renderFormInputs();
        renderHeroStats();
        renderProducts();
        renderSchedule();
        renderPreorder();
        renderPromoBanner();
        renderSettings();
        wireTopbar();
    }

    function bindSectionNav() {
        var links = document.querySelectorAll('.sidebar-link');
        links.forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                links.forEach(function (l) { l.classList.remove('active'); });
                a.classList.add('active');
                var sec = a.dataset.section;
                document.querySelectorAll('.admin-section').forEach(function (s) {
                    s.style.display = s.dataset.section === sec ? 'block' : 'none';
                });
                document.getElementById('sectionTitle').textContent = a.textContent.trim();
            });
        });
    }

    // ----- Generic data-cfg input bind -----
    function getDeep(obj, path) {
        return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
    }
    function setDeep(obj, path, value) {
        var parts = path.split('.');
        var cur = obj;
        for (var i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
    }

    function renderFormInputs() {
        var inputs = document.querySelectorAll('input[data-cfg], textarea[data-cfg], select[data-cfg]');
        inputs.forEach(function (el) {
            var path = el.getAttribute('data-cfg');
            var val = getDeep(siteData, path);
            if (val !== undefined && val !== null) el.value = val;
            el.addEventListener('input', function () {
                var v = el.type === 'number' ? parseFloat(el.value) : el.value;
                setDeep(siteData, path, v);
                markDirty();
            });
        });
    }

    function markDirty() {
        dirty = true;
        var el = document.getElementById('saveStatus');
        el.textContent = '● Unsaved changes';
        el.classList.add('unsaved');
    }

    function markClean() {
        dirty = false;
        var el = document.getElementById('saveStatus');
        el.textContent = '✓ All changes saved';
        el.classList.remove('unsaved');
    }

    // ----- Hero stats editor -----
    function renderHeroStats() {
        var container = document.getElementById('heroStatsEditor');
        container.innerHTML = '';
        if (!siteData.hero || !siteData.hero.stats) return;
        siteData.hero.stats.forEach(function (s, idx) {
            var row = document.createElement('div');
            row.className = 'stat-row';
            row.innerHTML =
                '<div class="form-group"><label>Value</label><input type="text" data-stat-idx="' + idx + '" data-stat-field="value"></div>' +
                '<div class="form-group"><label>Label</label><input type="text" data-stat-idx="' + idx + '" data-stat-field="label"></div>';
            container.appendChild(row);
            row.querySelector('[data-stat-field="value"]').value = s.value;
            row.querySelector('[data-stat-field="label"]').value = s.label;
        });
        container.querySelectorAll('input').forEach(function (inp) {
            inp.addEventListener('input', function () {
                var idx = parseInt(inp.dataset.statIdx, 10);
                var field = inp.dataset.statField;
                siteData.hero.stats[idx][field] = inp.value;
                markDirty();
            });
        });
    }

    // ----- Products editor -----
    function renderProducts() {
        var container = document.getElementById('productsEditor');
        container.innerHTML = '';
        if (!siteData.products) return;
        siteData.products.forEach(function (p, idx) {
            var row = document.createElement('div');
            row.className = 'product-row';
            row.innerHTML =
                '<div class="form-group"><label>Name</label><input type="text" data-p-idx="' + idx + '" data-p-field="name"></div>' +
                '<div class="form-group"><label>JP Name</label><input type="text" data-p-idx="' + idx + '" data-p-field="jpName"></div>' +
                '<div class="form-group"><label>Code</label><input type="text" data-p-idx="' + idx + '" data-p-field="code"></div>' +
                '<div class="form-group"><label>Tier</label><select data-p-idx="' + idx + '" data-p-field="tier"><option value="TOP">TOP</option><option value="CLASSIC">CLASSIC</option><option value="ENTRY">ENTRY</option></select></div>' +
                '<div class="form-group"><label>Price (£)</label><input type="number" min="0" step="1" data-p-idx="' + idx + '" data-p-field="price"></div>' +
                '<div class="form-group"><label>Stock</label><input type="number" min="0" step="1" data-p-idx="' + idx + '" data-p-field="stock"></div>' +
                '<div class="form-group"><label>Status</label><select data-p-idx="' + idx + '" data-p-field="stockStatus"><option value="in">In Stock</option><option value="low">Low</option><option value="out">Sold Out</option></select></div>' +
                '<div class="form-group" style="grid-column:1/-1;"><label>Description</label><input type="text" data-p-idx="' + idx + '" data-p-field="desc"></div>' +
                '<div class="form-group" style="grid-column:1/-1;"><label>Badge Text</label><input type="text" data-p-idx="' + idx + '" data-p-field="badgeText"></div>' +
                '<div class="form-group"><label>Featured?</label><select data-p-idx="' + idx + '" data-p-field="featured"><option value="true">Yes</option><option value="false">No</option></select></div>' +
                '<div class="form-group"><label>Image filename</label><input type="text" data-p-idx="' + idx + '" data-p-field="img"></div>';
            container.appendChild(row);
            ['name','jpName','code','tier','price','stock','stockStatus','desc','badgeText','featured','img'].forEach(function (f) {
                var el = row.querySelector('[data-p-field="' + f + '"]');
                if (!el) return;
                var v = p[f];
                if (f === 'featured') v = v ? 'true' : 'false';
                el.value = v !== undefined && v !== null ? v : '';
                el.addEventListener('input', function () {
                    var val = el.value;
                    if (f === 'price' || f === 'stock') val = parseFloat(val) || 0;
                    if (f === 'featured') val = val === 'true';
                    siteData.products[idx][f] = val;
                    markDirty();
                });
                el.addEventListener('change', function () {
                    el.dispatchEvent(new Event('input'));
                });
            });
        });
    }

    // ----- Schedule editor -----
    function renderSchedule() {
        var container = document.getElementById('scheduleEditor');
        container.innerHTML = '';
        if (!siteData.schedule) return;
        siteData.schedule.forEach(function (d, idx) {
            var row = document.createElement('div');
            row.className = 'day-row';
            row.innerHTML =
                '<div class="form-group"><label>Day</label><input type="text" data-d-idx="' + idx + '" data-d-field="day"></div>' +
                '<div class="form-group"><label>Kicker</label><input type="text" data-d-idx="' + idx + '" data-d-field="kicker"></div>' +
                '<div class="form-group"><label>Theme</label><input type="text" data-d-idx="' + idx + '" data-d-field="theme"></div>' +
                '<div class="form-group"><label>Start (HH:MM)</label><input type="time" data-d-idx="' + idx + '" data-d-field="startTime"></div>' +
                '<div class="form-group"><label>End (HH:MM)</label><input type="time" data-d-idx="' + idx + '" data-d-field="endTime"></div>' +
                '<div class="form-group"><label>Seats</label><input type="number" min="0" data-d-idx="' + idx + '" data-d-field="seats"></div>' +
                '<div class="form-group"><label>Single (£)</label><input type="number" min="0" data-d-idx="' + idx + '" data-d-field="singlePrice"></div>' +
                '<div class="form-group"><label>Bundle (£)</label><input type="number" min="0" data-d-idx="' + idx + '" data-d-field="bundlePrice"></div>' +
                '<div class="form-group"><label>Box (£)</label><input type="number" min="0" data-d-idx="' + idx + '" data-d-field="boxPrice"></div>' +
                '<div class="form-group"><label>Entry (£)</label><input type="number" min="0" data-d-idx="' + idx + '" data-d-field="entryPrice"></div>' +
                '<div class="form-group"><label>Featured?</label><select data-d-idx="' + idx + '" data-d-field="isFeatured"><option value="true">★</option><option value="false">—</option></select></div>' +
                '<div class="form-group"><label>Closed?</label><select data-d-idx="' + idx + '" data-d-field="isClosed"><option value="true">Yes</option><option value="false">No</option></select></div>';
            container.appendChild(row);
            ['day','kicker','theme','startTime','endTime','seats','singlePrice','bundlePrice','boxPrice','entryPrice','isFeatured','isClosed'].forEach(function (f) {
                var el = row.querySelector('[data-d-field="' + f + '"]');
                if (!el) return;
                var v = d[f];
                if (f === 'isFeatured' || f === 'isClosed') v = v ? 'true' : 'false';
                if (f === 'seats' || f === 'singlePrice' || f === 'bundlePrice' || f === 'boxPrice' || f === 'entryPrice') v = (v === null || v === undefined) ? '' : v;
                el.value = v !== undefined && v !== null ? v : '';
                el.addEventListener('input', function () {
                    var val = el.value;
                    if (['seats','singlePrice','bundlePrice','boxPrice','entryPrice'].indexOf(f) > -1) {
                        val = val === '' ? null : (parseFloat(val) || 0);
                    }
                    if (f === 'isFeatured' || f === 'isClosed') val = val === 'true';
                    siteData.schedule[idx][f] = val;
                    markDirty();
                });
                el.addEventListener('change', function () {
                    el.dispatchEvent(new Event('input'));
                });
            });
        });
    }

    // ----- Pre-order editor -----
    function renderPreorder() {
        var container = document.getElementById('preorderEditor');
        container.innerHTML = '';
        if (!siteData.preorder) return;
        siteData.preorder.forEach(function (p, idx) {
            var row = document.createElement('div');
            row.className = 'preorder-row';
            row.innerHTML =
                '<div class="form-group"><label>Name</label><input type="text" data-po-idx="' + idx + '" data-po-field="name"></div>' +
                '<div class="form-group"><label>Code</label><input type="text" data-po-idx="' + idx + '" data-po-field="code"></div>' +
                '<div class="form-group"><label>Release Date Text</label><input type="text" data-po-idx="' + idx + '" data-po-field="badge"></div>' +
                '<div class="form-group"><label>Reserved %</label><input type="number" min="0" max="100" data-po-idx="' + idx + '" data-po-field="reservedPct"></div>' +
                '<div class="form-group"><label>Description</label><input type="text" data-po-idx="' + idx + '" data-po-field="desc"></div>' +
                '<div class="form-group"><label>Upcoming?</label><select data-po-idx="' + idx + '" data-po-field="isUpcoming"><option value="true">★ Highlighted</option><option value="false">—</option></select></div>' +
                '<div class="form-group"><label>Image filename</label><input type="text" data-po-idx="' + idx + '" data-po-field="img"></div>';
            container.appendChild(row);
            ['name','code','badge','reservedPct','desc','isUpcoming','img'].forEach(function (f) {
                var el = row.querySelector('[data-po-field="' + f + '"]');
                if (!el) return;
                var v = p[f];
                if (f === 'isUpcoming') v = v ? 'true' : 'false';
                el.value = v !== undefined && v !== null ? v : '';
                el.addEventListener('input', function () {
                    var val = el.value;
                    if (f === 'reservedPct') val = parseFloat(val) || 0;
                    if (f === 'isUpcoming') val = val === 'true';
                    siteData.preorder[idx][f] = val;
                    markDirty();
                });
                el.addEventListener('change', function () {
                    el.dispatchEvent(new Event('input'));
                });
            });
        });
    }

    // ----- Promo banner -----
    function renderPromoBanner() {
        if (!siteData.promo) siteData.promo = { enabled: false, text: '', cta: '', link: '' };
        var cb = document.getElementById('promoEnabled');
        var txt = document.getElementById('promoText');
        var cta = document.getElementById('promoCta');
        var lnk = document.getElementById('promoLink');
        cb.checked = !!siteData.promo.enabled;
        txt.value = siteData.promo.text || '';
        cta.value = siteData.promo.cta || '';
        lnk.value = siteData.promo.link || '';
        [cb, txt, cta, lnk].forEach(function (el) {
            el.addEventListener('input', function () {
                siteData.promo.enabled = cb.checked;
                siteData.promo.text = txt.value;
                siteData.promo.cta = cta.value;
                siteData.promo.link = lnk.value;
                markDirty();
            });
        });
    }

    // ----- Settings (password change) -----
    function renderSettings() {
        var btn = document.getElementById('changePasswordBtn');
        btn.addEventListener('click', function () {
            var cur = document.getElementById('currentPassword').value;
            var nw = document.getElementById('newPassword').value;
            var msg = document.getElementById('passwordMsg');
            if (cur !== getPassword()) {
                msg.textContent = '✕ Current password is wrong';
                msg.className = 'form-note error';
                return;
            }
            if (nw.length < 6) {
                msg.textContent = '✕ New password must be at least 6 characters';
                msg.className = 'form-note error';
                return;
            }
            setPassword(nw);
            msg.textContent = '✓ Password updated. Remember it!';
            msg.className = 'form-note success';
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
        });

        document.getElementById('exportBtn2').addEventListener('click', exportJson);
        document.getElementById('importInput2').addEventListener('change', importJson);
        document.getElementById('resetBtn2').addEventListener('click', resetAll);
    }

    // ----- Topbar buttons -----
    function wireTopbar() {
        document.getElementById('saveBtn').addEventListener('click', saveAll);
        document.getElementById('exportBtn').addEventListener('click', exportJson);
        document.getElementById('importInput').addEventListener('change', importJson);
        document.getElementById('resetBtn').addEventListener('click', resetAll);
    }

    function saveAll() {
        try {
            localStorage.setItem(DATA_KEY, JSON.stringify(siteData));
            markClean();
            toast('✓ Saved — refresh public site to see changes');
        } catch (e) {
            toast('Save failed: ' + e.message, true);
        }
    }

    function exportJson() {
        var blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'salon-poke-data-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('✓ Exported data.json');
    }

    function importJson(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            try {
                var data = JSON.parse(ev.target.result);
                siteData = data;
                localStorage.setItem(DATA_KEY, JSON.stringify(siteData));
                renderAll();
                markClean();
                toast('✓ Imported — all sections updated');
            } catch (err) {
                toast('Import failed: invalid JSON', true);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    function resetAll() {
        if (!confirm('Reset ALL changes back to defaults? This cannot be undone.')) return;
        localStorage.removeItem(DATA_KEY);
        location.reload();
    }

    // ----- Auto-save on Ctrl+S -----
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveAll();
        }
    });

    // Warn if leaving with unsaved changes
    window.addEventListener('beforeunload', function (e) {
        if (dirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

})();