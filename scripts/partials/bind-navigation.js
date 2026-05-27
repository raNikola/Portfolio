import { setAttr, setText } from '../build/bind/dom.js';

function bindDesktopNavigation($, items) {
    const list = $('#site-navigation-links').first();
    if (!list.length) {
        return;
    }

    const profileItem = list.children('li.ui-nav__item--profile').first();
    const itemProto = list.find('[data-tpl="nav-item"]').first();
    const themeProto = list.find('[data-tpl="nav-theme-toggle"]').first();

    if (!itemProto.length || !themeProto.length) {
        return;
    }

    const nodes = [];

    for (const item of items || []) {
        const li = itemProto.clone();
        li.removeAttr('data-tpl');

        const link = li.find('[data-role="nav-link"]').first();
        setAttr(link, 'href', item?.href);
        link.toggleClass('is-active', Boolean(item?.active));
        setText(li.find('[data-role="nav-label"]').first(), item?.label);

        nodes.push(li);
    }

    const themeNode = themeProto.clone();
    themeNode.removeAttr('data-tpl');
    nodes.push(themeNode);

    list.find('[data-tpl="nav-item"]').remove();
    list.find('[data-tpl="nav-theme-toggle"]').remove();
    list.children('li').not(profileItem).remove();

    if (profileItem.length) {
        profileItem.after(nodes);
    } else {
        for (const node of nodes) {
            list.append(node);
        }
    }
}

function bindMobileNavigation($, items) {
    const list = $('#mobile-nav').first();
    if (!list.length) {
        return;
    }

    const itemProto = list.find('[data-tpl="mobile-nav-item"]').first();
    const themeProto = list.find('[data-tpl="mobile-nav-theme-toggle"]').first();

    if (!itemProto.length || !themeProto.length) {
        return;
    }

    const nodes = [];

    for (const item of items || []) {
        const li = itemProto.clone();
        li.removeAttr('data-tpl');

        const link = li.find('[data-role="mobile-nav-link"]').first();
        setAttr(link, 'href', item?.href);
        link.toggleClass('is-active', Boolean(item?.active));
        setText(li.find('[data-role="mobile-nav-label"]').first(), item?.label);

        nodes.push(li);
    }

    const themeNode = themeProto.clone();
    themeNode.removeAttr('data-tpl');
    nodes.push(themeNode);

    list.empty();
    for (const node of nodes) {
        list.append(node);
    }
}

export function bindNavigation($, items) {
    bindDesktopNavigation($, items);
    bindMobileNavigation($, items);
}
