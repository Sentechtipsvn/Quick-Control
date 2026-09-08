// Hỗ trợ chuẩn 37 ngôn ngữ theo bảng mã Sếp cung cấp
const SUPPORTED_LANGS = [
    'ar', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-GB', 'en-US', 
    'es-ES', 'es-MX', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-CA', 'fr-FR', 'hi-IN', 
    'hu-HU', 'id-ID', 'it-IT', 'ja', 'ko-KR', 'ms-MY', 'nb-NO', 'nl-NL', 
    'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru', 'sv-SE', 'sw-KE', 'th-TH', 
    'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'
]; //[span_1](start_span)[span_1](end_span)

document.addEventListener("DOMContentLoaded", async () => {
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) userLang = 'en-US';

    let fallbackTranslations = {};
    try {
        const fbRes = await fetch(`Language/en-US.json`);
        if (fbRes.ok) fallbackTranslations = await fbRes.json();
    } catch (e) { console.warn("Missing English fallback"); }

    let userTranslations = {};
    try {
        const res = await fetch(`Language/${userLang}.json`);
        if (res.ok) userTranslations = await res.json();
    } catch (e) { console.warn(`Missing language: ${userLang}`); }

    window.i18nData = { ...fallbackTranslations, ...userTranslations };

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if(window.i18nData[key]) element.innerText = window.i18nData[key];
    });

    try {
        const dataRes = await fetch('Data/data.json'); 
        const data = await dataRes.json();
        const container = document.getElementById('control-panel');
        
        let renderArray = data.buttons;
        const savedOrder = localStorage.getItem('sttv_iconOrder');
        if (savedOrder) {
            const orderIds = JSON.parse(savedOrder);
            renderArray = orderIds.map(id => data.buttons.find(b => b.id === id)).filter(b => b !== undefined);
            data.buttons.forEach(b => { if(!renderArray.includes(b)) renderArray.push(b); });
        }

        if (renderArray && renderArray.length > 0) {
            renderArray.forEach(item => {
                const btn = document.createElement('a');
                btn.className = 'glass-btn';
                btn.href = item.action;
                btn.dataset.id = item.id;
                
                const localizedTitle = window.i18nData[item.title_key] || item.title || 'Phím tắt';
                btn.innerHTML = `<div class="icon-box">${item.svg}</div><span class="label">${localizedTitle}</span>`;
                container.appendChild(btn);
            });
        }

        const btnEditLayout = document.getElementById('btn-edit-layout');
        let editMode = false;
        let selectedSwapNode = null;
        
        btnEditLayout.addEventListener('click', () => {
            editMode = !editMode;
            document.body.classList.toggle('edit-mode', editMode);
            btnEditLayout.style.background = editMode ? 'red' : '';
            btnEditLayout.innerHTML = editMode ? 'Xong' : '🔄 Sắp xếp';
            
            if (!editMode && selectedSwapNode) {
                selectedSwapNode.classList.remove('selected-swap');
                selectedSwapNode = null;
            }

            document.querySelectorAll('.glass-btn').forEach(b => {
                b.onclick = editMode ? (e) => e.preventDefault() : null;
            });
        });

        container.addEventListener('click', (e) => {
            if (!editMode) return;
            const target = e.target.closest('.glass-btn');
            if (!target) return;
            
            if (!selectedSwapNode) {
                selectedSwapNode = target;
                target.classList.add('selected-swap');
            } else if (selectedSwapNode === target) {
                target.classList.remove('selected-swap');
                selectedSwapNode = null;
            } else {
                const temp = document.createElement('div');
                target.parentNode.insertBefore(temp, target);
                selectedSwapNode.parentNode.insertBefore(target, selectedSwapNode);
                temp.parentNode.insertBefore(selectedSwapNode, temp);
                temp.parentNode.removeChild(temp);
                
                selectedSwapNode.classList.remove('selected-swap');
                selectedSwapNode = null;
                
                const newOrder = Array.from(container.querySelectorAll('.glass-btn')).map(b => b.dataset.id);
                localStorage.setItem('sttv_iconOrder', JSON.stringify(newOrder));
            }
        });

    } catch (e) { console.error("Lỗi:", e); }
});