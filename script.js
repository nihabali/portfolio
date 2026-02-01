document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadProfile();
    loadContacts();
    loadSocials();
    loadGaming();
    loadEntertainment('all'); 
    setupRippleEffect();
    setupFooter();
    
    // Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            loadEntertainment(e.target.dataset.filter);
        });
    });

    // Theme Toggle
    const toggleBtn = document.getElementById('theme-toggle');
    if(toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
});

// --- Theme Logic ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    } else {
        document.body.setAttribute('data-theme', 'light');
        updateThemeIcon(false);
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme === 'dark');
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle span');
    if(icon) icon.textContent = isDark ? 'dark_mode' : 'light_mode';
}

// --- Data Loaders ---
function loadProfile() {
    if(typeof profileData === 'undefined') return;
    document.getElementById('header-name').textContent = profileData.name;
    document.getElementById('header-tagline').textContent = profileData.tagline;
    document.getElementById('bio-content').textContent = profileData.bio;
    document.getElementById('header-avatar').src = profileData.avatarUrl;
    document.querySelector('.cover-image').src = profileData.coverUrl;
}

function loadContacts() {
    if(typeof contactsData === 'undefined') return;
    const container = document.getElementById('primary-contacts-container');
    let html = '';
    contactsData.forEach(contact => {
        html += `
            <a href="${contact.url}" target="_blank" class="contact-action-btn ripple-surface" aria-label="${contact.platform}">
                <span class="material-symbols-rounded" style="font-size: 20px;">${getIconName(contact.icon)}</span>
                <span>${contact.handle}</span>
            </a>
        `;
    });
    container.innerHTML = html;
}

function loadSocials() {
    if(typeof socialLinksData === 'undefined') return;
    const container = document.getElementById('social-grid-container');
    let html = '';
    socialLinksData.forEach(social => {
        html += `<a href="${social.url}" target="_blank" class="btn-tonal ripple-surface" aria-label="${social.name}"><span class="material-symbols-rounded">${social.icon}</span>${social.name}</a>`;
    });
    container.innerHTML = html;
}

// --- Copy Functionality ---
function copyToClipboard(text, btnElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const iconSpan = btnElement.querySelector('span');
        const originalText = iconSpan.textContent;
        
        iconSpan.textContent = 'check';
        btnElement.style.color = 'var(--md-sys-color-primary)';
        
        setTimeout(() => {
            iconSpan.textContent = originalText;
            btnElement.style.color = '';
        }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
}

// --- Gaming Loader (Custom Details) ---
function loadGaming() {
    if(typeof gamingData === 'undefined') return;
    const container = document.getElementById('gaming-container');
    let html = '';
    
    gamingData.forEach((game, index) => {
        // Generate Status Chip
        let statusClass = 'chip-outlined';
        if(game.status === 'Active') statusClass = 'status-active';
        if(game.status === 'Casual') statusClass = 'status-casual';
        if(game.status === 'Competitive') statusClass = 'status-competitive';

        // Generate Platform Chips
        const platformHtml = game.platforms.map(p => `<span class="chip chip-outlined">${p}</span>`).join('');

        // Generate Details (Dynamic from 'details' array)
        let detailsHtml = '';
        if (game.details && Array.isArray(game.details)) {
            detailsHtml = game.details.map((detail) => {
                const copyBtn = detail.copy === true ? 
                    `<button class="copy-icon-btn" onclick="copyToClipboard('${detail.value}', this)" title="Copy ${detail.label}">
                        <span class="material-symbols-rounded">content_copy</span>
                    </button>` : '';
                
                return `
                    <div class="detail-row">
                        <span class="detail-label">${detail.label}:</span>
                        <div class="detail-copy-wrapper">
                            <span class="detail-value">${detail.value}</span>
                            ${copyBtn}
                        </div>
                    </div>
                `;
            }).join('');
        }

        html += `
            <article class="game-card">
                <div class="game-header ripple-surface" onclick="toggleGameDetails(${index})">
                    <img src="${game.logo}" class="game-logo">
                    <div class="game-info">
                        <div class="game-title">${game.name}</div>
                        <div class="game-platforms">
                            <span class="chip ${statusClass}">${game.status}</span>
                            ${platformHtml}
                        </div>
                    </div>
                    <span class="material-symbols-rounded toggle-icon" id="icon-${index}">expand_more</span>
                </div>
                <div class="game-details-wrapper" id="details-${index}">
                    <div class="game-details">
                        <div class="details-content">
                            <p style="margin-bottom:8px; font-style:italic; color:var(--md-sys-color-on-surface-variant);">"${game.description}"</p>
                            <div class="detail-row"><span class="detail-label">Genre:</span> <span class="detail-value">${game.genre}</span></div>
                            <div class="detail-row"><span class="detail-label">Playtime:</span> <span class="detail-value">${game.playtime}</span></div>
                            ${detailsHtml}
                        </div>
                    </div>
                </div>
            </article>`;
    });
    container.innerHTML = html;
}

// --- Gaming Toggles ---
function toggleGamingSection() {
    const wrapper = document.getElementById('gaming-content-wrapper');
    const icon = document.getElementById('gaming-toggle-icon');
    const isOpen = wrapper.classList.toggle('open');
    icon.classList.toggle('rotated');
    icon.textContent = isOpen ? 'expand_less' : 'expand_more';
}

function toggleGameDetails(index) {
    const wrapper = document.getElementById(`details-${index}`);
    const icon = document.getElementById(`icon-${index}`);
    const isOpen = wrapper.classList.toggle('open');
    icon.classList.toggle('rotated');
    icon.textContent = isOpen ? 'expand_less' : 'expand_more';
}

// --- Entertainment ---
let currentEntView = 'grid';
function toggleEntertainmentSection() {
    const wrapper = document.getElementById('ent-content-wrapper');
    const icon = document.getElementById('ent-toggle-icon');
    const isOpen = wrapper.classList.toggle('open');
    icon.classList.toggle('rotated');
    icon.textContent = isOpen ? 'expand_less' : 'expand_more';
}

function switchView(viewType) {
    currentEntView = viewType;
    const container = document.getElementById('entertainment-container');
    const btnGrid = document.getElementById('btn-grid-view');
    const btnList = document.getElementById('btn-list-view');
    if (viewType === 'list') {
        container.classList.remove('entertainment-grid');
        container.classList.add('entertainment-container', 'list-view');
        btnList.classList.add('active'); btnGrid.classList.remove('active');
    } else {
        container.classList.add('entertainment-grid');
        container.classList.remove('entertainment-container', 'list-view');
        btnGrid.classList.add('active'); btnList.classList.remove('active');
    }
    const activeFilter = document.querySelector('.tab-btn.active').dataset.filter;
    loadEntertainment(activeFilter);
}

function loadEntertainment(filter) {
    if(typeof entertainmentData === 'undefined') return;
    const container = document.getElementById('entertainment-container');
    container.innerHTML = '';
    const filteredData = filter === 'all' ? entertainmentData : entertainmentData.filter(item => item.category === filter);
    if(currentEntView === 'list') container.className = 'entertainment-container list-view';
    else container.className = 'entertainment-grid';
    filteredData.forEach(item => {
        const wrapper = document.createElement(item.url ? 'a' : 'div');
        wrapper.className = 'media-card';
        if(item.url) { wrapper.href = item.url; wrapper.target = '_blank'; }
        wrapper.innerHTML = `<img src="${item.image}" class="media-poster" loading="lazy"><div class="media-title">${item.title}</div>`;
        container.appendChild(wrapper);
    });
}

// --- Utilities ---
function getIconName(platformIcon) { const map = { 'discord': 'gamepad', 'mail': 'mail' }; return map[platformIcon] || platformIcon; }
function setupFooter() {
    document.getElementById('year').textContent = new Date().getFullYear();
    if(typeof profileData !== 'undefined') document.getElementById('footer-name').textContent = profileData.name;
}
function setupRippleEffect() {
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.ripple-surface');
        if (target) {
            const circle = document.createElement('span');
            const diameter = Math.max(target.clientWidth, target.clientHeight);
            const radius = diameter / 2;
            const rect = target.getBoundingClientRect();
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');
            const ripple = target.getElementsByClassName('ripple')[0];
            if (ripple) ripple.remove();
            target.appendChild(circle);
        }
    });
}
