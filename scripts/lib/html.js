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
