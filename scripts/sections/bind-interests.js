import fs from 'fs';

import { setAttr, setText } from '../build/bind/dom.js';

export function bindInterests($) {
    const interests = JSON.parse(fs.readFileSync('./data/interests.json', 'utf8'));

    $('#interests-eyebrow').text(interests.eyebrow);
    $('#interests-title').text(interests.title);
    $('#interests-description').text(interests.description);

    bindInterestsCards($, interests.items || []);
}

function bindInterestsCards($, items) {
    const container = $('#interests-cards').first();
    if (!container.length) {
        return;
    }

    const prototypeCol = container.find('[data-tpl="interests-col"]').first();
    if (!prototypeCol.length) {
        return;
    }

    const columns = [];

    for (const item of items) {
        const col = prototypeCol.clone();
        col.removeAttr('data-tpl');

        const card = col.find('[data-role="interests-card"]').first();
        if (card.length) {
            const modifier = item?.modifier ? String(item.modifier) : '';
            setAttr(card, 'data-modifier', modifier);

            // Keep the modifier class contract used by existing SCSS.
            if (modifier) {
                card.addClass(`interests__card--${modifier}`);
            }
        }

        setAttr(col.find('[data-role="interests-icon"]').first(), 'style', `--site-icon: url('${item?.icon || ''}')`);
        setText(col.find('[data-role="interests-title"]').first(), item?.title);
        setText(col.find('[data-role="interests-description"]').first(), item?.description);
        setText(col.find('[data-role="interests-meta"]').first(), item?.meta);

        columns.push(col);
    }

    container.empty();
    for (const col of columns) {
        container.append(col);
    }
}
