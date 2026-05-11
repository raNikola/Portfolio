import fs from 'fs';

export function renderReferences($) {
    const references = JSON.parse(fs.readFileSync('./data/references.json', 'utf8'));

    $('#references-title').text(references.title);

    const itemsHtml = references.items.map((item) => `
        <div class="carousel-item references__carousel-item" href="#${item.id}!">
            <div class="references__card">
                <div class="card-content">
                    <p class="references__quote">
                        ${item.quote}
                    </p>
                </div>

                <div class="card-action references__author">
                    <div class="references__avatar light-green white-text">
                        <img src="${item.image}" alt="${item.alt}"/>
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