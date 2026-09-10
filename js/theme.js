const DEV_MODE = true; 

const SHADOW_MODES = [
    { id: 'inset', nameKey: 'shadow_inset', name: 'Bóng Chìm', template: 'inset {x}px {y}px {b}px {s}px {c}' },
    { id: 'outer', nameKey: 'shadow_outer', name: 'Bóng Ngoài', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'soft',  nameKey: 'shadow_soft',  name: 'Mờ Diện Rộng', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'hard',  nameKey: 'shadow_hard',  name: 'Nổi Khối 3D', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'glow',  nameKey: 'shadow_glow',  name: 'Phát Sáng', template: '0px 0px {b}px {s}px {c}' }
];

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.warn('localStorage.setItem failed:', key, e);
        return false;
    }
}
function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const shadowContainer = document.getElementById('shadow-controls');
    const mainContainer = document.getElementById('main-container');
    const introScreen = document.getElementById('intro-screen');
    const introTextWrapper = document.getElementById('intro-text-wrapper');

    if (introTextWrapper) {
        const effects = ['anim-wave', 'anim-bounce', 'anim-flip'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        introTextWrapper.classList.add(randomEffect);
    }

    if (mainContainer) mainContainer.classList.add('intro-zoom');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (introScreen) {
                introScreen.classList.add('dismiss'); 
                if (mainContainer) mainContainer.classList.remove('intro-zoom'); 
                setTimeout(() => { introScreen.style.display = 'none'; }, 1500); 
            }
        }, 3000); 
    });

    if (!DEV_MODE) document.body.classList.add('standard-mode');

    const badgePreset = document.getElementById('badge-preset');
    const badgeTheme = document.getElementById('badge-theme');
    
    if (safeGetItem('sttv_seen_preset_badge') === 'true') badgePreset?.classList.add('hidden');
    if (safeGetItem('sttv_seen_theme_badge') === 'true') badgeTheme?.classList.add('hidden');

    document.querySelectorAll('input[type="range"]').forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.flex = '1';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.width = '100%';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const tooltip = document.createElement('div');
        tooltip.className = 'slider-tooltip';
        tooltip.innerText = input.value;
        wrapper.appendChild(tooltip);

        const updateTooltip = () => {
            tooltip.innerText = input.value;
            tooltip.classList.add('show');
            const min = input.min ? parseFloat(input.min) : 0;
            const max = input.max ? parseFloat(input.max) : 100;
            const val = parseFloat(input.value);
            let percent = ((val - min) / (max - min)) * 100;
            if (percent < 5) percent = 5;
            if (percent > 95) percent = 95;
            tooltip.style.left = `calc(${percent}% - 12px)`;
        };

        input.addEventListener('input', updateTooltip);
        input.addEventListener('pointerup', () => tooltip.classList.remove('show'));
        input.addEventListener('touchend', () => tooltip.classList.remove('show'));
        input.addEventListener('blur', () => tooltip.classList.remove('show'));
        input.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
    });

    if (shadowContainer) {
        SHADOW_MODES.forEach(mode => {
            const div = document.createElement('div');
            div.className = 'shadow-item dev-only';
            div.innerHTML = `
                <div class="shadow-header">
                    <span data-i18n="${mode.nameKey}">${mode.name}</span>
                    <input type="checkbox" name="active_shadow" value="${mode.id}" class="shadow-switch">
                </div>
                <div class="shadow-drawer" id="drawer-${mode.id}">
                    <div class="setting-group"><label data-i18n="slider_x">Trục X</label><input type="range" class="s-x" min="-20" max="20" value="0"></div>
                    <div class="setting-group"><label data-i18n="slider_y">Trục Y</label><input type="range" class="s-y" min="-20" max="20" value="4"></div>
                    <div class="setting-group"><label data-i18n="slider_blur">Độ mờ</label><input type="range" class="s-b" min="0" max="50" value="10"></div>
                    <div class="setting-group"><label data-i18n="slider_spread">Lan rộng</label><input type="range" class="s-s" min="-10" max="30" value="0"></div>
                    <div class="setting-group"><label data-i18n="slider_color">Màu Bóng</label><input type="color" class="s-c" value="#000000"></div>
                    <div class="setting-group"><label data-i18n="slider_opacity">Độ đậm bóng</label><input type="range" class="s-o" min="0" max="100" value="100"></div>
                </div>
            `;
            shadowContainer.appendChild(div);
        });
    }

    function applyShadowI18n() {
        if (!window.i18nData) return;
        document.querySelectorAll('#shadow-controls [data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.i18nData[key]) el.innerText = window.i18nData[key];
        });
    }
    applyShadowI18n();

    document.querySelectorAll('.theme-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
            const val = chip.dataset.value;
            document.querySelectorAll(`.theme-chip[data-value="${val}"]`).forEach(c => c.classList.add('active'));
            const hiddenFrame = document.getElementById('val-theme-frame');
            if (hiddenFrame) hiddenFrame.value = val;
            
            if (badgeTheme) { 
                badgeTheme.classList.add('hidden'); 
                safeSetItem('sttv_seen_theme_badge', 'true'); 
            }
            resetPresetToCustom();
            updateLiveVariables();
        });
    });

    function syncThemePickerVisuals(val) {
        document.querySelectorAll('.theme-chip').forEach(c => {
            if (c.dataset.value === val) c.classList.add('active');
            else c.classList.remove('active');
        });
    }

    const themeModal = document.getElementById('theme-modal');
    const themeOverlay = document.getElementById('theme-overlay');
    const btnMoreThemes = document.getElementById('btn-more-themes');
    const closeThemeModal = document.getElementById('close-theme-modal');

    if (btnMoreThemes && themeModal && themeOverlay) {
        btnMoreThemes.onclick = () => { themeModal.classList.add('show'); themeOverlay.classList.add('show'); };
    }
    if (closeThemeModal && themeModal && themeOverlay) {
        closeThemeModal.onclick = () => { themeModal.classList.remove('show'); themeOverlay.classList.remove('show'); };
    }
    if (themeOverlay && themeModal) {
        themeOverlay.onclick = () => { themeModal.classList.remove('show'); themeOverlay.classList.remove('show'); };
    }

    const presetSelect = document.getElementById('val-theme-preset');
    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            safeSetItem('sttv_activePreset', val);
            if (badgePreset) { 
                badgePreset.classList.add('hidden'); 
                safeSetItem('sttv_seen_preset_badge', 'true'); 
            }
            if (val !== 'none') unpackConfig(val);
        });
    }

    function resetPresetToCustom() {
        if (presetSelect) {
            presetSelect.value = 'none';
            safeSetItem('sttv_activePreset', 'none');
        }
    }

    const drawerEl = document.getElementById('settings-drawer');
    const popupAnimSelect = document.getElementById('val-popup-anim');
    if (popupAnimSelect && drawerEl) {
        popupAnimSelect.addEventListener('change', (e) => {
            const animClass = e.target.value;
            drawerEl.className = 'settings-drawer ' + (drawerEl.classList.contains('open') ? 'open ' : '') + (animClass !== 'default' ? animClass : '');
            safeSetItem('sttv_popupAnim', animClass);
        });
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    function playTick() {
        const toggleAudio = document.getElementById('toggle-audio');
        if (!toggleAudio || !toggleAudio.checked) return;
        try {
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator(); 
            const gain = audioCtx.createGain();
            osc.type = 'sine'; 
            osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
            osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } catch(e) {}
    }
    document.addEventListener('click', (e) => { 
        if (e.target.tagName === 'BUTTON' || e.target.type === 'checkbox' || e.target.closest('.theme-chip') || e.target.closest('.theme-chip-more')) playTick(); 
    });
    
    if (drawerEl) {
        drawerEl.addEventListener('input', (e) => { 
            if (e.target.type === 'range') playTick(); 
            if (e.target.id !== 'val-theme-preset' && e.target.id !== 'val-popup-anim') resetPresetToCustom();
        });
    }

    document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
        switchBtn.addEventListener('change', (e) => {
            const drawer = document.getElementById(`drawer-${e.target.value}`);
            if (drawer) {
                if (e.target.checked) drawer.classList.add('active'); 
                else drawer.classList.remove('active');
            }
            resetPresetToCustom();
            updateLiveVariables();
        });
    });

    function handleOrientation(e) {
        const toggleParallax = document.getElementById('toggle-parallax');
        if (!toggleParallax || !toggleParallax.checked) return;
        let x = e.gamma; let y = e.beta; 
        if (x > 45) x = 45; if (x < -45) x = -45;
        if (y > 45) y = 45; if (y < -45) y = -45;
        root.style.setProperty('--tilt-x', (x / 10) + 'px'); 
        root.style.setProperty('--tilt-y', (y / 10) + 'px');
    }

    const toggleParallax = document.getElementById('toggle-parallax');
    if (toggleParallax) {
        toggleParallax.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission().then(state => {
                        if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                        else { e.target.checked = false; alert('Vui lòng cấp quyền cảm biến!'); }
                    }).catch(console.error);
                } else { 
                    window.addEventListener('deviceorientation', handleOrientation); 
                }
            } else {
                window.removeEventListener('deviceorientation', handleOrientation);
                root.style.setProperty('--tilt-x', '0px'); 
                root.style.setProperty('--tilt-y', '0px');
            }
            safeSetItem('sttv_parallax', e.target.checked);
        });
    }

    const uploadBg = document.getElementById('upload-bg');
    if (uploadBg) {
        uploadBg.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const b64 = ev.target.result; 
                    const ok = safeSetItem('sttv_customBgImage', b64);
                    if (!ok) {
                        alert('⚠️ Ảnh quá lớn, không thể lưu vào bộ nhớ. Vui lòng chọn ảnh nhỏ hơn!');
                        return;
                    }
                    root.style.setProperty('--bg-image', `url('${b64}')`);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    const clearBgBtn = document.getElementById('clear-bg');
    if (clearBgBtn) {
        clearBgBtn.addEventListener('click', () => { 
            try { localStorage.removeItem('sttv_customBgImage'); } catch(e) {}
            root.style.setProperty('--bg-image', 'none'); 
            if (uploadBg) uploadBg.value = ""; 
        });
    }

    const overlay = document.getElementById('settings-overlay');
    const closeSettings = () => { 
        if (drawerEl) drawerEl.classList.remove('open'); 
        if (overlay) overlay.classList.remove('open'); 
    };
    const openSettingsBtn = document.getElementById('open-settings');
    const closeSettingsBtn = document.getElementById('close-settings');
    if (openSettingsBtn && drawerEl && overlay) {
        openSettingsBtn.onclick = () => { drawerEl.classList.add('open'); overlay.classList.add('open'); };
    }
    if (closeSettingsBtn) closeSettingsBtn.onclick = closeSettings;
    if (overlay) overlay.onclick = closeSettings;

    let adjustTimeout;
    if (drawerEl) {
        drawerEl.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                drawerEl.classList.add('adjusting'); 
                clearTimeout(adjustTimeout);
                adjustTimeout = setTimeout(() => drawerEl.classList.remove('adjusting'), 800);
            }
            updateLiveVariables();
        });
    }

    const btnList = document.getElementById('btn-layout-list');
    const btnGrid = document.getElementById('btn-layout-grid');
    function setLayoutMode(mode) {
        safeSetItem('sttv_layoutMode', mode);
        if (!btnList || !btnGrid) return;
        if (mode === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }
        updateLiveVariables();
    }
    if (btnList) btnList.onclick = () => { setLayoutMode('list'); resetPresetToCustom(); }; 
    if (btnGrid) btnGrid.onclick = () => { setLayoutMode('grid'); resetPresetToCustom(); };

    const infoModal = document.getElementById('info-modal');
    const infoOverlay = document.getElementById('info-overlay');
    const btnInfo = document.getElementById('btn-info');
    const closeInfoBtn = document.getElementById('close-info');

    if (btnInfo && infoModal && infoOverlay) {
        btnInfo.onclick = () => { 
            infoModal.classList.add('show'); 
            infoOverlay.classList.add('show'); 
        };
    }
    if (closeInfoBtn && infoModal && infoOverlay) {
        closeInfoBtn.onclick = () => { 
            infoModal.classList.remove('show'); 
            infoOverlay.classList.remove('show'); 
        };
    }
    if (infoOverlay && infoModal) {
        infoOverlay.onclick = (e) => { 
            if (e.target.id === 'info-overlay') { 
                infoModal.classList.remove('show'); 
                infoOverlay.classList.remove('show'); 
            }
        };
    }

    const configModal = document.getElementById('config-modal');
    const configOverlay = document.getElementById('config-overlay');
    const configTextarea = document.getElementById('config-textarea');
    const configModalTitle = document.getElementById('config-modal-title');
    const btnConfigCopy = document.getElementById('btn-config-copy');
    const btnConfigApply = document.getElementById('btn-config-apply');
    const btnConfigClose = document.getElementById('close-config');

    function openConfigModal(mode) {
        if (!configModal || !configOverlay) return;
        if (mode === 'export') {
            configTextarea.value = packConfig();
            configTextarea.readOnly = true;
            configModalTitle.innerText = (window.i18nData && window.i18nData['modal_config_title_export']) || '📤 Xuất cấu hình';
            btnConfigCopy.style.display = 'block';
            btnConfigApply.style.display = 'none';
        } else {
            configTextarea.value = '';
            configTextarea.readOnly = false;
            configModalTitle.innerText = (window.i18nData && window.i18nData['modal_config_title_import']) || '📥 Nhập cấu hình';
            btnConfigCopy.style.display = 'none';
            btnConfigApply.style.display = 'block';
        }
        configModal.classList.add('show');
        configOverlay.classList.add('show');
        setTimeout(() => {
            try { 
                if (mode === 'export') configTextarea.select();
                else configTextarea.focus();
            } catch(e) {}
        }, 250);
    }
    function closeConfigModal() {
        if (configModal) configModal.classList.remove('show');
        if (configOverlay) configOverlay.classList.remove('show');
    }

    if (btnConfigClose) btnConfigClose.onclick = closeConfigModal;
    if (configOverlay) configOverlay.onclick = closeConfigModal;

    if (btnConfigCopy) {
        btnConfigCopy.onclick = () => {
            const text = configTextarea.value;
            const successMsg = (window.i18nData && window.i18nData['msg_copy_success']) || "Đã sao chép mã cấu hình!";
            
            const doFallbackCopy = () => {
                try {
                    const wasReadOnly = configTextarea.readOnly;
                    configTextarea.readOnly = false;
                    configTextarea.select();
                    configTextarea.setSelectionRange(0, 99999);
                    const ok = document.execCommand('copy');
                    configTextarea.readOnly = wasReadOnly;
                    if (ok) alert(successMsg);
                    else alert('Vui lòng nhấn giữ để chọn và sao chép thủ công.');
                } catch(e) {
                    alert('Vui lòng nhấn giữ để chọn và sao chép thủ công.');
                }
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => alert(successMsg)).catch(doFallbackCopy);
            } else {
                doFallbackCopy();
            }
        };
    }

    if (btnConfigApply) {
        btnConfigApply.onclick = () => {
            const code = configTextarea.value.trim();
            if (!code) { alert('Vui lòng dán mã cấu hình!'); return; }
            unpackConfig(code);
            resetPresetToCustom();
            closeConfigModal();
        };
    }

    function hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (!hex) return `rgba(0,0,0,${alpha / 100})`;
        if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
        else if (hex.length === 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); }
        return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    }
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (!hex) return '0,0,0';
        if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
        else if (hex.length === 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); }
        return `${r}, ${g}, ${b}`;
    }

    function updateShadow() {
        const activeShadows = document.querySelectorAll('input[name="active_shadow"]:checked');
        let combinedShadow = '';
        activeShadows.forEach(checkbox => {
            const drawer = document.getElementById(`drawer-${checkbox.value}`);
            if (!drawer) return;
            const mode = SHADOW_MODES.find(m => m.id === checkbox.value);
            const hexColor = drawer.querySelector('.s-c').value;
            const opacity = drawer.querySelector('.s-o').value;
            const rgbaColor = hexToRgba(hexColor, opacity);

            let shadowStr = mode.template
                .replace('{x}', drawer.querySelector('.s-x').value).replace('{y}', drawer.querySelector('.s-y').value)
                .replace('{b}', drawer.querySelector('.s-b').value).replace('{s}', drawer.querySelector('.s-s').value)
                .replace('{c}', rgbaColor);
            if (combinedShadow) combinedShadow += ', '; 
            combinedShadow += shadowStr;
        });
        root.style.setProperty('--btn-shadow', combinedShadow || 'none');
    }

    function saveSettingsToLocal() {
        const get = id => document.getElementById(id);
        
        const saves = {
            sttv_bgMain: get('val-bg-main'), sttv_textColor: get('val-text-color'),
            sttv_listBg: get('val-list-bg'), sttv_listBgOpacity: get('val-list-bg-opacity'),
            sttv_listText: get('val-list-text'), sttv_listSvg: get('val-list-svg'),
            sttv_themeFrame: get('val-theme-frame'),
            sttv_frameSize: get('val-frame-size'), sttv_svgSize: get('val-svg-size'),
            sttv_svgOpacity: get('val-svg-opacity'), sttv_frameRadius: get('val-frame-radius'),
            sttv_frameColor: get('val-frame-color'), sttv_frameBgOpacity: get('val-frame-bg-opacity'),
            sttv_svgColor: get('val-svg-color'),
            sttv_titleSize: get('val-title-size'), sttv_titleSpacing: get('val-title-spacing'),
            sttv_iconSize: get('val-icon-size'), sttv_iconSpacing: get('val-icon-spacing'),
            sttv_mediaWidth: get('val-media-width'), sttv_mediaBgOpacity: get('val-media-bg-opacity'),
            sttv_mediaBtnSize: get('val-media-btn-size'), sttv_mediaBgColor: get('val-media-bg-color'),
            sttv_mediaBtnColor: get('val-media-btn-color'), sttv_mediaSvgColor: get('val-media-svg-color')
        };
        for (const k in saves) {
            if (saves[k]) safeSetItem(k, saves[k].value);
        }

        const checks = {
            sttv_hideLabels: get('toggle-hide-labels'),
            sttv_listFrame: get('toggle-list-frame'),
            sttv_glassMode: get('toggle-glass'),
            sttv_audioFeedback: get('toggle-audio')
        };
        for (const k in checks) {
            if (checks[k]) safeSetItem(k, checks[k].checked);
        }

        const shadowState = {};
        SHADOW_MODES.forEach(mode => {
            const drawer = document.getElementById(`drawer-${mode.id}`);
            const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
            if (drawer && checkbox) {
                shadowState[mode.id] = {
                    active: checkbox.checked,
                    x: drawer.querySelector('.s-x').value, y: drawer.querySelector('.s-y').value,
                    b: drawer.querySelector('.s-b').value, s: drawer.querySelector('.s-s').value,
                    c: drawer.querySelector('.s-c').value, o: drawer.querySelector('.s-o').value
                };
            }
        });
        safeSetItem('sttv_shadowConfig', JSON.stringify(shadowState));
    }

    function packConfig() {
        const shadowState = {};
        SHADOW_MODES.forEach(mode => {
            const drawer = document.getElementById(`drawer-${mode.id}`);
            const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
            if (drawer && checkbox) {
                shadowState[mode.id] = {
                    active: checkbox.checked,
                    x: drawer.querySelector('.s-x').value, y: drawer.querySelector('.s-y').value,
                    b: drawer.querySelector('.s-b').value, s: drawer.querySelector('.s-s').value,
                    c: drawer.querySelector('.s-c').value, o: drawer.querySelector('.s-o').value
                };
            }
        });

        const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
        const c = id => { const el = document.getElementById(id); return el ? el.checked : false; };

        const fullConfig = {
            bgMain: g('val-bg-main'), textColor: g('val-text-color'),
            layoutMode: safeGetItem('sttv_layoutMode') || 'grid',
            listBg: g('val-list-bg'), listText: g('val-list-text'), listSvg: g('val-list-svg'),
            themeFrame: g('val-theme-frame'), frameSize: g('val-frame-size'),
            svgSize: g('val-svg-size'), svgOpacity: g('val-svg-opacity'),
            frameRadius: g('val-frame-radius'), frameColor: g('val-frame-color'),
            svgColor: g('val-svg-color'),
            hideLabels: c('toggle-hide-labels'), titleSize: g('val-title-size'),
            titleSpacing: g('val-title-spacing'), listFrame: c('toggle-list-frame'),
            iconSize: g('val-icon-size'), iconSpacing: g('val-icon-spacing'),
            listBgOpacity: g('val-list-bg-opacity'), frameBgOpacity: g('val-frame-bg-opacity'),
            mediaWidth: g('val-media-width'), mediaBgOpacity: g('val-media-bg-opacity'),
            mediaBtnSize: g('val-media-btn-size'), mediaBgColor: g('val-media-bg-color'),
            mediaBtnColor: g('val-media-btn-color'), mediaSvgColor: g('val-media-svg-color'),
            glassMode: c('toggle-glass'), popupAnim: g('val-popup-anim'),
            shadowConfig: shadowState
        };

        return btoa(unescape(encodeURIComponent(JSON.stringify(fullConfig)))); 
    }

    function unpackConfig(base64Str) {
        try {
            if (drawerEl) drawerEl.classList.remove('adjusting');
            const decodedStr = decodeURIComponent(escape(atob(base64Str)));
            let config;
            try { config = JSON.parse(decodedStr); } 
            catch(e) { alert("Mã không hợp lệ!"); return; }
            
            try { localStorage.removeItem('sttv_customBgImage'); } catch(e) {}
            root.style.setProperty('--bg-image', 'none');
            const uploadBgInput = document.getElementById('upload-bg');
            if (uploadBgInput) uploadBgInput.value = "";

            const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            const setC = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };

            if (Array.isArray(config)) {
                if (config.length < 13) throw 'Lỗi mã cũ';
                if (config[0]) { setV('val-bg-main', config[0]); root.style.setProperty('--bg-main', config[0]); }
                setV('val-text-color', config[1]);
                setLayoutMode(config[2]);
                setV('val-list-bg', config[3]);
                setV('val-list-text', config[4]);
                setV('val-list-svg', config[5]);
                setV('val-theme-frame', config[6]);
                syncThemePickerVisuals(config[6]);
                setV('val-frame-size', config[7]);
                setV('val-svg-size', config[8]); 
                setV('val-svg-opacity', config[9]);
                setV('val-frame-radius', config[10]); 
                setV('val-frame-color', config[11]); 
                setV('val-svg-color', config[12]);
                
                document.querySelectorAll('.shadow-switch').forEach(cb => { 
                    cb.checked = false; 
                    const d = document.getElementById(`drawer-${cb.value}`);
                    if (d) d.classList.remove('active');
                });
                if (config[13] && config[13].length > 0) {
                    const sId = config[13][0]; 
                    const shadowSwitch = document.querySelector(`input[name="active_shadow"][value="${sId}"]`);
                    if (shadowSwitch) {
                        shadowSwitch.checked = true;
                        const drw = document.getElementById(`drawer-${sId}`); 
                        if (drw) {
                            drw.classList.add('active');
                            drw.querySelector('.s-x').value = config[13][1]; 
                            drw.querySelector('.s-y').value = config[13][2];
                            drw.querySelector('.s-b').value = config[13][3]; 
                            drw.querySelector('.s-s').value = config[13][4]; 
                            drw.querySelector('.s-c').value = config[13][5];
                            if (config[13].length > 6) drw.querySelector('.s-o').value = config[13][6];
                        }
                    }
                }
                if (config.length >= 17) {
                    setC('toggle-hide-labels', config[14]);
                    setV('val-title-size', config[15]);
                    setV('val-title-spacing', config[16]);
                }
                if (config.length >= 18) setC('toggle-list-frame', config[17]);
                if (config.length >= 20) {
                    setV('val-icon-size', config[18]);
                    setV('val-icon-spacing', config[19]);
                }
                setV('val-list-bg-opacity', config.length >= 21 ? config[20] : 10);
                setV('val-frame-bg-opacity', config.length >= 22 ? config[21] : 100);
                
                if (config.length >= 28) {
                    setV('val-media-width', config[22]);
                    setV('val-media-bg-opacity', config[23]);
                    setV('val-media-btn-size', config[24]);
                    setV('val-media-bg-color', config[25]);
                    setV('val-media-btn-color', config[26]);
                    setV('val-media-svg-color', config[27]);
                }
            } else {
                if (config.bgMain) { setV('val-bg-main', config.bgMain); root.style.setProperty('--bg-main', config.bgMain); }
                if (config.textColor) setV('val-text-color', config.textColor);
                if (config.layoutMode) setLayoutMode(config.layoutMode);
                if (config.listBg) setV('val-list-bg', config.listBg);
                if (config.listText) setV('val-list-text', config.listText);
                if (config.listSvg) setV('val-list-svg', config.listSvg);
                if (config.listBgOpacity) setV('val-list-bg-opacity', config.listBgOpacity);
                if (config.listFrame !== undefined) setC('toggle-list-frame', config.listFrame);

                if (config.themeFrame) {
                    setV('val-theme-frame', config.themeFrame);
                    syncThemePickerVisuals(config.themeFrame);
                }
                if (config.frameSize) setV('val-frame-size', config.frameSize);
                if (config.svgSize) setV('val-svg-size', config.svgSize);
                if (config.svgOpacity) setV('val-svg-opacity', config.svgOpacity);
                if (config.frameRadius) setV('val-frame-radius', config.frameRadius);
                if (config.frameColor) setV('val-frame-color', config.frameColor);
                if (config.frameBgOpacity) setV('val-frame-bg-opacity', config.frameBgOpacity);
                if (config.svgColor) setV('val-svg-color', config.svgColor);

                if (config.hideLabels !== undefined) setC('toggle-hide-labels', config.hideLabels);
                if (config.titleSize) setV('val-title-size', config.titleSize);
                if (config.titleSpacing) setV('val-title-spacing', config.titleSpacing);
                if (config.iconSize) setV('val-icon-size', config.iconSize);
                if (config.iconSpacing) setV('val-icon-spacing', config.iconSpacing);

                if (config.mediaWidth) setV('val-media-width', config.mediaWidth);
                if (config.mediaBgOpacity) setV('val-media-bg-opacity', config.mediaBgOpacity);
                if (config.mediaBtnSize) setV('val-media-btn-size', config.mediaBtnSize);
                if (config.mediaBgColor) setV('val-media-bg-color', config.mediaBgColor);
                if (config.mediaBtnColor) setV('val-media-btn-color', config.mediaBtnColor);
                if (config.mediaSvgColor) setV('val-media-svg-color', config.mediaSvgColor);

                if (config.glassMode !== undefined) setC('toggle-glass', config.glassMode);
                if (config.popupAnim) {
                    setV('val-popup-anim', config.popupAnim);
                    if (drawerEl) drawerEl.className = 'settings-drawer ' + (config.popupAnim !== 'default' ? config.popupAnim : '');
                }

                if (config.shadowConfig) {
                    SHADOW_MODES.forEach(mode => {
                        const item = config.shadowConfig[mode.id];
                        const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                        const drawer = document.getElementById(`drawer-${mode.id}`);
                        if (item && checkbox && drawer) {
                            checkbox.checked = item.active;
                            if (item.active) drawer.classList.add('active'); 
                            else drawer.classList.remove('active');
                            drawer.querySelector('.s-x').value = item.x;
                            drawer.querySelector('.s-y').value = item.y;
                            drawer.querySelector('.s-b').value = item.b;
                            drawer.querySelector('.s-s').value = item.s;
                            drawer.querySelector('.s-c').value = item.c;
                            drawer.querySelector('.s-o').value = item.o;
                        }
                    });
                }
            }
            updateLiveVariables();
        } catch(e) { 
            console.error(e);
            alert("Mã cấu hình không hợp lệ!"); 
        }
    }

    const btnExport = document.getElementById('btn-export');
    if (btnExport) btnExport.onclick = () => openConfigModal('export');

    const btnImport = document.getElementById('btn-import');
    if (btnImport) btnImport.onclick = () => openConfigModal('import');

    function updateLiveVariables() {
        const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
        const c = id => { const el = document.getElementById(id); return el ? el.checked : false; };

        const bgMain = g('val-bg-main'); if (bgMain) root.style.setProperty('--bg-main', bgMain);
        const textColor = g('val-text-color'); if (textColor) root.style.setProperty('--text-color', textColor);
        const frameSize = g('val-frame-size'); if (frameSize) root.style.setProperty('--frame-size', frameSize + 'px');
        const svgSize = g('val-svg-size'); if (svgSize) root.style.setProperty('--svg-size', svgSize + 'px');
        const svgColor = g('val-svg-color'); if (svgColor) root.style.setProperty('--svg-color', svgColor);
        const svgOpacity = g('val-svg-opacity'); if (svgOpacity) root.style.setProperty('--svg-opacity', svgOpacity / 100);
        
        const rawRadius = g('val-frame-radius');
        if (rawRadius !== '') {
            root.style.setProperty('--frame-border-radius', rawRadius + '%'); 
            root.style.setProperty('--list-border-radius', rawRadius + 'px'); 
        }

        const titleSize = g('val-title-size'); if (titleSize) root.style.setProperty('--title-size', titleSize + 'px');
        const titleSpacing = g('val-title-spacing'); if (titleSpacing) root.style.setProperty('--title-spacing', titleSpacing + 'px');
        const iconSize = g('val-icon-size'); if (iconSize) root.style.setProperty('--icon-font-size', iconSize + 'px');
        const iconSpacing = g('val-icon-spacing'); if (iconSpacing) root.style.setProperty('--icon-spacing', iconSpacing + 'px');
        root.style.setProperty('--label-display', c('toggle-hide-labels') ? 'none' : 'block');
        
        const currentLayout = safeGetItem('sttv_layoutMode') || 'grid';
        if (btnList && btnGrid) {
            if (currentLayout === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
            else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }
        }

        const isListFrame = c('toggle-list-frame');
        if (mainContainer) {
            if (isListFrame) mainContainer.classList.add('list-frame-active'); 
            else mainContainer.classList.remove('list-frame-active');
        }

        const listBgHex = g('val-list-bg');
        const listBgOpacity = g('val-list-bg-opacity');
        if (listBgHex) root.style.setProperty('--list-bg-color', listBgHex); 
        if (listBgHex && listBgOpacity) root.style.setProperty('--list-bg-rgba', hexToRgba(listBgHex, listBgOpacity)); 
        const listText = g('val-list-text'); if (listText) root.style.setProperty('--list-text-color', listText);
        const listSvg = g('val-list-svg'); if (listSvg) root.style.setProperty('--list-svg-color', listSvg);

        const frameSelect = g('val-theme-frame');
        const frameColorHex = g('val-frame-color');
        const frameColorOpacity = g('val-frame-bg-opacity');
        const frameColorRgba = hexToRgba(frameColorHex, frameColorOpacity);
        
        if (frameSelect === 'none' || !frameSelect) { 
            root.style.setProperty('--frame-bg', 'none'); 
            root.style.setProperty('--frame-bg-color', frameColorRgba);
        } else { 
            root.style.setProperty('--frame-bg', `url('../${frameSelect}')`); 
            root.style.setProperty('--frame-bg-color', 'transparent'); 
        }
        
        const glassMode = c('toggle-glass');
        if (mainContainer) {
            if (glassMode) mainContainer.classList.add('glass-active'); 
            else mainContainer.classList.remove('glass-active');
        }

        const mediaBgColor = g('val-media-bg-color');
        if (mediaBgColor) root.style.setProperty('--media-bg-rgb', hexToRgb(mediaBgColor));
        const mediaBgOpacity = g('val-media-bg-opacity'); if (mediaBgOpacity) root.style.setProperty('--media-bg-opacity', mediaBgOpacity / 100);
        const mediaWidth = g('val-media-width'); if (mediaWidth) root.style.setProperty('--media-width', mediaWidth + '%');
        const mediaBtnColor = g('val-media-btn-color'); if (mediaBtnColor) root.style.setProperty('--media-btn-color', mediaBtnColor);
        const mediaSvgColor = g('val-media-svg-color'); if (mediaSvgColor) root.style.setProperty('--media-svg-color', mediaSvgColor);
        const mediaBtnSize = g('val-media-btn-size');
        if (mediaBtnSize) {
            root.style.setProperty('--media-btn-size', mediaBtnSize + 'px');
            root.style.setProperty('--media-btn-play', (parseInt(mediaBtnSize) + 15) + 'px');
        }

        updateShadow();
        saveSettingsToLocal();
    }

    function loadSettingsFromLocal() {
        const safeSet = (id, key, fallback, isCheck = false) => {
            const el = document.getElementById(id); 
            if (!el) return;
            const val = safeGetItem('sttv_' + key);
            if (isCheck) el.checked = val === 'true' ? true : (val === null ? fallback : false);
            else el.value = val !== null ? val : fallback;
        };

        safeSet('val-bg-main', 'bgMain', '#121b22'); 
        safeSet('val-text-color', 'textColor', '#ffffff');
        safeSet('val-list-bg', 'listBg', '#1a1a1a'); 
        safeSet('val-list-bg-opacity', 'listBgOpacity', '10');
        safeSet('val-list-text', 'listText', '#ffffff'); 
        safeSet('val-list-svg', 'listSvg', '#ffffff');
        
        const savedFrame = safeGetItem('sttv_themeFrame') || 'none';
        const frameEl = document.getElementById('val-theme-frame');
        if (frameEl) frameEl.value = savedFrame;
        syncThemePickerVisuals(savedFrame);

        const savedPreset = safeGetItem('sttv_activePreset') || 'none';
        if (presetSelect) presetSelect.value = savedPreset;

        const savedAnim = safeGetItem('sttv_popupAnim') || 'default';
        if (popupAnimSelect) popupAnimSelect.value = savedAnim;
        if (savedAnim !== 'default' && drawerEl) drawerEl.classList.add(savedAnim);

        safeSet('val-frame-size', 'frameSize', '60');
        safeSet('val-svg-size', 'svgSize', '28'); 
        safeSet('val-svg-opacity', 'svgOpacity', '100');
        safeSet('val-svg-color', 'svgColor', '#ffffff'); 
        safeSet('val-frame-radius', 'frameRadius', '22');
        safeSet('val-frame-color', 'frameColor', '#000000'); 
        safeSet('val-frame-bg-opacity', 'frameBgOpacity', '100');
        
        safeSet('toggle-hide-labels', 'hideLabels', false, true); 
        safeSet('toggle-list-frame', 'listFrame', false, true);
        safeSet('val-title-size', 'titleSize', '22'); 
        safeSet('val-title-spacing', 'titleSpacing', '0.5');
        safeSet('val-icon-size', 'iconSize', '14'); 
        safeSet('val-icon-spacing', 'iconSpacing', '0');
        safeSet('toggle-glass', 'glassMode', false, true); 
        safeSet('toggle-audio', 'audioFeedback', false, true);
        safeSet('toggle-parallax', 'parallax', false, true);

        safeSet('val-media-width', 'mediaWidth', '90'); 
        safeSet('val-media-bg-opacity', 'mediaBgOpacity', '3');
        safeSet('val-media-btn-size', 'mediaBtnSize', '50'); 
        safeSet('val-media-bg-color', 'mediaBgColor', '#ffffff');
        safeSet('val-media-btn-color', 'mediaBtnColor', '#ffffff'); 
        safeSet('val-media-svg-color', 'mediaSvgColor', '#ffffff');

        const savedShadowConfig = safeGetItem('sttv_shadowConfig');
        if (savedShadowConfig) {
            try {
                const shadowState = JSON.parse(savedShadowConfig);
                SHADOW_MODES.forEach(mode => {
                    if (shadowState[mode.id]) {
                        const item = shadowState[mode.id];
                        const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                        const drawer = document.getElementById(`drawer-${mode.id}`);
                        if (checkbox && drawer) {
                            checkbox.checked = item.active;
                            if (item.active) drawer.classList.add('active'); 
                            else drawer.classList.remove('active');
                            drawer.querySelector('.s-x').value = item.x;
                            drawer.querySelector('.s-y').value = item.y;
                            drawer.querySelector('.s-b').value = item.b;
                            drawer.querySelector('.s-s').value = item.s;
                            drawer.querySelector('.s-c').value = item.c;
                            drawer.querySelector('.s-o').value = item.o;
                        }
                    }
                });
            } catch(e) { console.error("Lỗi đọc cấu hình shadow:", e); }
        }

        const initLayout = safeGetItem('sttv_layoutMode') || 'grid';
        if (btnList && btnGrid) {
            if (initLayout === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
            else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }
        }

        const savedBg = safeGetItem('sttv_customBgImage'); 
        if (savedBg) root.style.setProperty('--bg-image', `url('${savedBg}')`);
    }

    loadSettingsFromLocal();
    updateLiveVariables();

    document.addEventListener("visibilitychange", function() { 
        if (document.visibilityState === 'hidden') saveSettingsToLocal(); 
    });
    window.addEventListener("beforeunload", saveSettingsToLocal);
    window.addEventListener("pagehide", saveSettingsToLocal);
});