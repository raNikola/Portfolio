import fs from 'fs';

export function renderReferences($) {
    const references = JSON.parse(fs.readFileSync('./data/references.json', 'utf8'));

    $('#references-eyebrow').text(references.eyebrow);
    $('#references-title').text(references.title);
    $('#references-intro').text(references.intro);

    bindReferenceItems($, references.items || []);
}

function bindReferenceItems($, items) {
    const track = $('#references-track').first();
    if (!track.length) {
        return;
    }

    const prototype = track.find('[data-tpl="reference-item"]').first();
    if (!prototype.length) {
        return;
    }

    const nodes = [];

    for (const item of items) {
        const node = prototype.clone();
        node.removeAttr('data-tpl');

        node.attr('data-reference-id', item?.id ? String(item.id) : '');
        node.find('[data-role="reference-quote"]').first().text(item?.quote || '');
        node.find('[data-role="reference-name"]').first().text(item?.name || '');
        node.find('[data-role="reference-role"]').first().text(item?.role || '');

        const img = node.find('[data-role="reference-avatar"]').first();
        if (img.length) {
            img.attr('src', item?.image || '');
            img.attr('alt', item?.alt || '');
        }

        nodes.push(node);
    }

    track.empty();
    for (const node of nodes) {
        track.append(node);
    }
}
