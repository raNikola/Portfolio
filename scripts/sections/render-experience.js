import fs from 'fs';

const CTA_FALLBACK = 'View details';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderCompany(company, className) {
    if (!company || !company.name) {
        return '';
    }

    if (!company.url) {
        return `<span class="${className}">${escapeHtml(company.name)}</span>`;
    }

    return `
        <a
            href="${escapeHtml(company.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="${className}">
            ${escapeHtml(company.name)}
        </a>
    `;
}

function renderChips(items, className) {
    if (!items || !items.length) {
        return '';
    }

    return `
        <div class="${className}">
            ${items.map(item => `<div class="chip">${escapeHtml(item)}</div>`).join('')}
        </div>
    `;
}

function renderIcon(icon, className) {
    if (!icon) {
        return '';
    }

    return `
        <span class="${className}" aria-hidden="true">
            <span
                class="site-icon"
                style="--site-icon: url('../icons/lucide/${escapeHtml(icon)}.svg')">
            </span>
        </span>
    `;
}

function renderMetrics(metrics) {
    if (!metrics || !metrics.length) {
        return '';
    }

    return `
        <div class="row experience__metrics">
            ${metrics.map(metric => `
                <div class="col s6 m3">
                    <div class="experience__metric">
                        ${renderIcon(metric.icon, 'experience__metric-icon')}

                        <div class="experience__metric-copy">
                            <strong>${escapeHtml(metric.value)}</strong>
                            <span>${escapeHtml(metric.label)}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderDetailBlock(block) {
    const list = block.items && block.items.length
        ? `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';

    const content = block.content
        ? `<p>${escapeHtml(block.content)}</p>`
        : '';

    return `
        <div class="experience__detail-block">
            <h5>${escapeHtml(block.title)}</h5>
            ${content}
            ${list}
        </div>
    `;
}

function renderDetails(item) {
    if (!item.details || !item.details.length) {
        return '';
    }

    return `
        <div id="${escapeHtml(item.id)}-details" class="experience__details" aria-hidden="true">
            <div class="experience__details-inner">
                ${item.details.map(renderDetailBlock).join('')}
            </div>
        </div>
    `;
}

function renderFeaturedCard(item) {
    const detailsId = `${item.id}-details`;

    return `
        <div class="col s12 experience__timeline-item">
            <div class="experience__timeline-date hide-on-small-only">${escapeHtml(item.period)}</div>
            <span class="experience__timeline-dot hide-on-small-only" aria-hidden="true"></span>

            <div class="experience__timeline-content">
                <div class="card experience__card experience__card--featured" data-experience-card>
                    <div class="card-content experience__card-content">
                        <div class="experience__card-header">
                            <div>
                                <span class="experience__period hide-on-med-and-up">${escapeHtml(item.period)}</span>
                                <span class="card-title experience__title">${escapeHtml(item.role)}</span>
                                ${renderCompany(item.company, 'experience__company')}
                            </div>

                            ${item.status ? `<span class="experience__badge">${escapeHtml(item.status)}</span>` : ''}
                        </div>

                        ${item.location ? `<span class="experience__location">${escapeHtml(item.location)}</span>` : ''}

                        <p class="experience__summary">${escapeHtml(item.summary)}</p>
                        ${renderChips(item.tags, 'experience__chips')}
                        ${renderMetrics(item.metrics)}
                    </div>

                    <div class="card-action experience__action">
                        <button
                            type="button"
                            class="waves-effect experience__toggle"
                            data-target="${escapeHtml(detailsId)}"
                            aria-expanded="false"
                            aria-controls="${escapeHtml(detailsId)}">
                            ${escapeHtml(item.cta || CTA_FALLBACK)}
                        </button>
                    </div>

                    ${renderDetails(item)}
                </div>
            </div>
        </div>
    `;
}

function renderMiniCard(item) {
    return `
        <div class="card experience__mini-card">
            <div class="card-content">
                <span class="card-title">${escapeHtml(item.role)}</span>
                ${renderCompany(item.company, 'experience__company')}
                <div class="experience__mini-period">${escapeHtml(item.period)}</div>
                <p>${escapeHtml(item.summary)}</p>
                ${renderChips(item.stack, 'experience__mini-stack')}
            </div>
        </div>
    `;
}

function renderGroupCard(group, groupedItems) {
    const detailsId = `${group.id}-details`;
    const companies = group.companies && group.companies.length
        ? `<p class="experience__foundation-companies">${group.companies.map(escapeHtml).join(' &middot; ')}</p>`
        : '';
    const subtitle = group.subtitle
        ? `<p class="experience__foundation-subtitle">${escapeHtml(group.subtitle)}</p>`
        : '';

    return `
        <div class="col s12 experience__timeline-item experience__timeline-item--foundation">
            <div class="experience__timeline-date hide-on-small-only">${escapeHtml(group.period)}</div>
            <span class="experience__timeline-dot hide-on-small-only" aria-hidden="true"></span>

            <div class="experience__timeline-content">
                <div class="card experience__card experience__card--foundation" data-experience-card>
                    <div class="card-content experience__card-content">
                        <div class="experience__foundation-layout">
                            ${renderIcon(group.icon, 'experience__foundation-icon')}

                            <div class="experience__foundation-content">
                                <div class="experience__card-header">
                                    <div>
                                        <span class="experience__period hide-on-med-and-up">${escapeHtml(group.period)}</span>
                                        <span class="card-title experience__title">${escapeHtml(group.title)}</span>
                                        ${subtitle}
                                        ${companies}
                                    </div>
                                </div>

                                ${renderChips(group.tags, 'experience__chips experience__foundation-tags')}
                                <p class="experience__summary">${escapeHtml(group.summary)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-action experience__action experience__action--foundation">
                        <button
                            type="button"
                            class="waves-effect experience__toggle"
                            data-target="${escapeHtml(detailsId)}"
                            aria-expanded="false"
                            aria-controls="${escapeHtml(detailsId)}">
                            ${escapeHtml(group.cta || CTA_FALLBACK)}
                        </button>
                    </div>

                    <div id="${escapeHtml(detailsId)}" class="experience__details" aria-hidden="true">
                        <div class="experience__details-inner">
                            <div class="experience__mini-cards">
                                ${groupedItems.map(renderMiniCard).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderExperience($) {
    const experience = JSON.parse(fs.readFileSync('./data/experience.json', 'utf8'));

    $('#experience-eyebrow').text(experience.section.eyebrow);
    $('#experience-title').text(experience.section.title);
    $('#experience-intro').text(experience.section.intro);

    const featuredItems = experience.items.filter(item => item.type === 'featured');
    const groupedCards = experience.groups.map((group) => {
        const groupedItems = experience.items.filter(item =>
            item.type === 'grouped' && item.groupId === group.id
        );

        return renderGroupCard(group, groupedItems);
    });

    const cardsHtml = `
        <div class="experience__timeline">
            ${[
        ...featuredItems.map(renderFeaturedCard),
        ...groupedCards
            ].join('')}
        </div>
    `;

    $('#experience-cards').html(cardsHtml);
}
