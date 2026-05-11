(function () {
    const dataUrl = '/assets/data/experience.json';
    const fallbackDataUrl = 'assets/data/experience.json';

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

    function renderMetrics(metrics) {
        if (!metrics || !metrics.length) {
            return '';
        }

        return `
            <div class="row experience__metrics">
                ${metrics.map(metric => `
                    <div class="col s6 m3">
                        <div class="experience__metric">
                            <strong>${escapeHtml(metric.value)}</strong>
                            <span>${escapeHtml(metric.label)}</span>
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
                <span class="experience__timeline-marker" aria-hidden="true"></span>

                <div class="experience__timeline-content">
                    <div class="card experience__card experience__card--featured" data-experience-card>
                        <div class="card-content experience__card-content">
                            <div class="experience__meta">
                                <span class="experience__period">${escapeHtml(item.period)}</span>
                                ${item.status ? `<span class="experience__badge">${escapeHtml(item.status)}</span>` : ''}
                            </div>

                            <span class="card-title experience__title">${escapeHtml(item.role)}</span>
                            ${renderCompany(item.company, 'experience__company')}
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
                                ${escapeHtml(item.cta || 'View details')}
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

    function renderFoundationCard(group, groupedItems) {
        const detailsId = `${group.id}-details`;

        return `
            <div class="col s12 experience__timeline-item experience__timeline-item--foundation">
                <span class="experience__timeline-marker" aria-hidden="true"></span>

                <div class="experience__timeline-content">
                    <div class="card experience__card experience__card--foundation" data-experience-card>
                        <div class="card-content experience__card-content">
                            <div class="experience__meta">
                                <span class="experience__period">${escapeHtml(group.period)}</span>
                            </div>

                            <span class="card-title experience__title">${escapeHtml(group.title)}</span>
                            <p class="experience__summary">${escapeHtml(group.summary)}</p>
                        </div>

                        <div class="card-action experience__action">
                            <button
                                type="button"
                                class="waves-effect experience__toggle"
                                data-target="${escapeHtml(detailsId)}"
                                aria-expanded="false"
                                aria-controls="${escapeHtml(detailsId)}">
                                ${escapeHtml(group.cta)}
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

    function closeCard(card) {
        const toggle = card.querySelector('.experience__toggle');
        const details = card.querySelector('.experience__details');

        card.classList.remove('is-open');

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }

        if (details) {
            details.setAttribute('aria-hidden', 'true');
        }
    }

    function openCard(card) {
        const toggle = card.querySelector('.experience__toggle');
        const details = card.querySelector('.experience__details');

        card.classList.add('is-open');

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
        }

        if (details) {
            details.setAttribute('aria-hidden', 'false');
        }
    }

    function bindExperienceCards(section) {
        section.querySelectorAll('.experience__toggle').forEach(toggle => {
            toggle.addEventListener('click', function () {
                const currentCard = this.closest('[data-experience-card]');
                const isOpen = currentCard.classList.contains('is-open');

                section.querySelectorAll('[data-experience-card]').forEach(closeCard);

                if (!isOpen) {
                    openCard(currentCard);
                }
            });
        });
    }

    function renderExperience(data) {
        const section = document.getElementById('experience');
        const cards = document.getElementById('experience-cards');

        if (!section || !cards || !data) {
            return;
        }

        const eyebrow = document.getElementById('experience-eyebrow');
        const title = document.getElementById('experience-title');
        const intro = document.getElementById('experience-intro');

        if (eyebrow) {
            eyebrow.textContent = data.section.eyebrow;
        }

        if (title) {
            title.textContent = data.section.title;
        }

        if (intro) {
            intro.textContent = data.section.intro;
        }

        const featuredItems = data.items.filter(item => item.type === 'featured');
        const foundationGroup = data.groups.find(group => group.id === 'technical-foundation');
        const foundationItems = data.items.filter(item =>
            item.type === 'grouped' && item.groupId === 'technical-foundation'
        );

        cards.innerHTML = `
            <div class="experience__timeline">
                ${[
            ...featuredItems.map(renderFeaturedCard),
            foundationGroup ? renderFoundationCard(foundationGroup, foundationItems) : ''
                ].join('')}
            </div>
        `;

        bindExperienceCards(section);
    }

    function loadExperience() {
        fetch(dataUrl)
            .catch(() => fetch(fallbackDataUrl))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Experience data failed to load');
                }

                return response.json();
            })
            .then(renderExperience)
            .catch(error => {
                console.error(error);
            });
    }

    document.addEventListener('DOMContentLoaded', loadExperience);
})();
