const SUPPORTED_LANGS = ['ar', 'en-GB', 'en-US', 'vi-VN', 'zh-CN', 'zh-TW'];

document.addEventListener("DOMContentLoaded", async () => {
    let userLang = navigator.language || navigator.userLanguage;
    if (!SUPPORTED_LANGS.includes(userLang)) userLang = 'en-US';

    // 1. Tải ngôn ngữ Fallback Tiếng Anh (Làm gốc chuẩn ngữ pháp)
    let fallbackTranslations = {};
    try {
        const fbRes = await fetch(`Language/en-US.json`);
        if (fbRes.ok) fallbackTranslations = await fbRes.json();
    } catch (e) { console.warn("Missing English fallback"); }

    // 2. Tải ngôn ngữ theo thiết bị người dùng (vi-VN)
    let userTranslations = {};
    try {
        const res = await fetch(`Language/${userLang}.json`);
        if (res.ok) userTranslations = await res.json();
    } catch (e) { console.warn(`Missing language: ${userLang}`); }

    // 3. Hợp nhất: Ưu tiên ngôn ngữ thiết bị, nếu thiếu khóa nào tự động dùng Tiếng Anh
    window.i18nData = { ...fallbackTranslations, ...userTranslations };

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if(window.i18nData[key]) element.innerText = window.i18nData[key];
    });

    try {
        const dataRes = await fetch('Data/data.json'); 
        const data = await dataRes.json();
        const container = document.getElementById('control-panel');
        
        if (document.getElementById('open-settings') && data.config && data.config.settings_icon) {
            document.getElementById('open-settings').innerHTML = data.config.settings_icon;
        }

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

        // --- HỆ THỐNG KÉO THẢ CẢM ỨNG (TOUCH DRAG & DROP) CHO LƯỚI 2D ---
        const btnEditLayout = document.getElementById('btn-edit-layout');
        let editMode = false;
        
        btnEditLayout.addEventListener('click', () => {
            editMode = !editMode;
            document.body.classList.toggle('edit-mode', editMode);
            btnEditLayout.style.background = editMode ? 'red' : '';
            btnEditLayout.innerHTML = editMode ? 'Xong' : '🔄 Sắp xếp';
            document.querySelectorAll('.glass-btn').forEach(b => {
                b.onclick = editMode ? (e) => e.preventDefault() : null;
            });
        });

        let draggedItem = null;
        let ghostEl = null;

        // Bắt sự kiện chạm ngón tay
        container.addEventListener('touchstart', (e) => {
            if (!editMode) return;
            const target = e.target.closest('.glass-btn');
            if (!target) return;
            
            draggedItem = target;
            draggedItem.classList.add('dragging');
            
            ghostEl = draggedItem.cloneNode(true);
            ghostEl.style.position = 'absolute';
            ghostEl.style.zIndex = 1000;
            ghostEl.style.opacity = '0.8';
            ghostEl.style.transform = 'scale(1.1)';
            ghostEl.style.pointerEvents = 'none'; // Phải có để elementFromPoint nhìn xuyên qua bóng mờ
            document.body.appendChild(ghostEl);
            
            const touch = e.touches[0];
            ghostEl.style.left = (touch.pageX - ghostEl.offsetWidth / 2) + 'px';
            ghostEl.style.top = (touch.pageY - ghostEl.offsetHeight / 2) + 'px';
        }, {passive: false});
        
        // Bắt sự kiện di chuyển ngón tay (Thuật toán sắp xếp ma trận 2D)
        container.addEventListener('touchmove', (e) => {
            if (!editMode || !draggedItem || !ghostEl) return;
            e.preventDefault(); 
            const touch = e.touches[0];
            
            ghostEl.style.left = (touch.pageX - ghostEl.offsetWidth / 2) + 'px';
            ghostEl.style.top = (touch.pageY - ghostEl.offsetHeight / 2) + 'px';
            
            // Tìm nút thực tế ngón tay đang đè lên (nhìn xuyên qua ghostEl nhờ pointerEvents none)
            const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropZone = targetEl ? targetEl.closest('.glass-btn:not(.dragging)') : null;
            
            if (dropZone && dropZone !== draggedItem) {
                const allElements = [...container.querySelectorAll('.glass-btn')];
                const draggedIndex = allElements.indexOf(draggedItem);
                const dropIndex = allElements.indexOf(dropZone);
                
                // Thuật toán Đổi chỗ: Kéo xuôi chèn sau, kéo ngược chèn trước
                if (draggedIndex < dropIndex) {
                    dropZone.after(draggedItem);
                } else {
                    dropZone.before(draggedItem);
                }
            }
        }, {passive: false});
        
        container.addEventListener('touchend', () => {
            if (!editMode || !draggedItem) return;
            if (ghostEl) { document.body.removeChild(ghostEl); ghostEl = null; }
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            
            const newOrder = Array.from(container.querySelectorAll('.glass-btn')).map(b => b.dataset.id);
            localStorage.setItem('sttv_iconOrder', JSON.stringify(newOrder));
        });

    } catch (e) { console.error("Lỗi:", e); }
});