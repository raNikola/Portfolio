import fs from 'fs';

export function renderSkills($) {
    const skills = JSON.parse(fs.readFileSync('./data/skills.json', 'utf8'));

    $('#skills-eyebrow').text(skills.eyebrow);
    $('#skills-title').text(skills.title);
    $('#skills-description').text(skills.description);


    const filtersHtml = skills.filters.map((filter) => `
        <li>
            <button
                type="button"
                class="skills__filters__item${filter.active ? ' is-active' : ''}"
                data-filter="${filter.key}">
                ${filter.label}
                <span class="skills__filters__item__bar"></span>
            </button>
        </li>
    `).join('');

    $('#skills-filters ul').html(filtersHtml);

    const cardsHtml = skills.cards.map((card) => {
        const chipsHtml = card.items.map((item) => {
            const panelId = `skills-panel-${item.id}`;

            return `
                <button
                    type="button"
                    class="ui-chip service-chip${item.active ? ' active' : ''}"
                    aria-expanded="${item.active ? 'true' : 'false'}"
                    aria-controls="${panelId}"
                    data-target="${panelId}">
                    ${item.label}
                </button>
            `;
        }).join('');

        const panelsHtml = card.items.map((item) => {
            const panelId = `skills-panel-${item.id}`;

            return `
                <div
                    id="${panelId}"
                    class="skills__card__content ui-card__body section-surface service-expand"
                    ${item.active ? '' : 'hidden'}>
                    <p>${item.content}</p>
                </div>
            `;
        }).join('');

        return `
            <div class="layout-col layout-col--s-12 layout-col--m-6 layout-col--l-6">
                <div class="skills__card ui-card service-card${card.items.some((item) => item.active) ? ' open' : ''}" data-category="${card.category}">
                    <div class="skills__card__title ui-card__body content-fill">
                        <span class="ui-card__title">${card.title}</span>
                        <p>${card.description}</p>
                    </div>

                    <div class="skills__card__chips ui-card__body chips-wrap">
                        ${chipsHtml}
                    </div>

                    ${panelsHtml}
                </div>
            </div>
        `;
    }).join('');

    $('#skills-cards').html(cardsHtml);
}
