import fs from 'fs';

export function renderInterests($) {
    const interests = JSON.parse(fs.readFileSync('./data/interests.json', 'utf8'));

    $('#interests-eyebrow').text(interests.eyebrow);
    $('#interests-title').text(interests.title);
    $('#interests-description').text(interests.description);

    const cardsHtml = interests.items.map((item) => `
        <div class="col s12 m6 l4">
            <div class="card interests__card interests__card--${item.modifier}">
                <div class="interests__card__overlay"></div>

                <div class="card-content interests__card__content">
                    <span class="interests__icon" aria-hidden="true">
                        <span
                            class="site-icon"
                            style="--site-icon: url('${item.icon}')">
                        </span>
                    </span>

                    <span class="card-title">${item.title}</span>
                    <span class="interests__bar"></span>

                    <p>${item.description}</p>
                </div>

                <div class="card-action interests__meta">
                    <div class="chip">${item.meta}</div>
                </div>
            </div>
        </div>
    `).join('');

    $('#interests-cards').html(cardsHtml);
}