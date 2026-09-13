const DEV_MODE = true; 

const PRESET_VERSION = 5;
const THEME_VERSION = 2;

const SHADOW_MODES = [
    { id: 'inset', nameKey: 'shadow_inset', name: 'Bóng Chìm',     template: 'inset {x}px {y}px {b}px {s}px {c}' },
    { id: 'outer', nameKey: 'shadow_outer', name: 'Bóng Ngoài',    template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'soft',  nameKey: 'shadow_soft',  name: 'Mờ Diện Rộng',  template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'hard',  nameKey: 'shadow_hard',  name: 'Nổi Khối 3D',   template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'glow',  nameKey: 'shadow_glow',  name: 'Phát Sáng',     template: '0px 0px {b}px {s}px {c}' },
    { id: 'bottom',    nameKey: 'shadow_bottom',    name: 'Bóng Dưới (Apple)', template: '0px {y}px {b}px {s}px {c}' },
    { id: 'floating',  nameKey: 'shadow_floating',  name: 'Nổi Bay',            template: '0px {b}px {b}px calc(-1 * {s}px) {c}' },
    { id: 'pressed',   nameKey: 'shadow_pressed',   name: 'Ấn Xuống',           template: 'inset 0px {y}px {b}px {s}px {c}' },
    { id: 'pop',       nameKey: 'shadow_pop',       name: 'Pop Bubble',         template: '0px {y}px 0px 0px {c}' },
    { id: 'double',    nameKey: 'shadow_double',    name: 'Viền Kép',           template: '{x}px {y}px {b}px {s}px {c}, inset calc(-1 * {x}px) calc(-1 * {y}px) {b}px 0px rgba(255,255,255,0.15)' },
    { id: 'neumorph',  nameKey: 'shadow_neumorph',  name: 'Neumorphism Nổi',    template: 'calc(-1 * {x}px) calc(-1 * {y}px) {b}px rgba(255,255,255,0.4), {x}px {y}px {b}px {c}' },
    { id: 'neuro_in',  nameKey: 'shadow_neuro_in',  name: 'Neumorphism Chìm',   template: 'inset calc(-1 * {x}px) calc(-1 * {y}px) {b}px rgba(255,255,255,0.4), inset {x}px {y}px {b}px {c}' },
    { id: 'neon',      nameKey: 'shadow_neon',      name: 'Neon RGB',           template: '0px 0px {b}px {c}, 0px 0px {b}px {c}, 0px 0px {b}px {c}' },
    { id: 'long',      nameKey: 'shadow_long',      name: 'Bóng Dài Retro',     template: '{x}px {y}px 0px 0px {c}' },
    { id: 'crisp',     nameKey: 'shadow_crisp',     name: 'Sắc Nét Nhẹ',        template: '0px 1px 2px 0px {c}' },
    { id: 'ripple',    nameKey: 'shadow_ripple',    name: 'Sóng Nước',          template: '0px {y}px {b}px {s}px {c}, 0px {y}px {b}px {s}px {c}' },
    { id: 'clay',      nameKey: 'shadow_clay',      name: 'Đất Sét 3D',         template: 'inset 0px calc(-1 * {y}px) {b}px rgba(255,255,255,0.3), inset 0px {y}px {b}px rgba(0,0,0,0.2), 0px {y}px {b}px {c}' }
];

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const mainContainer = document.getElementById('main-container');
    const introScreen = document.getElementById('intro-screen');
    const introTextWrapper = document.getElementById('intro-text-wrapper');

    /* ========== GẮN LISTENER NÚT SETTINGS ========== */
    const drawerEl = document.getElementById('settings-drawer');
    const overlay = document.getElementById('settings-overlay');
    const openSettingsBtn = document.getElementById('open-settings');
    const closeSettingsBtn = document.getElementById('close-settings');

    const closeSettings = () => { 
        if (drawerEl) drawerEl.classList.remove('open'); 
        if (overlay) overlay.classList.remove('open'); 
    };

    if (openSettingsBtn && drawerEl && overlay) {
        openSettingsBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            drawerEl.classList.add('open');
        });
    }
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (overlay) overlay.addEventListener('click', closeSettings);

    /* ========== INTRO LOGIC ========== */
    if (introTextWrapper) {
        const effects = ['anim-wave', 'anim-bounce', 'anim-flip'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        introTextWrapper.classList.add(randomEffect);
    }

    if (mainContainer) mainContainer.classList.add('intro-zoom');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.__dismissIntro) { window.__dismissIntro(); return; }
            if (introScreen) {
                introScreen.classList.add('dismiss'); 
                if (mainContainer) mainContainer.classList.remove('intro-zoom'); 
                setTimeout(() => { introScreen.style.display = 'none'; }, 500); 
            }
        }, 2000); 
    });

    if (!DEV_MODE) document.body.classList.add('standard-mode');

    /* ========== TOÀN BỘ LOGIC CÒN LẠI ========== */
    try {
        const badgePreset = document.getElementById('badge-preset');
        const badgeTheme = document.getElementById('badge-theme');
        
        const seenPresetVersion = parseInt(localStorage.getItem('sttv_presetVersionSeen') || '0');
        if (badgePreset) {
            if (seenPresetVersion >= PRESET_VERSION) badgePreset.classList.add('hidden');
            else badgePreset.classList.remove('hidden');
        }
        
        const seenThemeVersion = parseInt(localStorage.getItem('sttv_themeVersionSeen') || '0');
        if (badgeTheme) {
            if (seenThemeVersion >= THEME_VERSION) badgeTheme.classList.add('hidden');
            else badgeTheme.classList.remove('hidden');
        }

        /* ========== TAB SWITCHING ========== */
        const tabButtons = document.querySelectorAll('.settings-tab');
        const tabContents = document.querySelectorAll('.settings-tab-content');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const targetContent = document.querySelector(`.settings-tab-content[data-tab="${targetTab}"]`);
                if (targetContent) targetContent.classList.add('active');
                try { localStorage.setItem('sttv_activeTab', targetTab); } catch(e) {}
                try { playTick(); } catch(e) {}
            });
        });

        const savedTab = localStorage.getItem('sttv_activeTab');
        if (savedTab) {
            const savedBtn = document.querySelector(`.settings-tab[data-tab="${savedTab}"]`);
            const savedContent = document.querySelector(`.settings-tab-content[data-tab="${savedTab}"]`);
            if (savedBtn && savedContent) {
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                savedBtn.classList.add('active');
                savedContent.classList.add('active');
            }
        }

        /* ========== TOOLTIP GLOBAL ========== */
        let globalTooltip = document.createElement('div');
        globalTooltip.className = 'slider-tooltip';
        document.body.appendChild(globalTooltip);

        let rafId = null;
        document.addEventListener('input', (e) => {
            if (e.target && e.target.type === 'range') {
                const input = e.target;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    globalTooltip.innerText = input.value;
                    globalTooltip.classList.add('show');
                    const rect = input.getBoundingClientRect();
                    const min = parseFloat(input.min) || 0;
                    const max = parseFloat(input.max) || 100;
                    const val = parseFloat(input.value);
                    const percent = (val - min) / (max - min);
                    const thumbOffset = 12.5 - (percent * 25);
                    const thumbX = rect.left + (percent * rect.width) + thumbOffset;
                    globalTooltip.style.left = `${thumbX}px`;
                    globalTooltip.style.top = `${rect.top - 35}px`;
                });
                try { playTick(); } catch(e) {}
                if (e.target.id !== 'val-theme-preset' && e.target.id !== 'val-popup-anim') {
                    resetPresetToCustom();
                }
                updateLiveVariables(false); 
            }
        });

        const hideTooltip = (e) => {
            if (e.target && e.target.type === 'range') globalTooltip.classList.remove('show');
        };
        document.addEventListener('pointerup', hideTooltip);
        document.addEventListener('touchend', hideTooltip);
        document.addEventListener('change', (e) => {
            if (e.target && e.target.type === 'range') {
                hideTooltip(e);
                saveSettingsToLocal();
            }
        });

        /* ========== SHADOW CONTROLS ========== */
        try {
            const shadowContainer = document.getElementById('shadow-controls');
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
        } catch(errShadow) {
            console.error('Shadow render failed:', errShadow);
        }

        let currentThemeTarget = 'frame';
        
        function syncThemePickerVisuals(val) {
            document.querySelectorAll('.theme-chip').forEach(c => {
                if (c.dataset.value === val) c.classList.add('active');
                else c.classList.remove('active');
            });
        }

        const themeModal = document.getElementById('theme-modal');
        const themeOverlay = document.getElementById('theme-overlay');
        
        const btnMoreThemes = document.getElementById('btn-more-themes');
        if (btnMoreThemes) {
            btnMoreThemes.onclick = () => { 
                currentThemeTarget = 'frame';
                const vtf = document.getElementById('val-theme-frame');
                if (vtf) syncThemePickerVisuals(vtf.value);
                if (themeModal) themeModal.classList.add('show');
                if (themeOverlay) themeOverlay.classList.add('show'); 
            };
        }

        const btnThumbTheme = document.getElementById('btn-thumb-theme');
        if (btnThumbTheme) {
            btnThumbTheme.onclick = () => {
                currentThemeTarget = 'thumb';
                const vtt = document.getElementById('val-thumb-theme');
                if (vtt) syncThemePickerVisuals(vtt.value);
                if (themeModal) themeModal.classList.add('show');
                if (themeOverlay) themeOverlay.classList.add('show'); 
            };
        }

        document.querySelectorAll('.theme-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const val = chip.dataset.value;
                syncThemePickerVisuals(val);
                if (currentThemeTarget === 'frame') {
                    const vtf = document.getElementById('val-theme-frame');
                    if (vtf) vtf.value = val;
                    if (badgeTheme) { 
                        badgeTheme.classList.add('hidden'); 
                        localStorage.setItem('sttv_themeVersionSeen', String(THEME_VERSION)); 
                    }
                    resetPresetToCustom();
                } else if (currentThemeTarget === 'thumb') {
                    const vtt = document.getElementById('val-thumb-theme');
                    if (vtt) vtt.value = val;
                }
                updateLiveVariables(true);
            });
        });

        const closeThemeModal = document.getElementById('close-theme-modal');
        if (closeThemeModal && themeModal) closeThemeModal.onclick = () => { 
            themeModal.classList.remove('show'); 
            if (themeOverlay) themeOverlay.classList.remove('show'); 
        };
        
        const infoModal = document.getElementById('info-modal');
        const btnInfo = document.getElementById('btn-info');
        if (btnInfo && infoModal) btnInfo.onclick = () => { 
            infoModal.classList.add('show'); 
            if (themeOverlay) themeOverlay.classList.add('show'); 
        };
        const closeInfoModal = document.getElementById('close-info-modal');
        if (closeInfoModal && infoModal) closeInfoModal.onclick = () => { 
            infoModal.classList.remove('show'); 
            if (themeOverlay) themeOverlay.classList.remove('show'); 
        };

        if (themeOverlay) {
            themeOverlay.onclick = () => { 
                if (themeModal) themeModal.classList.remove('show'); 
                if (infoModal) infoModal.classList.remove('show');
                themeOverlay.classList.remove('show'); 
            };
        }

        /* ========== PRESET SELECT ========== */
        const presetSelect = document.getElementById('val-theme-preset');
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                localStorage.setItem('sttv_activePreset', val);
                if (badgePreset) { 
                    badgePreset.classList.add('hidden'); 
                    localStorage.setItem('sttv_presetVersionSeen', String(PRESET_VERSION)); 
                }
                if (val !== 'none') unpackConfig(val);
            });
        }

        function resetPresetToCustom() {
            if (presetSelect) {
                presetSelect.value = 'none';
                localStorage.setItem('sttv_activePreset', 'none');
            }
        }

        const popupAnimSelect = document.getElementById('val-popup-anim');
        if (popupAnimSelect && drawerEl) {
            popupAnimSelect.addEventListener('change', (e) => {
                const animClass = e.target.value;
                drawerEl.className = 'settings-drawer ' + (drawerEl.classList.contains('open') ? 'open ' : '') + (animClass !== 'default' ? animClass : '');
                localStorage.setItem('sttv_popupAnim', animClass);
            });
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;
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
                osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
                gain.gain.setValueAtTime(0.2, audioCtx.currentTime); 
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
                osc.connect(gain); gain.connect(audioCtx.destination); 
                osc.start(); osc.stop(audioCtx.currentTime + 0.04);
            } catch(e) {}
        }
        document.addEventListener('click', (e) => { 
            if (e.target.tagName === 'BUTTON' || e.target.type === 'checkbox' || e.target.closest('.theme-chip') || e.target.closest('.theme-chip-more')) playTick(); 
        });

        /* ========== COLOR PICKER ========== */
        let colorPickerLock = false;

        if (drawerEl) {
            drawerEl.addEventListener('focusin', (e) => {
                if (e.target && e.target.type === 'color') colorPickerLock = true;
            });
            drawerEl.addEventListener('focusout', (e) => {
                if (e.target && e.target.type === 'color') {
                    setTimeout(() => { colorPickerLock = false; }, 400);
                }
            });
            drawerEl.addEventListener('change', (e) => {
                if (e.target.type === 'color') {
                    updateLiveVariables(true);
                    setTimeout(() => { colorPickerLock = false; }, 150);
                } 
                else if (e.target.type === 'checkbox') {
                    updateLiveVariables(true); 
                }
            });
            drawerEl.addEventListener('input', (e) => {
                if (e.target && e.target.type === 'color') e.stopPropagation();
            }, true);
        }

        document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
            switchBtn.addEventListener('change', (e) => {
                const drawer = document.getElementById(`drawer-${e.target.value}`);
                if (drawer) {
                    if (e.target.checked) drawer.classList.add('active'); 
                    else drawer.classList.remove('active');
                }
                resetPresetToCustom(); 
                updateLiveVariables(true);
            });
        });

        function handleOrientation(e) {
            const tp = document.getElementById('toggle-parallax');
            if (!tp || !tp.checked) return;
            let x = e.gamma; let y = e.beta; 
            if (x > 45) x = 45; if (x < -45) x = -45;
            if (y > 45) y = 45; if (y < -45) y = -45;
            root.style.setProperty('--tilt-x', (x / 10) + 'px'); 
            root.style.setProperty('--tilt-y', (y / 10) + 'px');
        }

        const toggleParallaxEl = document.getElementById('toggle-parallax');
        if (toggleParallaxEl) {
            toggleParallaxEl.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                        DeviceOrientationEvent.requestPermission().then(state => {
                            if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                            else { e.target.checked = false; alert('Vui lòng cấp quyền cảm biến!'); }
                        }).catch(console.error);
                    } else { window.addEventListener('deviceorientation', handleOrientation); }
                } else {
                    window.removeEventListener('deviceorientation', handleOrientation);
                    root.style.setProperty('--tilt-x', '0px'); 
                    root.style.setProperty('--tilt-y', '0px');
                }
                localStorage.setItem('sttv_parallax', e.target.checked);
            });
        }

        /* ========== UPLOAD BACKGROUND ========== */
        const uploadBg = document.getElementById('upload-bg');
        const fileDisplay = document.getElementById('file-name-display');
        
        function updateFileNameDisplay(fileName) {
            if (!fileDisplay) return;
            const prefix = (window.i18nData && window.i18nData['file_selected_prefix']) || 'Đã chọn: ';
            const emptyText = (window.i18nData && window.i18nData['file_none_selected']) || 'chưa chọn tệp nào';
            if (fileName) {
                fileDisplay.textContent = prefix + fileName;
                fileDisplay.classList.add('has-file');
            } else {
                fileDisplay.textContent = emptyText;
                fileDisplay.classList.remove('has-file');
            }
        }
        window.__updateFileNameDisplay = updateFileNameDisplay;
        
        if (uploadBg) {
            uploadBg.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    updateFileNameDisplay(file.name);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const b64 = ev.target.result; 
                        localStorage.setItem('sttv_customBgImage', b64);
                        root.style.setProperty('--bg-image', `url('${b64}')`);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        const clearBgBtn = document.getElementById('clear-bg');
        if (clearBgBtn) {
            clearBgBtn.addEventListener('click', () => { 
                localStorage.removeItem('sttv_customBgImage'); 
                root.style.setProperty('--bg-image', 'none'); 
                if (uploadBg) uploadBg.value = ""; 
                updateFileNameDisplay(null);
            });
        }

        let adjustTimeout;
        if (drawerEl) {
            drawerEl.addEventListener('input', (e) => {
                if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
                    drawerEl.classList.add('adjusting'); 
                    clearTimeout(adjustTimeout);
                    adjustTimeout = setTimeout(() => drawerEl.classList.remove('adjusting'), 800);
                }
            });
        }

        function setLayoutMode(mode) { localStorage.setItem('sttv_layoutMode', mode); updateLiveVariables(true); }
        const btnLayoutList = document.getElementById('btn-layout-list');
        const btnLayoutGrid = document.getElementById('btn-layout-grid');
        if (btnLayoutList) btnLayoutList.onclick = () => { setLayoutMode('list'); resetPresetToCustom(); }; 
        if (btnLayoutGrid) btnLayoutGrid.onclick = () => { setLayoutMode('grid'); resetPresetToCustom(); };

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
                try {
                    const drawer = document.getElementById(`drawer-${checkbox.value}`);
                    if (!drawer) return;
                    const mode = SHADOW_MODES.find(m => m.id === checkbox.value);
                    if (!mode || !mode.template) return;
                    
                    const colorEl = drawer.querySelector('.s-c');
                    const opacityEl = drawer.querySelector('.s-o');
                    if (!colorEl || !opacityEl) return;
                    
                    const rgbaColor = hexToRgba(colorEl.value, opacityEl.value);
                    let shadowStr = mode.template
                        .replace(/{x}/g, drawer.querySelector('.s-x').value)
                        .replace(/{y}/g, drawer.querySelector('.s-y').value)
                        .replace(/{b}/g, drawer.querySelector('.s-b').value)
                        .replace(/{s}/g, drawer.querySelector('.s-s').value)
                        .replace(/{c}/g, rgbaColor);
                    if (combinedShadow) combinedShadow += ', '; 
                    combinedShadow += shadowStr;
                } catch(err) {
                    console.warn('Shadow mode error:', err);
                }
            });
            root.style.setProperty('--btn-shadow', combinedShadow || 'none');
        }

        function g(id) { const el = document.getElementById(id); return el ? el.value : ''; }
        function c(id) { const el = document.getElementById(id); return el ? el.checked : false; }

        function saveSettingsToLocal() {
            try {
                localStorage.setItem('sttv_bgMain', g('val-bg-main'));
                localStorage.setItem('sttv_textColor', g('val-text-color'));
                localStorage.setItem('sttv_listBg', g('val-list-bg'));
                localStorage.setItem('sttv_listBgOpacity', g('val-list-bg-opacity'));
                localStorage.setItem('sttv_listText', g('val-list-text'));
                localStorage.setItem('sttv_listSvg', g('val-list-svg'));
                localStorage.setItem('sttv_themeFrame', g('val-theme-frame'));
                localStorage.setItem('sttv_frameSize', g('val-frame-size'));
                localStorage.setItem('sttv_svgSize', g('val-svg-size'));
                localStorage.setItem('sttv_svgOpacity', g('val-svg-opacity'));
                localStorage.setItem('sttv_frameRadius', g('val-frame-radius'));
                localStorage.setItem('sttv_frameColor', g('val-frame-color'));
                localStorage.setItem('sttv_frameBgOpacity', g('val-frame-bg-opacity'));
                localStorage.setItem('sttv_svgColor', g('val-svg-color'));
                localStorage.setItem('sttv_hideLabels', c('toggle-hide-labels'));
                localStorage.setItem('sttv_listFrame', c('toggle-list-frame'));
                localStorage.setItem('sttv_titleSize', g('val-title-size'));
                localStorage.setItem('sttv_titleSpacing', g('val-title-spacing'));
                localStorage.setItem('sttv_iconSize', g('val-icon-size'));
                localStorage.setItem('sttv_iconSpacing', g('val-icon-spacing'));
                localStorage.setItem('sttv_glassMode', c('toggle-glass'));
                localStorage.setItem('sttv_audioFeedback', c('toggle-audio'));
                localStorage.setItem('sttv_mediaWidth', g('val-media-width'));
                localStorage.setItem('sttv_mediaBgOpacity', g('val-media-bg-opacity'));
                localStorage.setItem('sttv_mediaBtnSize', g('val-media-btn-size'));
                localStorage.setItem('sttv_mediaBgColor', g('val-media-bg-color'));
                localStorage.setItem('sttv_mediaBtnColor', g('val-media-btn-color'));
                localStorage.setItem('sttv_mediaSvgColor', g('val-media-svg-color'));
                localStorage.setItem('sttv_mediaThemeSync', c('toggle-media-theme'));
                localStorage.setItem('sttv_themeDot', c('toggle-theme-dot'));
                localStorage.setItem('sttv_thumbSize', g('val-thumb-size'));
                localStorage.setItem('sttv_thumbColor', g('val-thumb-color'));
                localStorage.setItem('sttv_thumbTheme', g('val-thumb-theme'));

                const shadowState = {};
                SHADOW_MODES.forEach(mode => {
                    const drawer = document.getElementById(`drawer-${mode.id}`);
                    const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                    if (drawer && checkbox) {
                        shadowState[mode.id] = {
                            active: checkbox.checked, x: drawer.querySelector('.s-x').value, y: drawer.querySelector('.s-y').value,
                            b: drawer.querySelector('.s-b').value, s: drawer.querySelector('.s-s').value,
                            c: drawer.querySelector('.s-c').value, o: drawer.querySelector('.s-o').value
                        };
                    }
                });
                localStorage.setItem('sttv_shadowConfig', JSON.stringify(shadowState));
            } catch(e) { console.warn('save failed:', e); }
        }

        function packConfig() {
            const shadowArr = [];
            SHADOW_MODES.forEach(mode => {
                const drawer = document.getElementById(`drawer-${mode.id}`);
                const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                if (drawer && checkbox && checkbox.checked) {
                    shadowArr.push([
                        mode.id, drawer.querySelector('.s-x').value, drawer.querySelector('.s-y').value,
                        drawer.querySelector('.s-b').value, drawer.querySelector('.s-s').value,
                        drawer.querySelector('.s-c').value, drawer.querySelector('.s-o').value
                    ].join('*'));
                }
            });

            const configValues = [
                g('val-bg-main'), g('val-text-color'),
                localStorage.getItem('sttv_layoutMode') || 'grid', g('val-list-bg'),
                g('val-list-text'), g('val-list-svg'),
                g('val-theme-frame'), g('val-frame-size'),
                g('val-svg-size'), g('val-svg-opacity'),
                g('val-frame-radius'), g('val-frame-color'),
                g('val-svg-color'), c('toggle-hide-labels') ? 1 : 0,
                g('val-title-size'), g('val-title-spacing'),
                c('toggle-list-frame') ? 1 : 0, g('val-icon-size'),
                g('val-icon-spacing'), g('val-list-bg-opacity'),
                g('val-frame-bg-opacity'), g('val-media-width'),
                g('val-media-bg-opacity'), g('val-media-btn-size'),
                g('val-media-bg-color'), g('val-media-btn-color'),
                g('val-media-svg-color'), c('toggle-glass') ? 1 : 0,
                g('val-popup-anim'), shadowArr.join('~'),
                c('toggle-media-theme') ? 1 : 0,
                c('toggle-theme-dot') ? 1 : 0,
                g('val-thumb-size'),
                g('val-thumb-color'),
                g('val-thumb-theme')
            ];
            return encodeURIComponent(configValues.join('|'));
        }

        function unpackConfig(code) {
            if (!code) return;
            try {
                if (drawerEl) drawerEl.classList.remove('adjusting'); 
                localStorage.removeItem('sttv_customBgImage');
                root.style.setProperty('--bg-image', 'none');
                if (uploadBg) uploadBg.value = "";
                if (window.__updateFileNameDisplay) window.__updateFileNameDisplay(null);

                const decoded = decodeURIComponent(code.trim());
                const data = decoded.split('|');
                if (data.length < 29) { alert("Mã cấu hình không hợp lệ!"); return; }
                
                const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
                const setC = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };
                
                setV('val-bg-main', data[0]); setV('val-text-color', data[1]);
                setLayoutMode(data[2]); setV('val-list-bg', data[3]);
                setV('val-list-text', data[4]); setV('val-list-svg', data[5]);
                setV('val-theme-frame', data[6]);
                setV('val-frame-size', data[7]); setV('val-svg-size', data[8]); 
                setV('val-svg-opacity', data[9]); setV('val-frame-radius', data[10]); 
                setV('val-frame-color', data[11]); setV('val-svg-color', data[12]);
                setC('toggle-hide-labels', data[13] === '1'); setV('val-title-size', data[14]);
                setV('val-title-spacing', data[15]); setC('toggle-list-frame', data[16] === '1');
                setV('val-icon-size', data[17]); setV('val-icon-spacing', data[18]);
                setV('val-list-bg-opacity', data[19]); setV('val-frame-bg-opacity', data[20]);
                setV('val-media-width', data[21]); setV('val-media-bg-opacity', data[22]);
                setV('val-media-btn-size', data[23]); setV('val-media-bg-color', data[24]);
                setV('val-media-btn-color', data[25]); setV('val-media-svg-color', data[26]);
                setC('toggle-glass', data[27] === '1'); setV('val-popup-anim', data[28]);
                
                document.querySelectorAll('.shadow-switch').forEach(chk => { 
                    chk.checked = false; 
                    const drw = document.getElementById(`drawer-${chk.value}`); 
                    if (drw) drw.classList.remove('active'); 
                });

                if (data[29]) {
                    const shadows = data[29].split('~');
                    shadows.forEach(sh => {
                        const p = sh.split('*');
                        if (p.length > 1) {
                            const sId = p[0]; 
                            const shadowSwitch = document.querySelector(`input[name="active_shadow"][value="${sId}"]`);
                            if (shadowSwitch) {
                                shadowSwitch.checked = true; 
                                const drw = document.getElementById(`drawer-${sId}`); 
                                if (drw) {
                                    drw.classList.add('active');
                                    drw.querySelector('.s-x').value = p[1]; 
                                    drw.querySelector('.s-y').value = p[2];
                                    drw.querySelector('.s-b').value = p[3]; 
                                    drw.querySelector('.s-s').value = p[4]; 
                                    drw.querySelector('.s-c').value = p[5]; 
                                    if (p[6]) drw.querySelector('.s-o').value = p[6];
                                }
                            }
                        }
                    });
                }

                if (data[30] !== undefined) setC('toggle-media-theme', data[30] === '1');
                if (data[31] !== undefined) setC('toggle-theme-dot', data[31] === '1'); 
                else setC('toggle-theme-dot', true);
                if (data[32] !== undefined) setV('val-thumb-size', data[32]);
                if (data[33] !== undefined) setV('val-thumb-color', data[33]);
                if (data[34] !== undefined) setV('val-thumb-theme', data[34]);

                updateLiveVariables(true);
            } catch(e) { 
                console.error(e); 
                alert("Lỗi đọc mã cấu hình! Vui lòng thử lại."); 
            }
        }

        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', (e) => { 
                e.preventDefault(); 
                const code = packConfig();
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(code).then(() => { 
                        alert("Đã sao chép mã cấu hình thành công!"); 
                    }).catch(() => { prompt("Sao chép mã cấu hình bên dưới:", code); });
                } else {
                    prompt("Sao chép mã cấu hình bên dưới:", code);
                }
            });
        }

        const btnImport = document.getElementById('btn-import');
        if (btnImport) {
            btnImport.addEventListener('click', (e) => { 
                e.preventDefault(); 
                const code = prompt("📥 Dán mã cấu hình vào đây:"); 
                if (code) { unpackConfig(code); resetPresetToCustom(); } 
            });
        }

        const btnResetDefault = document.getElementById('btn-reset-default');
        if (btnResetDefault) {
            btnResetDefault.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('⚠️ Khôi phục tất cả cài đặt về mặc định?\n\nThao tác này sẽ xóa toàn bộ tuỳ chỉnh, hình nền, theme hiện tại và KHÔNG THỂ hoàn tác.\n\nBạn có chắc chắn?')) {
                    try {
                        const keysToRemove = [];
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && key.startsWith('sttv_')) keysToRemove.push(key);
                        }
                        keysToRemove.forEach(k => localStorage.removeItem(k));
                    } catch(err) { console.warn(err); }
                    location.reload();
                }
            });
        }

        function updateLiveVariables(saveNow = false) {
            root.style.setProperty('--bg-main', g('val-bg-main'));
            root.style.setProperty('--text-color', g('val-text-color'));
            root.style.setProperty('--frame-size', g('val-frame-size') + 'px');
            root.style.setProperty('--svg-size', g('val-svg-size') + 'px');
            root.style.setProperty('--svg-color', g('val-svg-color'));
            root.style.setProperty('--svg-opacity', g('val-svg-opacity') / 100);
            
            const rawRadius = g('val-frame-radius');
            root.style.setProperty('--frame-border-radius', rawRadius + '%'); 
            root.style.setProperty('--list-border-radius', rawRadius + 'px'); 

            root.style.setProperty('--title-size', g('val-title-size') + 'px');
            root.style.setProperty('--title-spacing', g('val-title-spacing') + 'px');
            root.style.setProperty('--icon-font-size', g('val-icon-size') + 'px');
            root.style.setProperty('--icon-spacing', g('val-icon-spacing') + 'px');
            root.style.setProperty('--label-display', c('toggle-hide-labels') ? 'none' : 'block');
            
            const currentLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
            if (btnLayoutList && btnLayoutGrid && mainContainer) {
                if (currentLayout === 'list') { 
                    btnLayoutList.classList.add('active'); 
                    btnLayoutGrid.classList.remove('active'); 
                    mainContainer.classList.add('list-mode'); 
                    mainContainer.classList.remove('grid-mode'); 
                } else { 
                    btnLayoutGrid.classList.add('active'); 
                    btnLayoutList.classList.remove('active'); 
                    mainContainer.classList.add('grid-mode'); 
                    mainContainer.classList.remove('list-mode'); 
                }
            }

            if (mainContainer) {
                if (c('toggle-list-frame')) mainContainer.classList.add('list-frame-active'); 
                else mainContainer.classList.remove('list-frame-active');
            }

            const listBgHex = g('val-list-bg');
            const listBgOpacity = g('val-list-bg-opacity');
            root.style.setProperty('--list-bg-color', listBgHex); 
            root.style.setProperty('--list-bg-rgba', hexToRgba(listBgHex, listBgOpacity)); 
            root.style.setProperty('--list-text-color', g('val-list-text'));
            root.style.setProperty('--list-svg-color', g('val-list-svg'));

            const frameSelect = g('val-theme-frame');
            const frameColorRgba = hexToRgba(g('val-frame-color'), g('val-frame-bg-opacity'));
            if (frameSelect === 'none' || !frameSelect) { 
                root.style.setProperty('--frame-bg', 'none'); 
                root.style.setProperty('--frame-bg-color', frameColorRgba); 
            } else { 
                root.style.setProperty('--frame-bg', `url('../${frameSelect}')`); 
                root.style.setProperty('--frame-bg-color', 'transparent'); 
            }
            
            if (mainContainer) {
                if (c('toggle-glass')) mainContainer.classList.add('glass-active'); 
                else mainContainer.classList.remove('glass-active');
            }

            root.style.setProperty('--media-bg-rgb', hexToRgb(g('val-media-bg-color')));
            root.style.setProperty('--media-bg-opacity', g('val-media-bg-opacity') / 100);
            root.style.setProperty('--media-width', g('val-media-width') + '%');
            root.style.setProperty('--media-btn-color', g('val-media-btn-color'));
            root.style.setProperty('--media-svg-color', g('val-media-svg-color'));
            const mediaBtnSize = g('val-media-btn-size');
            root.style.setProperty('--media-btn-size', mediaBtnSize + 'px');
            root.style.setProperty('--media-btn-play', (parseInt(mediaBtnSize) + 15) + 'px');

            root.style.setProperty('--thumb-size', g('val-thumb-size') + 'px');
            root.style.setProperty('--thumb-color', g('val-thumb-color'));
            const thumbThemeSelect = g('val-thumb-theme');
            if (thumbThemeSelect === 'none') root.style.setProperty('--thumb-bg-image', "url('../Theme/icon-dot.png')");
            else root.style.setProperty('--thumb-bg-image', `url('../${thumbThemeSelect}')`);

            const toggleMediaTheme = document.getElementById('toggle-media-theme');
            const toggleThemeDot = document.getElementById('toggle-theme-dot');
            const btnThumbThemeEl = document.getElementById('btn-thumb-theme');
            const thumbColorEl = document.getElementById('val-thumb-color');
            const thumbColorItem = thumbColorEl ? thumbColorEl.parentElement : null;
            const mediaWidget = document.querySelector('.media-player-widget');
            
            if (mediaWidget) {
                if (toggleMediaTheme && toggleMediaTheme.checked) mediaWidget.classList.add('theme-synced');
                else mediaWidget.classList.remove('theme-synced');

                if (toggleThemeDot && toggleThemeDot.checked) {
                    mediaWidget.classList.remove('pure-css-dots');
                    if (btnThumbThemeEl) btnThumbThemeEl.classList.remove('disabled');
                    if (thumbColorItem) { thumbColorItem.style.opacity = '0.5'; thumbColorItem.style.pointerEvents = 'none'; }
                } else {
                    mediaWidget.classList.add('pure-css-dots');
                    if (btnThumbThemeEl) btnThumbThemeEl.classList.add('disabled');
                    if (thumbColorItem) { thumbColorItem.style.opacity = '1'; thumbColorItem.style.pointerEvents = 'auto'; }
                }
            }

            updateShadow();
            if (saveNow) saveSettingsToLocal();
        }

        function loadSettingsFromLocal() {
            const safeSet = (id, key, fallback, isCheck = false) => {
                const el = document.getElementById(id); 
                if (!el) return;
                const val = localStorage.getItem('sttv_' + key);
                if (isCheck) el.checked = val === 'true' ? true : (val === null ? fallback : false);
                else el.value = val !== null ? val : fallback;
            };

            safeSet('val-bg-main', 'bgMain', '#121b22'); 
            safeSet('val-text-color', 'textColor', '#ffffff');
            safeSet('val-list-bg', 'listBg', '#1a1a1a'); 
            safeSet('val-list-bg-opacity', 'listBgOpacity', '10');
            safeSet('val-list-text', 'listText', '#ffffff'); 
            safeSet('val-list-svg', 'listSvg', '#ffffff');
            
            const vtf = document.getElementById('val-theme-frame');
            if (vtf) vtf.value = localStorage.getItem('sttv_themeFrame') || 'none';
            if (presetSelect) presetSelect.value = localStorage.getItem('sttv_activePreset') || 'none';
            
            const savedAnim = localStorage.getItem('sttv_popupAnim') || 'default';
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

            // ✅ FIX: khôi phục đầy đủ & đúng key cho media
            safeSet('val-media-width', 'mediaWidth', '90'); 
            safeSet('val-media-bg-opacity', 'mediaBgOpacity', '3');
            safeSet('val-media-btn-size', 'mediaBtnSize', '50'); 
            safeSet('val-media-bg-color', 'mediaBgColor', '#ffffff');
            safeSet('val-media-btn-color', 'mediaBtnColor', '#ffffff'); 
            safeSet('val-media-svg-color', 'mediaSvgColor', '#ffffff');
            safeSet('toggle-media-theme', 'mediaThemeSync', false, true);
            
            safeSet('toggle-theme-dot', 'themeDot', true, true);
            safeSet('val-thumb-size', 'thumbSize', '25');
            safeSet('val-thumb-color', 'thumbColor', '#ffffff');
            const vtt = document.getElementById('val-thumb-theme');
            if (vtt) vtt.value = localStorage.getItem('sttv_thumbTheme') || 'none';

            const savedShadowConfig = localStorage.getItem('sttv_shadowConfig');
            if (savedShadowConfig) {
                try {
                    // ✅ FIX: tách đúng 2 câu lệnh
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
                } catch(e) { console.warn('Shadow parse error:', e); }
            }

            const initLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
            if (btnLayoutList && btnLayoutGrid) {
                if (initLayout === 'list') { 
                    btnLayoutList.classList.add('active'); 
                    btnLayoutGrid.classList.remove('active'); 
                } else { 
                    btnLayoutGrid.classList.add('active'); 
                    btnLayoutList.classList.remove('active'); 
                }
            }

            const savedBg = localStorage.getItem('sttv_customBgImage'); 
            if (savedBg) root.style.setProperty('--bg-image', `url('${savedBg}')`);
        }

        loadSettingsFromLocal();
        updateLiveVariables(true);

        document.addEventListener("visibilitychange", () => { 
            if (document.visibilityState === 'hidden') saveSettingsToLocal(); 
        });
        window.addEventListener("beforeunload", saveSettingsToLocal);
    } catch(err) {
        console.error('Theme.js crashed:', err);
        if (window.__dismissIntro) window.__dismissIntro();
    }
});
