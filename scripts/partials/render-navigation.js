function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderNavLink(item, options = {}) {
    const closeClass = options.closeOnClick ? ' class="sidenav-close"' : '';
    const activeClass = item.active ? ' class="active"' : '';
    const linkClass = closeClass || activeClass;

    return `
        <li>
            <a${linkClass} href="${escapeHtml(item.href)}">
                ${escapeHtml(item.label)}
                ${options.withBar ? '<span class="nav-active-bar"></span>' : ''}
            </a>
        </li>
    `;
}

function renderThemeToggle(options = {}) {
    const closeClass = options.closeOnClick ? ' sidenav-close' : '';

    return `
        <li class="theme-toggle-item">
            <button class="theme-toggle${closeClass}" type="button" data-theme-toggle aria-label="Switch to dark theme" aria-pressed="false">
                <span class="site-icon theme-toggle__icon theme-toggle__icon--light" style="--site-icon: url('../icons/lucide/sun.svg')" aria-hidden="true"></span>
                <span class="site-icon theme-toggle__icon theme-toggle__icon--dark" style="--site-icon: url('../icons/lucide/moon.svg')" aria-hidden="true"></span>
                <span class="sr-only" data-theme-toggle-label>Switch to dark theme</span>
            </button>
        </li>
    `;
}

export function renderDesktopNavigation(items) {
    return `${items.map(item => renderNavLink(item, { withBar: true })).join('')}${renderThemeToggle()}`;
}

export function renderMobileNavigation(items) {
    return `${items.map(item => renderNavLink(item, { closeOnClick: true })).join('')}${renderThemeToggle({ closeOnClick: true })}`;
}
