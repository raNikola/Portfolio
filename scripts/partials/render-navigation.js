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
                ${options.withBar ? '<span class="green light-green"></span>' : ''}
            </a>
        </li>
    `;
}

export function renderDesktopNavigation(items) {
    return items.map(item => renderNavLink(item, { withBar: true })).join('');
}

export function renderMobileNavigation(items) {
    return items.map(item => renderNavLink(item, { closeOnClick: true })).join('');
}
