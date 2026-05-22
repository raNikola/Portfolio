export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function renderAttrs(attributes = {}) {
    return Object.entries(attributes)
        .filter(([, value]) => value !== false && value !== null && value !== undefined)
        .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${escapeHtml(value)}"`)
        .join('');
}

export function renderIcon(icon, className, options = {}) {
    if (!icon) {
        return '';
    }

    const iconClass = options.iconClass || 'site-icon';
    const iconPath = options.iconPath || `../icons/lucide/${escapeHtml(icon)}.svg`;

    return `
        <span class="${escapeHtml(className)}" aria-hidden="true">
            <span
                class="${escapeHtml(iconClass)}"
                style="--site-icon: url('${iconPath}')">
            </span>
        </span>
    `;
}

export function renderChips(items, className) {
    if (!items || !items.length) {
        return '';
    }

    return `
        <div class="${escapeHtml(className)}">
            ${items.map(item => `<div class="chip">${escapeHtml(item)}</div>`).join('')}
        </div>
    `;
}
