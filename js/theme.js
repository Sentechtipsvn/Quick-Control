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

    // 1. CHỌN NGẪU NHIÊN 1 TRONG 3 HIỆU ỨNG CHO CHỮ INTRO
    if (introTextWrapper) {
        const effects = ['anim-wave', 'anim-bounce', 'anim-flip'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        introTextWrapper.classList.add(randomEffect);
    }

    mainContainer.classList.add('intro-zoom');
    
    // TIMELINE CHUẨN 3 GIÂY TRƯỚC KHI TÁCH ĐÔI MÀN HÌNH
    window.addEventListener('load', () => {
        setTimeout(() => {
            introScreen.classList.add('dismiss'); 
            mainContainer.classList.remove('intro-zoom'); 
            setTimeout(() => { introScreen.style.display = 'none'; }, 1500); 
        }, 3000); 
    });

    if (!DEV_MODE) {
        document.body.classList.add('standard-mode');
    }

    const badgePreset = document.getElementById('badge-preset');
    const badgeTheme = document.getElementById('badge-theme');
    
    if (localStorage.getItem('sttv_seen_preset_badge') === 'true') badgePreset?.classList.add('hidden');
    if (localStorage.getItem('sttv_seen_theme_badge') === 'true') badgeTheme?.classList.add('hidden');

    // 2. TẠO BONG BÓNG CON SỐ (TOOLTIP) CHẠY THEO NÚM KÉO CHO MỌI THANH TRƯỢT
    document.querySelectorAll('input[type="range"]').forEach(input => {
        // Tạo khối bọc thông minh để neo tooltip chạy theo %
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
            
            // Ép khung % để bóng không bị lẹm ra viền màn hình
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

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    function playTick() {
        if (!document.getElementById('toggle-audio').checked) return;
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }
    document.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' || e.target.type === 'checkbox' || e.target.closest('.theme-chip') || e.target.closest('.theme-chip-more')) playTick(); });
    
    drawerEl.addEventListener('input', (e) => { 
        if (e.target.type === 'range') playTick(); 
        if (e.target.id !== 'val-theme-preset' && e.target.id !== 'val-popup-anim') resetPresetToCustom();
    });

    document.querySelectorAll('.shadow-switch').forEach(switchBtn => {
        switchBtn.addEventListener('change', (e) => {
            const drawer = document.getElementById(`drawer-${e.target.value}`);
            if (e.target.checked) drawer.classList.add('active'); else drawer.classList.remove('active');
            resetPresetToCustom();
            updateLiveVariables();
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
        updateLiveVariables();
    });

    const btnList = document.getElementById('btn-layout-list');
    const btnGrid = document.getElementById('btn-layout-grid');
    function setLayoutMode(mode) {
        localStorage.setItem('sttv_layoutMode', mode);
        if (mode === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }
        updateLiveVariables();
    }
    btnList.onclick = () => { setLayoutMode('list'); resetPresetToCustom(); }; 
    btnGrid.onclick = () => { setLayoutMode('grid'); resetPresetToCustom(); };

    const infoModal = document.getElementById('info-modal');
    const infoOverlay = document.getElementById('info-overlay');
    document.getElementById('btn-info').onclick = () => { infoModal.classList.add('show'); infoOverlay.classList.add('show'); };
    document.getElementById('close-info').onclick = () => { infoModal.classList.remove('show'); infoOverlay.classList.remove('show'); };
    infoOverlay.onclick = (e) => { 
        if(e.target.id === 'info-overlay') { infoModal.classList.remove('show'); infoOverlay.classList.remove('show'); }
    };

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

    function packConfig() {
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

        const fullConfig = {
            bgMain: document.getElementById('val-bg-main').value, 
            textColor: document.getElementById('val-text-color').value,
            layoutMode: localStorage.getItem('sttv_layoutMode') || 'grid',
            listBg: document.getElementById('val-list-bg').value,
            listText: document.getElementById('val-list-text').value,
            listSvg: document.getElementById('val-list-svg').value,
            themeFrame: document.getElementById('val-theme-frame').value,
            frameSize: document.getElementById('val-frame-size').value,
            svgSize: document.getElementById('val-svg-size').value,
            svgOpacity: document.getElementById('val-svg-opacity').value,
            frameRadius: document.getElementById('val-frame-radius').value,
            frameColor: document.getElementById('val-frame-color').value,
            svgColor: document.getElementById('val-svg-color').value,
            hideLabels: document.getElementById('toggle-hide-labels').checked,
            titleSize: document.getElementById('val-title-size').value,
            titleSpacing: document.getElementById('val-title-spacing').value,
            listFrame: document.getElementById('toggle-list-frame').checked,
            iconSize: document.getElementById('val-icon-size').value,
            iconSpacing: document.getElementById('val-icon-spacing').value,
            listBgOpacity: document.getElementById('val-list-bg-opacity').value,
            frameBgOpacity: document.getElementById('val-frame-bg-opacity').value,
            mediaWidth: document.getElementById('val-media-width').value,
            mediaBgOpacity: document.getElementById('val-media-bg-opacity').value,
            mediaBtnSize: document.getElementById('val-media-btn-size').value,
            mediaBgColor: document.getElementById('val-media-bg-color').value,
            mediaBtnColor: document.getElementById('val-media-btn-color').value,
            mediaSvgColor: document.getElementById('val-media-svg-color').value,
            glassMode: document.getElementById('toggle-glass').checked,
            popupAnim: document.getElementById('val-popup-anim').value,
            shadowConfig: shadowState
        };

        return btoa(unescape(encodeURIComponent(JSON.stringify(fullConfig)))); 
    }

    function unpackConfig(base64Str) {
        try {
            drawerEl.classList.remove('adjusting');
            const decodedStr = decodeURIComponent(escape(atob(base64Str)));
            let config;
            try { config = JSON.parse(decodedStr); } catch(e) { alert("Mã không hợp lệ!"); return; }
            
            localStorage.removeItem('sttv_customBgImage');
            root.style.setProperty('--bg-image', 'none');
            const uploadBgInput = document.getElementById('upload-bg');
            if (uploadBgInput) uploadBgInput.value = "";

            if (Array.isArray(config)) {
                if (config.length < 13) throw 'Lỗi mã cũ';
                if(config[0]) { document.getElementById('val-bg-main').value = config[0]; root.style.setProperty('--bg-main', config[0]); }
                document.getElementById('val-text-color').value = config[1];
                setLayoutMode(config[2]);
                document.getElementById('val-list-bg').value = config[3];
                document.getElementById('val-list-text').value = config[4];
                document.getElementById('val-list-svg').value = config[5];
                
                document.getElementById('val-theme-frame').value = config[6];
                syncThemePickerVisuals(config[6]);

                document.getElementById('val-frame-size').value = config[7];
                document.getElementById('val-svg-size').value = config[8]; 
                document.getElementById('val-svg-opacity').value = config[9];
                document.getElementById('val-frame-radius').value = config[10]; 
                document.getElementById('val-frame-color').value = config[11]; 
                document.getElementById('val-svg-color').value = config[12];
                
                document.querySelectorAll('.shadow-switch').forEach(c => { c.checked = false; document.getElementById(`drawer-${c.value}`).classList.remove('active'); });
                if (config[13] && config[13].length > 0) {
                    const sId = config[13][0]; 
                    const shadowSwitch = document.querySelector(`input[name="active_shadow"][value="${sId}"]`);
                    if(shadowSwitch) {
                        shadowSwitch.checked = true;
                        const drw = document.getElementById(`drawer-${sId}`); 
                        if(drw){
                            drw.classList.add('active');
                            drw.querySelector('.s-x').value = config[13][1]; drw.querySelector('.s-y').value = config[13][2];
                            drw.querySelector('.s-b').value = config[13][3]; drw.querySelector('.s-s').value = config[13][4]; drw.querySelector('.s-c').value = config[13][5];
                            if(config[13].length > 6) drw.querySelector('.s-o').value = config[13][6];
                        }
                    }
                }
                if(config.length >= 17) {
                    document.getElementById('toggle-hide-labels').checked = config[14];
                    document.getElementById('val-title-size').value = config[15];
                    document.getElementById('val-title-spacing').value = config[16];
                }
                if(config.length >= 18) document.getElementById('toggle-list-frame').checked = config[17];
                if(config.length >= 20) {
                    document.getElementById('val-icon-size').value = config[18];
                    document.getElementById('val-icon-spacing').value = config[19];
                }
                document.getElementById('val-list-bg-opacity').value = config.length >= 21 ? config[20] : 10;
                document.getElementById('val-frame-bg-opacity').value = config.length >= 22 ? config[21] : 100;
                
                if(config.length >= 28) {
                    document.getElementById('val-media-width').value = config[22];
                    document.getElementById('val-media-bg-opacity').value = config[23];
                    document.getElementById('val-media-btn-size').value = config[24];
                    document.getElementById('val-media-bg-color').value = config[25];
                    document.getElementById('val-media-btn-color').value = config[26];
                    document.getElementById('val-media-svg-color').value = config[27];
                }
            } else {
                if (config.bgMain) { document.getElementById('val-bg-main').value = config.bgMain; root.style.setProperty('--bg-main', config.bgMain); }
                if (config.textColor) document.getElementById('val-text-color').value = config.textColor;
                if (config.layoutMode) setLayoutMode(config.layoutMode);
                if (config.listBg) document.getElementById('val-list-bg').value = config.listBg;
                if (config.listText) document.getElementById('val-list-text').value = config.listText;
                if (config.listSvg) document.getElementById('val-list-svg').value = config.listSvg;
                if (config.listBgOpacity) document.getElementById('val-list-bg-opacity').value = config.listBgOpacity;
                if (config.listFrame !== undefined) document.getElementById('toggle-list-frame').checked = config.listFrame;

                if (config.themeFrame) {
                    document.getElementById('val-theme-frame').value = config.themeFrame;
                    syncThemePickerVisuals(config.themeFrame);
                }
                if (config.frameSize) document.getElementById('val-frame-size').value = config.frameSize;
                if (config.svgSize) document.getElementById('val-svg-size').value = config.svgSize;
                if (config.svgOpacity) document.getElementById('val-svg-opacity').value = config.svgOpacity;
                if (config.frameRadius) document.getElementById('val-frame-radius').value = config.frameRadius;
                if (config.frameColor) document.getElementById('val-frame-color').value = config.frameColor;
                if (config.frameBgOpacity) document.getElementById('val-frame-bg-opacity').value = config.frameBgOpacity;
                if (config.svgColor) document.getElementById('val-svg-color').value = config.svgColor;

                if (config.hideLabels !== undefined) document.getElementById('toggle-hide-labels').checked = config.hideLabels;
                if (config.titleSize) document.getElementById('val-title-size').value = config.titleSize;
                if (config.titleSpacing) document.getElementById('val-title-spacing').value = config.titleSpacing;
                if (config.iconSize) document.getElementById('val-icon-size').value = config.iconSize;
                if (config.iconSpacing) document.getElementById('val-icon-spacing').value = config.iconSpacing;

                if (config.mediaWidth) document.getElementById('val-media-width').value = config.mediaWidth;
                if (config.mediaBgOpacity) document.getElementById('val-media-bg-opacity').value = config.mediaBgOpacity;
                if (config.mediaBtnSize) document.getElementById('val-media-btn-size').value = config.mediaBtnSize;
                if (config.mediaBgColor) document.getElementById('val-media-bg-color').value = config.mediaBgColor;
                if (config.mediaBtnColor) document.getElementById('val-media-btn-color').value = config.mediaBtnColor;
                if (config.mediaSvgColor) document.getElementById('val-media-svg-color').value = config.mediaSvgColor;

                if (config.glassMode !== undefined) document.getElementById('toggle-glass').checked = config.glassMode;
                if (config.popupAnim) {
                    document.getElementById('val-popup-anim').value = config.popupAnim;
                    drawerEl.className = 'settings-drawer ' + (config.popupAnim !== 'default' ? config.popupAnim : '');
                }

                if (config.shadowConfig) {
                    SHADOW_MODES.forEach(mode => {
                        const item = config.shadowConfig[mode.id];
                        const checkbox = document.querySelector(`input[name="active_shadow"][value="${mode.id}"]`);
                        const drawer = document.getElementById(`drawer-${mode.id}`);
                        if (item && checkbox && drawer) {
                            checkbox.checked = item.active;
                            if (item.active) drawer.classList.add('active'); else drawer.classList.remove('active');
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
    if (btnExport) {
        btnExport.onclick = () => { 
            navigator.clipboard.writeText(packConfig()).then(() => {
                const msg = window.i18nData?.['msg_copy_success'] || "Đã sao chép mã cấu hình!";
                alert(msg);
            }); 
        };
    }

    const btnImport = document.getElementById('btn-import');
    if (btnImport) {
        btnImport.onclick = () => { 
            const promptText = window.i18nData?.['msg_prompt_import'] || "📥 Dán mã cấu hình vào đây:";
            const code = prompt(promptText); 
            if (code) {
                unpackConfig(code);
                resetPresetToCustom();
            } 
        };
    }

    function updateLiveVariables() {
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
        if (currentLayout === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }

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
        if(glassMode) mainContainer.classList.add('glass-active'); else mainContainer.classList.remove('glass-active');

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
        saveSettingsToLocal();
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
        if(frameEl) frameEl.value = savedFrame;
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
            } catch(e) { console.error("Lỗi đọc cấu hình shadow:", e); }
        }

        const initLayout = localStorage.getItem('sttv_layoutMode') || 'grid';
        if (initLayout === 'list') { btnList.classList.add('active'); btnGrid.classList.remove('active'); } 
        else { btnGrid.classList.add('active'); btnList.classList.remove('active'); }

        const savedBg = localStorage.getItem('sttv_customBgImage'); 
        if (savedBg) {
            root.style.setProperty('--bg-image', `url('${savedBg}')`);
        }
    }

    loadSettingsFromLocal();
    updateLiveVariables();

    document.addEventListener("visibilitychange", function() { if (document.visibilityState === 'hidden') saveSettingsToLocal(); });
    window.addEventListener("beforeunload", saveSettingsToLocal);
});