import fs from 'fs';
import { setAttr, setText } from '../build/bind/dom.js';

export function bindSkills($) {
    const skills = JSON.parse(fs.readFileSync('./data/skills.json', 'utf8'));

    $('#skills-eyebrow').text(skills.eyebrow);
    $('#skills-title').text(skills.title);
    $('#skills-description').text(skills.description);

    bindSkillFilters($, skills.filters || []);
    bindSkillCards($, skills.cards || []);
}

function bindSkillFilters($, filters) {
    const list = $('#skills-filters ul').first();
    if (!list.length) {
        return;
    }

    const prototypeItem = list.find('[data-tpl="skills-filter"]').first();
    if (!prototypeItem.length) {
        return;
    }

    const items = [];

    for (const filter of filters) {
        const li = prototypeItem.clone();
        li.removeAttr('data-tpl');

        const button = li.find('button.skills__filters__item').first();
        setAttr(button, 'data-filter', filter?.key);
        button.toggleClass('is-active', Boolean(filter?.active));

        const label = li.find('[data-role="skills-filter-label"]').first();
        setText(label, filter?.label);

        items.push(li);
    }

    list.empty();
    for (const item of items) {
        list.append(item);
    }
}

function bindSkillCards($, cards) {
    const container = $('#skills-cards').first();
    if (!container.length) {
        return;
    }

    const prototypeCol = container.find('[data-tpl="skills-col"]').first();
    if (!prototypeCol.length) {
        return;
    }

    const columns = [];

    for (const card of cards) {
        const col = prototypeCol.clone();
        col.removeAttr('data-tpl');

        const cardRoot = col.find('.skills__card').first();
        setAttr(cardRoot, 'data-category', card?.category);

        const hasActive = (card?.items || []).some(item => Boolean(item?.active));
        cardRoot.toggleClass('open', hasActive);

        setText(col.find('[data-role="skills-card-title"]').first(), card?.title);
        setText(col.find('[data-role="skills-card-description"]').first(), card?.description);

        bindSkillChipsAndPanels(col, card?.items || []);
        columns.push(col);
    }

    container.empty();
    for (const col of columns) {
        container.append(col);
    }
}

function bindSkillChipsAndPanels(colRoot, items) {
    const chipsContainer = colRoot.find('[data-role="skills-card-chips"]').first();
    const panelsContainer = colRoot.find('[data-role="skills-card-panels"]').first();

    if (!chipsContainer.length || !panelsContainer.length) {
        return;
    }

    const chipPrototype = chipsContainer.find('[data-tpl="skills-chip"]').first();
    const panelPrototype = panelsContainer.find('[data-tpl="skills-panel"]').first();

    if (!chipPrototype.length || !panelPrototype.length) {
        return;
    }

    const chips = [];
    const panels = [];

    for (const item of items) {
        const panelId = `skills-panel-${item?.id}`;

        const chip = chipPrototype.clone();
        chip.removeAttr('data-tpl');
        chip.toggleClass('active', Boolean(item?.active));
        setAttr(chip, 'aria-expanded', item?.active ? 'true' : 'false');
        setAttr(chip, 'aria-controls', panelId);
        setAttr(chip, 'data-target', panelId);
        setText(chip.find('[data-role="skills-chip-label"]').first(), item?.label);
        chips.push(chip);

        const panel = panelPrototype.clone();
        panel.removeAttr('data-tpl');
        setAttr(panel, 'id', panelId);
        if (item?.active) {
            panel.removeAttr('hidden');
        } else {
            panel.attr('hidden', '');
        }
        setText(panel.find('[data-role="skills-panel-content"]').first(), item?.content);
        panels.push(panel);
    }

    chipsContainer.empty();
    for (const chip of chips) {
        chipsContainer.append(chip);
    }

    panelsContainer.empty();
    for (const panel of panels) {
        panelsContainer.append(panel);
    }
}
