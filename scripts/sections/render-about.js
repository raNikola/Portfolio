import fs from 'fs';

import { escapeHtml } from '../lib/html.js';

function getContactIconClass(icon) {
    const aliases = {
        'map-pinned': 'location'
    };

    return `about__icon-${escapeHtml(aliases[icon] || icon)}`;
}

function getProofIconStyle(icon) {
    return `--site-icon: url('../icons/lucide/${escapeHtml(icon)}.svg')`;
}

function renderContactItem(item) {
    const icon = `
        <span class="site-icon ${getContactIconClass(item.icon)}" aria-hidden="true"></span>
    `;
    const label = `<span>${escapeHtml(item.label)}</span>`;

    if (item.type === 'location') {
        const [country, detail] = String(item.label).split('/');
        const locationLabel = detail
            ? `<span><span itemprop="addressCountry">${escapeHtml(country.trim())}</span> / ${escapeHtml(detail.trim())}</span>`
            : label;

        return `
            <span class="about__contact-item" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
                ${icon}
                ${locationLabel}
            </span>
        `;
    }

    if (!item.url) {
        return `
            <span class="about__contact-item">
                ${icon}
                ${label}
            </span>
        `;
    }

    const itemprop = item.type === 'email' ? ' itemprop="email"' : ' itemprop="sameAs"';
    const externalAttributes = item.type === 'social' ? ' target="_blank" rel="noopener noreferrer"' : '';
    const analyticsEvent = {
        email: 'email_click',
        github: 'github_click',
        linkedin: 'linkedin_click'
    }[String(item.icon).toLowerCase()];
    const analyticsAttribute = analyticsEvent ? ` data-analytics="${analyticsEvent}"` : '';
    const ariaLabel = item.type === 'email'
        ? 'Email Nikola Randjelovic'
        : `Visit Nikola Randjelovic on ${escapeHtml(item.label)}`;

    return `
        <a class="about__contact-item" href="${escapeHtml(item.url)}"${itemprop}${externalAttributes} aria-label="${ariaLabel}"${analyticsAttribute}>
            ${icon}
            ${label}
        </a>
    `;
}

function renderValueItem(item) {
    return `
        <div class="col s12 l4 about__value-col">
            <div class="about__value-item">
                <span class="about__value-icon">
                    <span class="site-icon about__icon-${escapeHtml(item.icon)}" aria-hidden="true"></span>
                </span>
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.description)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderProofItem(item) {
    return `
        <li class="intro__proof-item col s12 l4">
            <span class="intro__proof-check">
                <span
                    class="site-icon intro__proof-icon"
                    style="${getProofIconStyle(item.icon)}"
                    aria-hidden="true">
                </span>
            </span>
            <div class="intro__proof-copy">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.description)}</span>
            </div>
        </li>
    `;
}

export function renderAbout($) {
    const about = JSON.parse(fs.readFileSync('./data/about.json', 'utf8'));
    const email = about.contact.find(item => item.type === 'email');

    $('#about-email-meta').attr('content', email?.label || '');

    $('#about-image-mobile-source')
        .attr('srcset', about.image.mobileSrcset)
        .attr('sizes', about.image.mobileSizes);

    $('#about-image-desktop-source')
        .attr('srcset', about.image.desktopSrcset)
        .attr('sizes', about.image.desktopSizes);

    $('#about-image')
        .attr('src', about.image.src)
        .attr('alt', about.image.alt)
        .attr('width', about.image.width)
        .attr('height', about.image.height);

    $('#about-name').text(about.name);
    $('#about-role').text(about.role);
    $('#about-summary').text(about.summary);

    $('#about-contact').html(about.contact.map(renderContactItem).join(''));
    $('#about-value-items').html(about.valueBar.map(renderValueItem).join(''));
    $('#about-intro').text(about.intro);
    $('#about-proof-list').html(about.proofPoints.map(renderProofItem).join(''));
    $('#about-primary-cta')
        .attr('href', about.primaryCta.href)
        .removeAttr('target')
        .removeAttr('rel')
        .removeAttr('download')
        .removeAttr('data-analytics')
        .attr('aria-label', about.primaryCta.ariaLabel);

    $('#about-primary-cta-label').text(about.primaryCta.label);
}
