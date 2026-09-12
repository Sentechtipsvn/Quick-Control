const SUPPORTED_LANGS = [
    'ar', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-GB', 'en-US', 
    'es-ES', 'es-MX', 'fa-IR', 'fi-FI', 'fil-PH', 'fr-CA', 'fr-FR', 'hi-IN', 
    'hu-HU', 'id-ID', 'it-IT', 'ja', 'ko-KR', 'ms-MY', 'nb-NO', 'nl-NL', 
    'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru', 'sv-SE', 'sw-KE', 'th-TH', 
    'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'
];

document.addEventListener("DOMContentLoaded", async () => {
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) userLang = 'en-US';

    const RTL_LANGS = ['ar', 'fa-IR', 'he'];
    if (RTL_LANGS.includes(userLang.split('-')[0]) || RTL_LANGS.includes(userLang)) {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }

    async function fetchWithCaseFallback(url1, url2) {
        try {
            let res = await fetch(url1);
            if (res.ok) return await res.json();
        } catch (e) {}
        try {
            let res2 = await fetch(url2);
            if (res2.ok) return await res2.json();
        } catch (e) {}
        return null;
    }

    const [fallbackTranslations, userTranslations, data] = await Promise.all([
        fetchWithCaseFallback(`Language/en-US.json`, `language/en-US.json`),
        fetchWithCaseFallback(`Language/${userLang}.json`, `language/${userLang}.json`),
        fetchWithCaseFallback('Data/data.json', 'data/data.json')
    ]);

    window.i18nData = { ...(fallbackTranslations || {}), ...(userTranslations || {}) };

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (window.i18nData[key]) element.innerText = window.i18nData[key];
    });

    try {
        if (!data || !data.buttons) {
            console.error("Không tải được dữ liệu Data/data.json");
            return;
        }

        const container = document.getElementById('control-panel');
        let renderArray = data.buttons;
        const savedOrder = localStorage.getItem('sttv_iconOrder');
        
        if (savedOrder) {
            const orderIds = JSON.parse(savedOrder);
            renderArray = orderIds.map(id => data.buttons.find(b => b.id === id)).filter(b => b !== undefined);
            data.buttons.forEach(b => { if (!renderArray.includes(b)) renderArray.push(b); });
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
        const btnConfirmSort = document.getElementById('btn-confirm-sort');
        let editMode = false;
        let selectedSwapNode = null;
        
        if (btnEditLayout) {
            btnEditLayout.addEventListener('click', () => {
                document.getElementById('settings-drawer').classList.remove('open');
                document.getElementById('settings-overlay').classList.remove('open');
                
                editMode = true;
                document.body.classList.add('edit-mode');
                
                btnConfirmSort.classList.remove('hidden');
                btnConfirmSort.classList.remove('active');
                
                document.querySelectorAll('.glass-btn').forEach(b => {
                    b.onclick = (e) => e.preventDefault();
                });
            });
        }

        if (btnConfirmSort) {
            btnConfirmSort.addEventListener('click', () => {
                editMode = false;
                document.body.classList.remove('edit-mode');
                btnConfirmSort.classList.add('hidden');
                
                if (selectedSwapNode) {
                    selectedSwapNode.classList.remove('selected-swap');
                    selectedSwapNode = null;
                }
                
                document.querySelectorAll('.glass-btn').forEach(b => {
                    b.onclick = null;
                });
            });
        }

        container.addEventListener('click', (e) => {
            if (!editMode) return;
            const target = e.target.closest('.glass-btn');
            if (!target) return;
            
            if (!selectedSwapNode) {
                selectedSwapNode = target;
                target.classList.add('selected-swap');
                btnConfirmSort.classList.add('active');
            } else if (selectedSwapNode === target) {
                target.classList.remove('selected-swap');
                selectedSwapNode = null;
                btnConfirmSort.classList.remove('active');
            } else {
                const temp = document.createElement('div');
                target.parentNode.insertBefore(temp, target);
                selectedSwapNode.parentNode.insertBefore(target, selectedSwapNode);
                temp.parentNode.insertBefore(selectedSwapNode, temp);
                temp.parentNode.removeChild(temp);
                
                selectedSwapNode.classList.remove('selected-swap');
                selectedSwapNode = null;
                btnConfirmSort.classList.remove('active');
                
                const newOrder = Array.from(container.querySelectorAll('.glass-btn')).map(b => b.dataset.id);
                localStorage.setItem('sttv_iconOrder', JSON.stringify(newOrder));
            }
        });

    } catch (e) { console.error("Lỗi khởi tạo danh sách nút:", e); }
});