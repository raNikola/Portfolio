import fs from 'fs';

export function renderInterests($) {
    const interests = JSON.parse(fs.readFileSync('./data/interests.json', 'utf8'));

    $('#interests-eyebrow').text(interests.eyebrow);
    $('#interests-title').text(interests.title);
    $('#interests-description').text(interests.description);

    const cardsHtml = interests.items.map((item) => `
        <div class="layout-col layout-col--s-12 layout-col--m-6 layout-col--l-4">
            <div class="ui-card interests__card interests__card--${item.modifier}">
                <div class="interests__card__overlay"></div>

                <div class="ui-card__body interests__card__content">
                    <span class="interests__icon" aria-hidden="true">
                        <span
                            class="site-icon"
                            style="--site-icon: url('${item.icon}')">
                        </span>
                    </span>

                    <span class="ui-card__title">${item.title}</span>
                    <span class="interests__bar"></span>

                    <p>${item.description}</p>
                </div>

                <div class="ui-card__footer interests__meta">
                    <div class="ui-chip">${item.meta}</div>
                </div>
            </div>
        </div>
    `).join('');

    $('#interests-cards').html(cardsHtml);
}
