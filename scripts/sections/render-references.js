import fs from 'fs';

export function renderReferences($) {
    const references = JSON.parse(fs.readFileSync('./data/references.json', 'utf8'));

    $('#references-eyebrow').text(references.eyebrow);
    $('#references-title').text(references.title);
    $('#references-intro').text(references.intro);

    const itemsHtml = references.items.map((item) => `
        <div class="references__carousel-item" data-reference-id="${item.id}">
            <div class="references__card">
                <div class="ui-card__body">
                    <p class="references__quote">
                        ${item.quote}
                    </p>
                </div>

                <div class="ui-card__footer references__author">
                    <div class="references__avatar light-green">
                        <img src="${item.image}" alt="${item.alt}" width="100" height="100" loading="lazy" decoding="async"/>
                    </div>

                    <div>
                        <span class="references__name">${item.name}</span>
                        <span class="references__title">${item.role}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    $('#references-track').html(itemsHtml);
}
