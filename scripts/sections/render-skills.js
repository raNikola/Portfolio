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
                    class="chip service-chip${item.active ? ' active' : ''}"
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
                    class="skills__card__content card-content grey lighten-4 service-expand"
                    ${item.active ? '' : 'hidden'}>
                    <p>${item.content}</p>
                </div>
            `;
        }).join('');

        return `
            <div class="col s12 m6 l6">
                <div class="skills__card card service-card${card.items.some((item) => item.active) ? ' open' : ''}" data-category="${card.category}">
                    <div class="skills__card__title card-content content-fill">
                        <span class="card-title">${card.title}</span>
                        <p>${card.description}</p>
                    </div>

                    <div class="skills__card__chips card-content chips-wrap">
                        ${chipsHtml}
                    </div>

                    ${panelsHtml}
                </div>
            </div>
        `;
    }).join('');

    $('#skills-cards').html(cardsHtml);
}
