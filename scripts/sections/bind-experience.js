import fs from 'fs';
import { setHidden, setText } from '../build/bind/dom.js';

const CTA_FALLBACK = 'View details';

function getExpandedCtaLabel(label) {
    if (!label) {
        return 'Hide details';
    }

    return String(label).replace(/^View\b/i, 'Hide');
}

function renderTimelineDateParts(period) {
    const parts = String(period ?? '').split(/\s+[–-]\s+/);

    if (parts.length < 2) {
        return { start: String(period ?? ''), end: '' };
    }

    return { start: parts[0], end: `– ${parts.slice(1).join(' - ')}` };
}

// setHidden / setText imported from build/bind/dom.js

function bindCompany(node, company, {
    linkSelector,
    linkNameSelector,
    textSelector
}) {
    const link = node.find(linkSelector).first();
    const linkName = link.length ? link.find(linkNameSelector).first() : null;
    const text = node.find(textSelector).first();

    const name = company?.name ? String(company.name) : '';
    const url = company?.url ? String(company.url) : '';

    if (url) {
        if (link.length) {
            link.attr('href', url);
            if (linkName && linkName.length) {
                setText(linkName, name);
            }
            setHidden(link, false);
        }
        if (text.length) {
            setHidden(text, true);
        }
        return;
    }

    if (link.length) {
        setHidden(link, true);
    }
    if (text.length) {
        setText(text, name);
        setHidden(text, !name);
    }
}

function bindChips(container, chipPrototypeSelector, values) {
    if (!container.length) {
        return;
    }

    const proto = container.find(chipPrototypeSelector).first();
    if (!proto.length) {
        container.empty();
        return;
    }

    const chips = [];
    for (const value of values || []) {
        const chip = proto.clone();
        chip.removeAttr('data-tpl');
        setText(chip, value);
        chips.push(chip);
    }

    container.empty();
    for (const chip of chips) {
        container.append(chip);
    }
}

function bindMetrics(metricsRoot, metrics) {
    if (!metricsRoot.length) {
        return;
    }

    const protoCol = metricsRoot.find('[data-tpl="experience-metric-col"]').first();
    const footer = metricsRoot.find('.ui-card__footer').first();

    if (!protoCol.length || !footer.length) {
        metricsRoot.empty();
        return;
    }

    const cols = [];
    for (const metric of metrics || []) {
        const col = protoCol.clone();
        col.removeAttr('data-tpl');

        const icon = col.find('[data-role="experience-metric-icon"]').first();
        const iconName = metric?.icon ? String(metric.icon) : '';
        if (icon.length) {
            icon.attr('style', `--site-icon: url('../icons/lucide/${iconName}.svg')`);
        }

        setText(col.find('[data-role="experience-metric-value"]').first(), metric?.value);
        setText(col.find('[data-role="experience-metric-label"]').first(), metric?.label);
        cols.push(col);
    }

    footer.empty();
    for (const col of cols) {
        footer.append(col);
    }
}

function bindDetails(featuredNode, item) {
    const details = featuredNode.find('[data-role="experience-details"]').first();
    const toggle = featuredNode.find('[data-role="experience-toggle"]').first();

    if (!details.length || !toggle.length) {
        return;
    }

    const detailsId = `${item?.id}-details`;
    details.attr('id', detailsId);

    const cta = item?.cta || CTA_FALLBACK;
    const expanded = getExpandedCtaLabel(cta);

    toggle.attr('data-target', detailsId);
    toggle.attr('data-label-collapsed', cta);
    toggle.attr('data-label-expanded', expanded);
    toggle.attr('aria-controls', detailsId);
    setText(toggle.find('[data-role="experience-toggle-label"]').first(), cta);

    const blocks = item?.details || [];
    const protoBlock = details.find('[data-tpl="experience-detail-block"]').first();
    const inner = details.find('.experience__details-inner').first();

    if (!protoBlock.length || !inner.length) {
        return;
    }

    const rendered = [];
    for (const block of blocks) {
        const b = protoBlock.clone();
        b.removeAttr('data-tpl');

        setText(b.find('[data-role="experience-detail-title"]').first(), block?.title);

        const contentNode = b.find('[data-role="experience-detail-content"]').first();
        const content = block?.content ? String(block.content) : '';
        if (contentNode.length) {
            setText(contentNode, content);
            setHidden(contentNode, !content);
        }

        const list = b.find('[data-role="experience-detail-list"]').first();
        const liProto = b.find('[data-tpl="experience-detail-li"]').first();
        if (list.length && liProto.length) {
            const items = block?.items || [];
            if (!items.length) {
                list.empty();
                setHidden(list, true);
            } else {
                const lis = [];
                for (const text of items) {
                    const li = liProto.clone();
                    li.removeAttr('data-tpl');
                    setText(li, text);
                    lis.push(li);
                }
                list.empty();
                for (const li of lis) {
                    list.append(li);
                }
                setHidden(list, false);
            }
        }

        rendered.push(b);
    }

    inner.empty();
    for (const b of rendered) {
        inner.append(b);
    }
}

function bindFeaturedItem(featuredProto, item) {
    const node = featuredProto.clone();
    node.removeAttr('data-tpl');

    const date = renderTimelineDateParts(item?.period);
    setText(node.find('[data-role="experience-period-start"]').first(), date.start);
    const endNode = node.find('[data-role="experience-period-end"]').first();
    setText(endNode, date.end);
    setHidden(endNode, !date.end);

    setText(node.find('[data-role="experience-period-full"]').first(), item?.period);
    setText(node.find('[data-role="experience-role"]').first(), item?.role);

    bindCompany(node, item?.company, {
        linkSelector: '[data-role="experience-company-link"]',
        linkNameSelector: '[data-role="experience-company-name"]',
        textSelector: '[data-role="experience-company-text"]'
    });

    const location = node.find('[data-role="experience-location"]').first();
    setText(location, item?.location);
    setHidden(location, !item?.location);

    const status = node.find('[data-role="experience-status"]').first();
    setText(status, item?.status);
    setHidden(status, !item?.status);

    setText(node.find('[data-role="experience-summary"]').first(), item?.summary);

    bindChips(node.find('[data-role="experience-tags"]').first(), '[data-tpl="experience-chip"]', item?.tags || []);
    bindMetrics(node.find('[data-role="experience-metrics"]').first(), item?.metrics || []);
    bindDetails(node, item);

    return node;
}

function bindMiniCards(container, groupedItems) {
    if (!container.length) {
        return;
    }

    const proto = container.find('[data-tpl="experience-mini-card"]').first();
    if (!proto.length) {
        container.empty();
        return;
    }

    const rendered = [];
    for (const item of groupedItems || []) {
        const node = proto.clone();
        node.removeAttr('data-tpl');

        setText(node.find('[data-role="experience-mini-role"]').first(), item?.role);

        bindCompany(node, item?.company, {
            linkSelector: '[data-role="experience-mini-company-link"]',
            linkNameSelector: '[data-role="experience-mini-company-name"]',
            textSelector: '[data-role="experience-mini-company-text"]'
        });

        setText(node.find('[data-role="experience-mini-period"]').first(), item?.period);
        setText(node.find('[data-role="experience-mini-summary"]').first(), item?.summary);

        bindChips(node.find('[data-role="experience-mini-stack"]').first(), '[data-tpl="experience-mini-chip"]', item?.stack || []);

        rendered.push(node);
    }

    container.empty();
    for (const node of rendered) {
        container.append(node);
    }
}

function bindFoundationItem(foundationProto, group, groupedItems) {
    const node = foundationProto.clone();
    node.removeAttr('data-tpl');

    const date = renderTimelineDateParts(group?.period);
    setText(node.find('[data-role="experience-foundation-period-start"]').first(), date.start);
    const endNode = node.find('[data-role="experience-foundation-period-end"]').first();
    setText(endNode, date.end);
    setHidden(endNode, !date.end);

    setText(node.find('[data-role="experience-foundation-period-full"]').first(), group?.period);
    setText(node.find('[data-role="experience-foundation-title"]').first(), group?.title);

    const icon = node.find('[data-role="experience-foundation-icon"]').first();
    const iconName = group?.icon ? String(group.icon) : '';
    if (icon.length) {
        icon.attr('style', `--site-icon: url('../icons/lucide/${iconName}.svg')`);
    }

    const subtitle = node.find('[data-role="experience-foundation-subtitle"]').first();
    setText(subtitle, group?.subtitle);
    setHidden(subtitle, !group?.subtitle);

    const companies = node.find('[data-role="experience-foundation-companies"]').first();
    const companiesText = (group?.companies || []).filter(Boolean).join(' · ');
    setText(companies, companiesText);
    setHidden(companies, !companiesText);

    setText(node.find('[data-role="experience-foundation-summary"]').first(), group?.summary);
    bindChips(node.find('[data-role="experience-foundation-tags"]').first(), '[data-tpl="experience-foundation-chip"]', group?.tags || []);

    const details = node.find('[data-role="experience-foundation-details"]').first();
    const toggle = node.find('[data-role="experience-foundation-toggle"]').first();
    const detailsId = `${group?.id}-details`;

    if (details.length) {
        details.attr('id', detailsId);
    }

    if (toggle.length) {
        const cta = group?.cta || CTA_FALLBACK;
        const expanded = getExpandedCtaLabel(cta);
        toggle.attr('data-target', detailsId);
        toggle.attr('data-label-collapsed', cta);
        toggle.attr('data-label-expanded', expanded);
        toggle.attr('aria-controls', detailsId);
        setText(toggle.find('[data-role="experience-foundation-toggle-label"]').first(), cta);
    }

    bindMiniCards(node.find('[data-role="experience-mini-cards"]').first(), groupedItems || []);
    return node;
}

export function bindExperience($) {
    const experience = JSON.parse(fs.readFileSync('./data/experience.json', 'utf8'));

    $('#experience-eyebrow').text(experience.section.eyebrow);
    $('#experience-title').text(experience.section.title);
    $('#experience-intro').text(experience.section.intro);

    const container = $('#experience-cards').first();
    if (!container.length) {
        return;
    }

    const timelineProto = container.find('[data-tpl="experience-timeline"]').first();
    if (!timelineProto.length) {
        return;
    }

    const featuredProto = timelineProto.find('[data-tpl="experience-featured-item"]').first();
    const foundationProto = timelineProto.find('[data-tpl="experience-foundation-item"]').first();

    const timeline = timelineProto.clone();
    timeline.removeAttr('data-tpl');

    // Remove prototypes inside the cloned timeline.
    timeline.find('[data-tpl="experience-featured-item"]').remove();
    timeline.find('[data-tpl="experience-foundation-item"]').remove();

    const featuredItems = (experience.items || []).filter(item => item?.type === 'featured');
    for (const item of featuredItems) {
        if (!featuredProto.length) {
            continue;
        }
        timeline.append(bindFeaturedItem(featuredProto, item));
    }

    for (const group of experience.groups || []) {
        if (!foundationProto.length) {
            continue;
        }
        const groupedItems = (experience.items || []).filter(item => item?.type === 'grouped' && item?.groupId === group?.id);
        timeline.append(bindFoundationItem(foundationProto, group, groupedItems));
    }

    container.empty();
    container.append(timeline);
}
