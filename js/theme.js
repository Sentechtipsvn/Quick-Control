const DEV_MODE = true; 

const SHADOW_MODES = [
    { id: 'inset', nameKey: 'shadow_inset', name: 'Bóng Chìm', template: 'inset {x}px {y}px {b}px {s}px {c}' },
    { id: 'outer', nameKey: 'shadow_outer', name: 'Bóng Ngoài', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'soft', nameKey: 'shadow_soft', name: 'Mờ Diện Rộng', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'hard', nameKey: 'shadow_hard', name: 'Nổi Khối 3D', template: '{x}px {y}px {b}px {s}px {c}' },
    { id: 'glow', nameKey: 'shadow_glow', name: 'Phát Sáng', template: '0px 0px {b}px {s}px {c}' }
];

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

    mainContainer.classList.add('intro-zoom');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            introScreen.classList.add('dismiss'); 
            mainContainer.classList.remove('intro-zoom'); 
            setTimeout(() => { introScreen.style.display = 'none'; }, 1500); 
        }, 3000); 
    });

    if (!DEV_MODE) document.body.classList.add('standard-mode');

    const badgePreset = document.getElementById('badge-preset');
    const badgeTheme = document.getElementById('badge-theme');
    
    if (localStorage.getItem('sttv_seen_preset_badge') === 'true') badgePreset?.classList.add('hidden');
    if (localStorage.getItem('sttv_seen_theme_badge') === 'true') badgeTheme?.classList.add('hidden');

    // HIỂN THỊ THÔNG SỐ TRÊN NÚM KÉO
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

            playTick();
            if (e.target.id !== 'val-theme-preset' && e.target.id !== 'val-popup-anim') {
                resetPresetToCustom();
            }
            updateLiveVariables(false); 
        }
    });

    const hideTooltip = (e) => {
        if (e.target && e.target.type === 'range') {
            globalTooltip.classList.remove('show');
        }
    };

    document.addEventListener('pointerup', hideTooltip);
    document.addEventListener('touchend', hideTooltip);
    document.addEventListener('change', (e) => {
        if (e.target && e.target.type === 'range') {
            hideTooltip(e);
            saveSettingsToLocal();
        }
    });

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

    document.querySelectorAll('.theme-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
            const val = chip.dataset.value;
            document.querySelectorAll(`.theme-chip[data-value="${val}"]`).forEach(c => c.classList.add('active'));
            document.getElementById('val-theme-frame').value = val;
            
            if (badgeTheme) { badgeTheme.classList.add('hidden'); localStorage.setItem('sttv_seen_theme_badge', 'true'); }
            resetPresetToCustom();
            updateLiveVariables(true);
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
    if (btnMoreThemes) {
        btnMoreThemes.onclick = () => { themeModal.classList.add('show'); themeOverlay.classList.add('show'); };
    }
    const closeThemeModal = document.getElementById('close-theme-modal');
    if (closeThemeModal) {
        closeThemeModal.onclick = () => { themeModal.classList.remove('show'); themeOverlay.classList.remove('show'); };
    }
    if (themeOverlay) {
        themeOverlay.onclick = () => { themeModal.classList.remove('show'); themeOverlay.classList.remove('show'); };
    }

    const presetSelect = document.getElementById('val-theme-preset');
    presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        localStorage.setItem('sttv_activePreset', val);
        if (badgePreset) { badgePreset.classList.add('hidden'); localStorage.setItem('sttv_seen_preset_badge', 'true'); }
        if (val !== 'none') unpackConfig(val);
    });

    function resetPresetToCustom() {
        presetSelect.value = 'none';
        localStorage.setItem('sttv_activePreset', 'none');
    }

    const drawerEl = document.getElementById('settings-drawer');
    const popupAnimSelect = document.getElementById('val-popup-anim');
    popupAnimSelect.addEventListener('change', (e) => {
        const animClass = e.target.value;
        drawerEl.className = 'settings-drawer ' + (drawerEl.classList.contains('open') ? 'open ' : '') + (animClass !== 'default' ? animClass : '');
        localStorage.setItem('sttv_popupAnim', animClass);
    });

    // REUSE AUDIO CONTEXT
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playTick() {
        if (!document.getElementById('toggle-audio').checked) return;
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
    }
    document.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' || e.target.type === 'checkbox' || e.target.closest('.theme-chip') || e.target.closest('.theme-chip-more')) playTick(); });

    document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
        switchBtn.addEventListener('change', (e) => {
            const drawer = document.getElementById(`drawer-${e.target.value}`);
            if (e.target.checked) drawer.classList.add('active'); else drawer.classList.remove('active');
            resetPresetToCustom();
            updateLiveVariables(true);
        });
    });

    function handleOrientation(e) {
        if (!document.getElementById('toggle-parallax').checked) return;
        let x = e.gamma; let y = e.beta; 
        if (x > 45) x = 45; if (x < -45) x = -45;
        if (y > 45) y = 45; if (y < -45) y = -45;
        root.style.setProperty('--tilt-x', (x / 10) + 'px'); 
        root.style.setProperty('--tilt-y', (y / 10) + 'px');
    }

    document.getElementById('toggle-parallax').addEventListener('change', (e) => {
        if (e.target.checked) {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(state => {
                    if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                    else { e.target.checked = false; alert('Vui lòng cấp quyền cảm biến!'); }
                }).catch(console.error);
            } else { window.addEventListener('deviceorientation', handleOrientation); }
        } else {
            window.removeEventListener('deviceorientation', handleOrientation);
            root.style.setProperty('--tilt-x', '0px'); root.style.setProperty('--tilt-y', '0px');
        }
        localStorage.setItem('sttv_parallax', e.target.checked);
    });

    const uploadBg = document.getElementById('upload-bg');
    uploadBg.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const b64 = ev.target.result; 
                localStorage.setItem('sttv_customBgImage', b64);
                root.style.setProperty('--bg-image', `url('${b64}')`);
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('clear-bg').addEventListener('click', () => { 
        localStorage.removeItem('sttv_customBgImage'); 
        root.style.setProperty('--bg-image', 'none'); 
        uploadBg.value = ""; 
    });

    const overlay = document.getElementById('settings-overlay');
    const closeSettings = () => { drawerEl.classList.remove('open'); overlay.classList.remove('open'); };
    document.getElementById('open-settings').onclick = () => { drawerEl.classList.add('open'); overlay.classList.add('open'); };
    document.getElementById('close-settings').onclick = closeSettings;
    overlay.onclick = closeSettings;

    let adjustTimeout;
    drawerEl.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            drawerEl.classList.add('adjusting'); clearTimeout(adjustTimeout);
            adjustTimeout = setTimeout(() => drawerEl.classList.remove('adjusting'), 800);
        }
    });

    const btnList = document.getElementById('btn-layout-list');
    const btnGrid = document.getElementById('btn-layout-grid');
    function setLayoutMode(mode) {
        localStorage.setItem('sttv_layoutMode', mode);
        updateLiveVariables(true);
    }
    btnList.onclick = () => { setLayoutMode('list'); resetPresetToCustom(); }; 
    btnGrid.onclick = () => { setLayoutMode('grid'); resetPresetToCustom(); };

    function hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
        else if (hex.length === 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); }
        return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    }

    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
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
            if (combinedShadow) combinedShadow += ', '; combinedShadow += shadowStr;
        });
        root.style.setProperty('--btn-shadow', combinedShadow || 'none');
    }

    function saveSettingsToLocal() {
        localStorage.setItem('sttv_bgMain', document.getElementById('val-bg-main').value);
        localStorage.setItem('sttv_textColor', document.getElementById('val-text-color').value);
        localStorage.setItem('sttv_listBg', document.getElementById('val-list-bg').value);
        localStorage.setItem('sttv_listBgOpacity', document.getElementById('val-list-bg-opacity').value);
        localStorage.setItem('sttv_listText', document.getElementById('val-list-text').value);
        localStorage.setItem('sttv_listSvg', document.getElementById('val-list-svg').value);
        localStorage.setItem('sttv_themeFrame', document.getElementById('val-theme-frame').value);
        localStorage.setItem('sttv_frameSize', document.getElementById('val-frame-size').value);
        localStorage.setItem('sttv_svgSize', document.getElementById('val-svg-size').value);
        localStorage.setItem('sttv_svgOpacity', document.getElementById('val-svg-opacity').value);
        localStorage.setItem('sttv_frameRadius', document.getElementById('val-frame-radius').value);
        localStorage.setItem('sttv_frameColor', document.getElementById('val-frame-color').value);
        localStorage.setItem('sttv_frameBgOpacity', document.getElementById('val-frame-bg-opacity').value);
        localStorage.setItem('sttv_svgColor', document.getElementById('val-svg-color').value);
        
        localStorage.setItem('sttv_hideLabels', document.getElementById('toggle-hide-labels').checked);
        localStorage.setItem('sttv_listFrame', document.getElementById('toggle-list-frame').checked);
        localStorage.setItem('sttv_titleSize', document.getElementById('val-title-size').value);
        localStorage.setItem('sttv_titleSpacing', document.getElementById('val-title-spacing').value);
        localStorage.setItem('sttv_iconSize', document.getElementById('val-icon-size').value);
        localStorage.setItem('sttv_iconSpacing', document.getElementById('val-icon-spacing').value);
        localStorage.setItem('sttv_glassMode', document.getElementById('toggle-glass').checked);
        localStorage.setItem('sttv_audioFeedback', document.getElementById('toggle-audio').checked);

        localStorage.setItem('sttv_mediaWidth', document.getElementById('val-media-width').value);
        localStorage.setItem('sttv_mediaBgOpacity', document.getElementById('val-media-bg-opacity').value);
        localStorage.setItem('sttv_mediaBtnSize', document.getElementById('val-media-btn-size').value);
        localStorage.setItem('sttv_mediaBgColor', document.getElementById('val-media-bg-color').value);
        localStorage.setItem('sttv_mediaBtnColor', document.getElementById('val-media-btn-color').value);
        localStorage.setItem('sttv_mediaSvgColor', document.getElementById('val-media-svg-color').value);

        const shadowState = {};
        SHADOW_MODES.forEach(mode => {
            const drawer = document.getElementById(`drawer-${mode.id}`);
            const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
            if (drawer && checkbox) {
                shadowState[mode.id] = {
                    active: checkbox.checked,
                    x: drawer.querySelector('.s-x').value,
                    y: drawer.querySelector('.s-y').value,
                    b: drawer.querySelector('.s-b').value,
                    s: drawer.querySelector('.s-s').value,
                    c: drawer.querySelector('.s-c').value,
                    o: drawer.querySelector('.s-o').value
                };
            }
        });
        localStorage.setItem('sttv_shadowConfig', JSON.stringify(shadowState));
    }

    // ĐÓNG GÓI CHUỖI SIÊU NHẸ (KHÔNG CẦN BASE64)
    function packConfig() {
        const shadowArr = [];
        SHADOW_MODES.forEach(mode => {
            const drawer = document.getElementById(`drawer-${mode.id}`);
            const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
            if (drawer && checkbox && checkbox.checked) {
                shadowArr.push([
                    mode.id, 
                    drawer.querySelector('.s-x').value,
                    drawer.querySelector('.s-y').value,
                    drawer.querySelector('.s-b').value,
                    drawer.querySelector('.s-s').value,
                    drawer.querySelector('.s-c').value,
                    drawer.querySelector('.s-o').value
                ].join('*'));
            }
        });

        const configValues = [
            document.getElementById('val-bg-main').value, 
            document.getElementById('val-text-color').value,
            localStorage.getItem('sttv_layoutMode') || 'grid',
            document.getElementById('val-list-bg').value,
            document.getElementById('val-list-text').value,
            document.getElementById('val-list-svg').value,
            document.getElementById('val-theme-frame').value,
            document.getElementById('val-frame-size').value,
            document.getElementById('val-svg-size').value,
            document.getElementById('val-svg-opacity').value,
            document.getElementById('val-frame-radius').value,
            document.getElementById('val-frame-color').value,
            document.getElementById('val-svg-color').value,
            document.getElementById('toggle-hide-labels').checked ? 1 : 0,
            document.getElementById('val-title-size').value,
            document.getElementById('val-title-spacing').value,
            document.getElementById('toggle-list-frame').checked ? 1 : 0,
            document.getElementById('val-icon-size').value,
            document.getElementById('val-icon-spacing').value,
            document.getElementById('val-list-bg-opacity').value,
            document.getElementById('val-frame-bg-opacity').value,
            document.getElementById('val-media-width').value,
            document.getElementById('val-media-bg-opacity').value,
            document.getElementById('val-media-btn-size').value,
            document.getElementById('val-media-bg-color').value,
            document.getElementById('val-media-btn-color').value,
            document.getElementById('val-media-svg-color').value,
            document.getElementById('toggle-glass').checked ? 1 : 0,
            document.getElementById('val-popup-anim').value,
            shadowArr.join('~')
        ];
        
        return encodeURIComponent(configValues.join('|'));
    }

    function unpackConfig(code) {
        if (!code) return;
        try {
            drawerEl.classList.remove('adjusting');
            localStorage.removeItem('sttv_customBgImage');
            root.style.setProperty('--bg-image', 'none');
            const uploadBgInput = document.getElementById('upload-bg');
            if (uploadBgInput) uploadBgInput.value = "";

            const decoded = decodeURIComponent(code.trim());
            const data = decoded.split('|');
            if (data.length < 29) {
                alert("Mã cấu hình không hợp lệ!");
                return;
            }
            
            document.getElementById('val-bg-main').value = data[0]; 
            document.getElementById('val-text-color').value = data[1];
            setLayoutMode(data[2]);
            document.getElementById('val-list-bg').value = data[3];
            document.getElementById('val-list-text').value = data[4];
            document.getElementById('val-list-svg').value = data[5];
            document.getElementById('val-theme-frame').value = data[6];
            syncThemePickerVisuals(data[6]);
            document.getElementById('val-frame-size').value = data[7];
            document.getElementById('val-svg-size').value = data[8]; 
            document.getElementById('val-svg-opacity').value = data[9];
            document.getElementById('val-frame-radius').value = data[10]; 
            document.getElementById('val-frame-color').value = data[11]; 
            document.getElementById('val-svg-color').value = data[12];
            document.getElementById('toggle-hide-labels').checked = data[13] === '1';
            document.getElementById('val-title-size').value = data[14];
            document.getElementById('val-title-spacing').value = data[15];
            document.getElementById('toggle-list-frame').checked = data[16] === '1';
            document.getElementById('val-icon-size').value = data[17];
            document.getElementById('val-icon-spacing').value = data[18];
            document.getElementById('val-list-bg-opacity').value = data[19];
            document.getElementById('val-frame-bg-opacity').value = data[20];
            document.getElementById('val-media-width').value = data[21];
            document.getElementById('val-media-bg-opacity').value = data[22];
            document.getElementById('val-media-btn-size').value = data[23];
            document.getElementById('val-media-bg-color').value = data[24];
            document.getElementById('val-media-btn-color').value = data[25];
            document.getElementById('val-media-svg-color').value = data[26];
            document.getElementById('toggle-glass').checked = data[27] === '1';
            document.getElementById('val-popup-anim').value = data[28];
            
            document.querySelectorAll('.shadow-switch').forEach(c => { 
                c.checked = false; 
                const drw = document.getElementById(`drawer-${c.value}`);
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

            updateLiveVariables(true);
        } catch(e) { 
            console.error(e);
            alert("Lỗi đọc mã cấu hình! Vui lòng thử lại."); 
        }
    }

    // NÚT XUẤT/NHẬP SỬA LỖI TƯƠNG THÍCH TRÊN WEBCLIP IOS
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', (e) => { 
            e.preventDefault();
            const code = packConfig();
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(code).then(() => {
                    alert("Đã sao chép mã cấu hình thành công!");
                }).catch(() => {
                    prompt("Sao chép mã cấu hình bên dưới:", code);
                });
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
            if (code) {
                unpackConfig(code);
                resetPresetToCustom();
            } 
        });
    }

    function updateLiveVariables(saveNow = false) {
        root.style.setProperty('--bg-main', document.getElementById('val-bg-main').value);
        root.style.setProperty('--text-color', document.getElementById('val-text-color').value);
        root.style.setProperty('--frame-size', document.getElementById('val-frame-size').value + 'px');
        root.style.setProperty('--svg-size', document.getElementById('val-svg-size').value + 'px');
        root.style.setProperty('--svg-color', document.getElementById('val-svg-color').value);
        root.style.setProperty('--svg-opacity', document.getElementById('val-svg-opacity').value / 100);
        
        const rawRadius = document.getElementById('val-frame-radius').value;
        root.style.setProperty('--frame-border-radius', rawRadius + '%'); 
        root.style.setProperty('--list-border-radius', rawRadius + 'px'); 

        root.style.setProperty('--title-size', document.getElementById('val-title-size').value + 'px');
        root.style.setProperty('--title-spacing', document.getElementById('val-title-spacing').value + 'px');
        root.style.setProperty('--icon-font-size', document.getElementById('val-icon-size').value + 'px');
        root.style.setProperty('--icon-spacing', document.getElementById('val-icon-spacing').value + 'px');
        root.style.setProperty('--label-display', document.getElementById('toggle-hide-labels').checked ? 'none' : 'block');
        
        const currentLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
        const btnList = document.getElementById('btn-layout-list');
        const btnGrid = document.getElementById('btn-layout-grid');
        if (currentLayout === 'list') { 
            btnList.classList.add('active'); btnGrid.classList.remove('active'); 
            mainContainer.classList.add('list-mode'); mainContainer.classList.remove('grid-mode');
        } else { 
            btnGrid.classList.add('active'); btnList.classList.remove('active'); 
            mainContainer.classList.add('grid-mode'); mainContainer.classList.remove('list-mode');
        }

        const isListFrame = document.getElementById('toggle-list-frame').checked;
        if (isListFrame) mainContainer.classList.add('list-frame-active'); else mainContainer.classList.remove('list-frame-active');

        const listBgHex = document.getElementById('val-list-bg').value;
        const listBgOpacity = document.getElementById('val-list-bg-opacity').value;
        root.style.setProperty('--list-bg-color', listBgHex); 
        root.style.setProperty('--list-bg-rgba', hexToRgba(listBgHex, listBgOpacity)); 
        root.style.setProperty('--list-text-color', document.getElementById('val-list-text').value);
        root.style.setProperty('--list-svg-color', document.getElementById('val-list-svg').value);

        const frameSelect = document.getElementById('val-theme-frame').value;
        const frameColorHex = document.getElementById('val-frame-color').value;
        const frameColorOpacity = document.getElementById('val-frame-bg-opacity').value;
        const frameColorRgba = hexToRgba(frameColorHex, frameColorOpacity);
        
        if (frameSelect === 'none') { 
            root.style.setProperty('--frame-bg', 'none'); 
            root.style.setProperty('--frame-bg-color', frameColorRgba);
        } else { 
            root.style.setProperty('--frame-bg', `url('../${frameSelect}')`); 
            root.style.setProperty('--frame-bg-color', 'transparent'); 
        }
        
        const glassMode = document.getElementById('toggle-glass').checked;
        if (glassMode) mainContainer.classList.add('glass-active'); else mainContainer.classList.remove('glass-active');

        const mediaBgColor = document.getElementById('val-media-bg-color').value;
        root.style.setProperty('--media-bg-rgb', hexToRgb(mediaBgColor));
        root.style.setProperty('--media-bg-opacity', document.getElementById('val-media-bg-opacity').value / 100);
        root.style.setProperty('--media-width', document.getElementById('val-media-width').value + '%');
        root.style.setProperty('--media-btn-color', document.getElementById('val-media-btn-color').value);
        root.style.setProperty('--media-svg-color', document.getElementById('val-media-svg-color').value);
        const mediaBtnSize = document.getElementById('val-media-btn-size').value;
        root.style.setProperty('--media-btn-size', mediaBtnSize + 'px');
        root.style.setProperty('--media-btn-play', (parseInt(mediaBtnSize) + 15) + 'px');

        updateShadow();
        if (saveNow) saveSettingsToLocal();
    }

    function loadSettingsFromLocal() {
        const safeSet = (id, key, fallback, isCheck = false) => {
            const el = document.getElementById(id); if (!el) return;
            const val = localStorage.getItem('sttv_' + key);
            if (isCheck) el.checked = val === 'true' ? true : (val === null ? fallback : false);
            else el.value = val !== null ? val : fallback;
        };

        safeSet('val-bg-main', 'bgMain', '#121b22'); safeSet('val-text-color', 'textColor', '#ffffff');
        safeSet('val-list-bg', 'listBg', '#1a1a1a'); safeSet('val-list-bg-opacity', 'listBgOpacity', '10');
        safeSet('val-list-text', 'listText', '#ffffff'); safeSet('val-list-svg', 'listSvg', '#ffffff');
        
        const savedFrame = localStorage.getItem('sttv_themeFrame') || 'none';
        const frameEl = document.getElementById('val-theme-frame');
        if (frameEl) frameEl.value = savedFrame;
        syncThemePickerVisuals(savedFrame);

        const savedPreset = localStorage.getItem('sttv_activePreset') || 'none';
        presetSelect.value = savedPreset;

        const savedAnim = localStorage.getItem('sttv_popupAnim') || 'default';
        const popupAnimSelect = document.getElementById('val-popup-anim');
        if (popupAnimSelect) popupAnimSelect.value = savedAnim;
        if (savedAnim !== 'default') drawerEl.classList.add(savedAnim);

        safeSet('val-frame-size', 'frameSize', '60');
        safeSet('val-svg-size', 'svgSize', '28'); safeSet('val-svg-opacity', 'svgOpacity', '100');
        safeSet('val-svg-color', 'svgColor', '#ffffff'); safeSet('val-frame-radius', 'frameRadius', '22');
        safeSet('val-frame-color', 'frameColor', '#000000'); safeSet('val-frame-bg-opacity', 'frameBgOpacity', '100');
        
        safeSet('toggle-hide-labels', 'hideLabels', false, true); safeSet('toggle-list-frame', 'listFrame', false, true);
        safeSet('val-title-size', 'titleSize', '22'); safeSet('val-title-spacing', 'titleSpacing', '0.5');
        safeSet('val-icon-size', 'iconSize', '14'); safeSet('val-icon-spacing', 'iconSpacing', '0');
        safeSet('toggle-glass', 'glassMode', false, true); safeSet('toggle-audio', 'audioFeedback', false, true);
        safeSet('toggle-parallax', 'parallax', false, true);

        safeSet('val-media-width', 'mediaWidth', '90'); safeSet('val-media-bg-opacity', 'mediaBgOpacity', '3');
        safeSet('val-media-btn-size', 'mediaBtnSize', '50'); safeSet('val-media-bg-color', 'mediaBgColor', '#ffffff');
        safeSet('val-media-btn-color', 'mediaBtnColor', '#ffffff'); safeSet('val-media-svg-color', 'mediaSvgColor', '#ffffff');

        const savedShadowConfig = localStorage.getItem('sttv_shadowConfig');
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
                            if (item.active) drawer.classList.add('active'); else drawer.classList.remove('active');
                            drawer.querySelector('.s-x').value = item.x;
                            drawer.querySelector('.s-y').value = item.y;
                            drawer.querySelector('.s-b').value = item.b;
                            drawer.querySelector('.s-s').value = item.s;
                            drawer.querySelector('.s-c').value = item.c;
                            drawer.querySelector('.s-o').value = item.o;
                        }
                    }
                });
            } catch(e) { console.error("Lỗi đọc shadow:", e); }
        }

        const initLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
        if (initLayout === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }

        const savedBg = localStorage.getItem('sttv_customBgImage'); 
        if (savedBg) root.style.setProperty('--bg-image', `url('${savedBg}')`);
    }

    loadSettingsFromLocal();
    updateLiveVariables(true);

    document.addEventListener("visibilitychange", () => { if (document.visibilityState === 'hidden') saveSettingsToLocal(); });
    window.addEventListener("beforeunload", saveSettingsToLocal);
});