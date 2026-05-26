import { escapeHtml } from '../lib/html.js';

function renderNavLink(item, options = {}) {
    const linkClasses = ['ui-nav__link'];
    if (options.closeOnClick) {
        linkClasses.push('sidenav-close');
    }
    if (item.active) {
        linkClasses.push('is-active');
    }

    return `
        <li class="ui-nav__item">
            <a class="${linkClasses.join(' ')}" href="${escapeHtml(item.href)}">
                ${escapeHtml(item.label)}
                ${options.withBar ? '<span class="nav-active-bar"></span>' : ''}
            </a>
        </li>
    `;
}

function renderThemeToggle(options = {}) {
    const closeClass = options.closeOnClick ? ' sidenav-close' : '';

    return `
        <li class="ui-nav__item theme-toggle-item">
            <button class="ui-nav__theme-toggle theme-toggle${closeClass}" type="button" data-theme-toggle aria-label="Switch to dark theme" aria-pressed="false">
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
