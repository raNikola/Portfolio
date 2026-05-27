import fs from 'fs';
import { setAttr, setHidden, setText } from '../build/bind/dom.js';

function getContactIconClass(icon) {
    const aliases = {
        'map-pinned': 'location'
    };

    const token = String(aliases[icon] || icon || '').trim();
    return token ? `about__icon-${token}` : '';
}

function getProofIconStyle(icon) {
    const token = String(icon || '').trim();
    return token ? `--site-icon: url('../icons/lucide/${token}.svg')` : '--site-icon: none';
}

export function bindAbout($) {
    const about = JSON.parse(fs.readFileSync('./data/about.json', 'utf8'));
    const email = about.contact.find(item => item.type === 'email');

    $('#about-email-meta').attr('content', email?.label || '');

    $('#about-image-mobile-source')
        .attr('srcset', about.image.mobileSrcset)
        .attr('sizes', about.image.mobileSizes);

    $('#about-image-desktop-source')
        .attr('srcset', about.image.desktopSrcset)
        .attr('sizes', about.image.desktopSizes);

    $('#about-image')
        .attr('src', about.image.src)
        .attr('alt', about.image.alt)
        .attr('width', about.image.width)
        .attr('height', about.image.height);

    $('#about-name').text(about.name);
    $('#about-role').text(about.role);
    $('#about-summary').text(about.summary);

    bindAboutContact($, about.contact || []);
    bindAboutValueBar($, about.valueBar || []);
    $('#about-intro').text(about.intro);
    bindAboutProofPoints($, about.proofPoints || []);
    $('#about-primary-cta')
        .attr('href', about.primaryCta.href)
        .removeAttr('target')
        .removeAttr('rel')
        .removeAttr('download')
        .removeAttr('data-analytics')
        .attr('aria-label', about.primaryCta.ariaLabel);

    $('#about-primary-cta-label').text(about.primaryCta.label);

    // Remove build-only prototypes from final HTML output.
    $('template[data-tpl-root="about"]').remove();
}

function getAboutTemplateRoot($) {
    return $('template[data-tpl-root="about"]').first();
}

function cloneFromTemplate($, templateRoot, selector) {
    if (!templateRoot.length) {
        return null;
    }

    // Cheerio parses template element contents as children; query inside it.
    const node = templateRoot.find(selector).first();
    if (!node.length) {
        return null;
    }

    return node.clone();
}

function bindAboutContact($, items) {
    const container = $('#about-contact').first();
    const templateRoot = getAboutTemplateRoot($);

    if (!container.length || !templateRoot.length) {
        return;
    }

    const nodes = [];

    for (const item of items) {
        const type = String(item?.type || '').toLowerCase();

        if (type === 'location') {
            const node = cloneFromTemplate($, templateRoot, '[data-tpl="about-contact-location"]');
            if (!node) {
                continue;
            }

            node.removeAttr('data-tpl');
            const icon = node.find('[data-role="about-contact-icon"]').first();
            icon.attr('class', `site-icon ${getContactIconClass(item.icon)}`.trim());

            const labelNode = node.find('[data-role="about-contact-location-label"]').first();
            const [country, detail] = String(item?.label || '').split('/');
            if (detail) {
                setText(node.find('[data-role="about-contact-location-country"]').first(), country.trim());
                setText(node.find('[data-role="about-contact-location-detail"]').first(), detail.trim());
                setHidden(node.find('[data-role="about-contact-location-separator"]').first(), false);
                setHidden(node.find('[data-role="about-contact-location-country"]').first(), false);
                setHidden(node.find('[data-role="about-contact-location-detail"]').first(), false);
            } else {
                setText(labelNode, item?.label);
                setHidden(node.find('[data-role="about-contact-location-separator"]').first(), true);
                setHidden(node.find('[data-role="about-contact-location-country"]').first(), true);
                setHidden(node.find('[data-role="about-contact-location-detail"]').first(), true);
            }

            nodes.push(node);
            continue;
        }

        if (type === 'email') {
            const node = cloneFromTemplate($, templateRoot, '[data-tpl="about-contact-email"]');
            if (!node) {
                continue;
            }

            node.removeAttr('data-tpl');
            const icon = node.find('[data-role="about-contact-icon"]').first();
            icon.attr('class', `site-icon ${getContactIconClass(item.icon)}`.trim());

            const link = node.find('[data-role="about-contact-email-link"]').first();
            const ariaLabel = 'Email Nikola Randjelovic';
            const analyticsEvent = 'email_click';
            const [user = '', domain = ''] = String(item?.label || '').split('@');

            setAttr(link, 'aria-label', ariaLabel);
            setAttr(link, 'data-analytics', analyticsEvent);
            setAttr(link, 'data-user', user);
            setAttr(link, 'data-domain', domain);
            setAttr(link, 'href', '#');
            link.text('[Show email]');

            nodes.push(node);
            continue;
        }

        if (item?.url) {
            const node = cloneFromTemplate($, templateRoot, '[data-tpl="about-contact-social"]');
            if (!node) {
                continue;
            }

            node.removeAttr('data-tpl');
            const icon = node.find('[data-role="about-contact-icon"]').first();
            icon.attr('class', `site-icon ${getContactIconClass(item.icon)}`.trim());

            setAttr(node, 'href', item.url);
            const analyticsEvent = {
                github: 'github_click',
                linkedin: 'linkedin_click'
            }[String(item.icon || '').toLowerCase()];
            setAttr(node, 'data-analytics', analyticsEvent || '');
            setAttr(node, 'aria-label', `Visit Nikola Randjelovic on ${item.label}`);
            setText(node.find('[data-role="about-contact-label"]').first(), item?.label);

            nodes.push(node);
            continue;
        }

        const node = cloneFromTemplate($, templateRoot, '[data-tpl="about-contact-text"]');
        if (!node) {
            continue;
        }

        node.removeAttr('data-tpl');
        const icon = node.find('[data-role="about-contact-icon"]').first();
        icon.attr('class', `site-icon ${getContactIconClass(item.icon)}`.trim());
        setText(node.find('[data-role="about-contact-label"]').first(), item?.label);
        nodes.push(node);
    }

    container.empty();
    for (const node of nodes) {
        container.append(node);
    }
}

function bindAboutValueBar($, items) {
    const container = $('#about-value-items').first();
    const templateRoot = getAboutTemplateRoot($);

    if (!container.length || !templateRoot.length) {
        return;
    }

    const proto = templateRoot.find('[data-tpl="about-value-item"]').first();
    if (!proto.length) {
        return;
    }

    const cols = [];
    for (const item of items) {
        const col = proto.clone();
        col.removeAttr('data-tpl');

        const icon = col.find('[data-role="about-value-icon"]').first();
        icon.attr('class', `site-icon about__icon-${String(item?.icon || '').trim()}`.trim());

        setText(col.find('[data-role="about-value-title"]').first(), item?.title);
        setText(col.find('[data-role="about-value-description"]').first(), item?.description);
        cols.push(col);
    }

    container.empty();
    for (const col of cols) {
        container.append(col);
    }
}

function bindAboutProofPoints($, items) {
    const list = $('#about-proof-list').first();
    const templateRoot = getAboutTemplateRoot($);

    if (!list.length || !templateRoot.length) {
        return;
    }

    const proto = templateRoot.find('[data-tpl="about-proof-item"]').first();
    if (!proto.length) {
        return;
    }

    const lis = [];
    for (const item of items) {
        const li = proto.clone();
        li.removeAttr('data-tpl');

        const icon = li.find('[data-role="about-proof-icon"]').first();
        setAttr(icon, 'style', getProofIconStyle(item?.icon));

        setText(li.find('[data-role="about-proof-title"]').first(), item?.title);
        setText(li.find('[data-role="about-proof-description"]').first(), item?.description);
        lis.push(li);
    }

    list.empty();
    for (const li of lis) {
        list.append(li);
    }
}
