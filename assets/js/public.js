function renderLucideIcons(root = document) {
    const icons = root.matches && root.matches('i[data-lucide="arrow-up-right"]')
        ? [root]
        : Array.from(root.querySelectorAll('i[data-lucide="arrow-up-right"]'));

    icons.forEach(icon => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'lucide lucide-arrow-up-right');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');

        const cornerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        cornerPath.setAttribute('d', 'M7 7h10v10');

        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M7 17 17 7');

        svg.append(cornerPath, arrowPath);
        icon.replaceWith(svg);
    });
}

window.renderLucideIcons = renderLucideIcons;

let lastScrollY = window.scrollY || 0;
let isMobileNavigationOpen = false;
let particlesInitialized = false;
let particlesScriptLoading = false;
const themeStorageKey = 'portfolio-theme';
const themeColorByMode = {
    light: '#00A800',
    dark: '#0f172a'
};

function isBelowTabletWidth() {
    return window.matchMedia('(max-width: 767px)').matches;
}

function getStoredTheme() {
    try {
        const storedTheme = window.localStorage.getItem(themeStorageKey);
        return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    } catch (error) {
        return null;
    }
}

function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getPreferredTheme() {
    return getStoredTheme() || getSystemTheme() || 'light';
}

function persistTheme(theme) {
    try {
        window.localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
        return;
    }
}

function updateThemeToggleControls(theme) {
    const isDark = theme === 'dark';
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

    document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('aria-pressed', String(isDark));

        const visibleLabel = toggle.querySelector('[data-theme-toggle-label]');
        if (visibleLabel) {
            visibleLabel.textContent = label;
        }
    });
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.setAttribute('content', themeColorByMode[theme] || themeColorByMode.light);
    }

    updateThemeToggleControls(theme);
}

function initializeThemeToggle() {
    applyTheme(getPreferredTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            persistTheme(nextTheme);
            applyTheme(nextTheme);
        });
    });

    if (!window.matchMedia) {
        return;
    }

    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeQuery.addEventListener('change', event => {
        if (getStoredTheme()) {
            return;
        }

        applyTheme(event.matches ? 'dark' : 'light');
    });
}

function runWhenPageIsIdle(callback, timeout = 1200) {
    const runWhenIdle = () => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout });
            return;
        }

        window.setTimeout(callback, 250);
    };

    if (document.readyState === 'complete') {
        runWhenIdle();
        return;
    }

    window.addEventListener('load', runWhenIdle, { once: true });
}

function runNonCriticalEnhancement(callback) {
    if (isBelowTabletWidth()) {
        runWhenPageIsIdle(callback, 1800);
        return;
    }

    callback();
}

function initializeParticles() {
    if (particlesInitialized || particlesScriptLoading || isBelowTabletWidth() || !document.getElementById('particles-js')) {
        return;
    }

    if (window.particlesJS) {
        particlesInitialized = true;
        particlesJS.load('particles-js', 'assets/particles.json');
        return;
    }

    particlesScriptLoading = true;

    const script = document.createElement('script');
    script.src = './assets/js/particles.min.js';
    script.defer = true;
    script.onload = () => {
        particlesScriptLoading = false;
        initializeParticles();
    };
    script.onerror = () => {
        particlesScriptLoading = false;
    };

    document.body.appendChild(script);
}

function scheduleParticlesInitialization() {
    runWhenPageIsIdle(initializeParticles);
}

function initializeTooltips() {
    document.querySelectorAll('.tooltipped').forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        if (tooltipText && !element.getAttribute('title')) {
            element.setAttribute('title', tooltipText);
        }
    });
}

function initializeSidenavs() {
    const sidenavs = Array.from(document.querySelectorAll('.sidenav[id]'));
    if (!sidenavs.length) {
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'sidenav-backdrop';
    backdrop.hidden = true;
    document.body.appendChild(backdrop);

    let activeSidenav = null;
    let activeTriggers = [];

    const setTriggersExpanded = (triggers, expanded) => {
        triggers.forEach(trigger => trigger.setAttribute('aria-expanded', String(expanded)));
    };

    const closeSidenav = () => {
        if (!activeSidenav) {
            return;
        }

        const isMobileNavigation = activeSidenav.id === 'mobile-nav';
        activeSidenav.classList.remove('is-open');
        activeSidenav.hidden = true;
        activeSidenav.setAttribute('aria-hidden', 'true');
        setTriggersExpanded(activeTriggers, false);
        backdrop.hidden = true;
        document.body.classList.remove('has-open-sidenav');

        if (isMobileNavigation) {
            isMobileNavigationOpen = false;
            activeTriggers.forEach(trigger => trigger.classList.remove('is-hidden'));
            lastScrollY = window.scrollY || 0;
        }

        activeSidenav = null;
        activeTriggers = [];
    };

    const openSidenav = (sidenav, triggers) => {
        const isMobileNavigation = sidenav.id === 'mobile-nav';
        activeSidenav = sidenav;
        activeTriggers = triggers;

        sidenav.hidden = false;
        sidenav.setAttribute('aria-hidden', 'false');
        sidenav.classList.add('is-open');
        setTriggersExpanded(triggers, true);
        backdrop.hidden = false;
        document.body.classList.add('has-open-sidenav');

        if (isMobileNavigation) {
            isMobileNavigationOpen = true;
            triggers.forEach(trigger => trigger.classList.remove('is-hidden'));
        }
    };

    sidenavs.forEach(sidenav => {
        const triggers = Array.from(document.querySelectorAll(`[data-target="${sidenav.id}"]`));
        const isMobileNavigation = sidenav.id === 'mobile-nav';

        triggers.forEach(trigger => {
            trigger.setAttribute('aria-controls', sidenav.id);
            trigger.setAttribute('aria-expanded', 'false');
            trigger.addEventListener('click', event => {
                event.preventDefault();

                if (activeSidenav === sidenav) {
                    closeSidenav();
                    return;
                }

                if (activeSidenav) {
                    closeSidenav();
                }

                openSidenav(sidenav, triggers);
            });
        });

        sidenav.hidden = true;
        sidenav.setAttribute('aria-hidden', 'true');
        sidenav.classList.remove('is-open');

        if (isMobileNavigation) {
            isMobileNavigationOpen = false;
        }

        sidenav.addEventListener('click', event => {
            const closeTrigger = event.target.closest('.sidenav-close');
            const hashLink = event.target.closest('a[href^="#"]');

            if (closeTrigger || hashLink) {
                closeSidenav();
            }
        });
    });

    backdrop.addEventListener('click', closeSidenav);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeSidenav();
        }
    });
}

function initializeReferencesCarousel() {
    const referencesCarousel = document.querySelector('.references__carousel');
    const carouselContainer = document.querySelector('.references__carousel-container');
    const carouselTrack = document.querySelector('.references__track');
    const prevButton = document.querySelector('.references__control--prev');
    const nextButton = document.querySelector('.references__control--next');

    if (!referencesCarousel || !carouselContainer || !carouselTrack) {
        return;
    }

    const carouselItems = Array.from(carouselTrack.querySelectorAll('.references__carousel-item'));
    if (!carouselItems.length) {
        return;
    }

    let activeIndex = 0;
    let autoplayTimer = null;
    let scrollFrameId = null;
    const autoplayDelay = 15000;

    const controlsWrapper = document.querySelector('.references__controls');
    let dots = [];

    if (carouselContainer) {
        const dotsWrapper = document.createElement('div');
        dotsWrapper.className = 'references__dots';
        dotsWrapper.setAttribute('aria-label', 'Reference slide navigation');

        dots = carouselItems.map((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'references__dot';
            dot.setAttribute('aria-label', `Go to reference ${index + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(index, true);
                resetAutoplay();
            });
            dotsWrapper.appendChild(dot);
            return dot;
        });

        carouselContainer.appendChild(dotsWrapper);
    }

    function updateActiveDot(index) {
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function updateCarouselHeight() {
        const activeCard = carouselItems[activeIndex]?.querySelector('.references__card');
        if (!activeCard) {
            return;
        }

        const extraSpace = window.matchMedia('(max-width: 480px)').matches
            ? 100
            : window.matchMedia('(max-width: 600px)').matches
                ? 90
                : 70;

        const height = activeCard.offsetHeight + extraSpace;
        [referencesCarousel, carouselContainer, carouselTrack].forEach(element => {
            element.style.height = `${height}px`;
            element.style.minHeight = `${height}px`;
        });

        carouselItems.forEach(item => {
            item.style.minHeight = `${height}px`;
        });
    }

    function getSlideWidth() {
        return carouselTrack.clientWidth || carouselTrack.getBoundingClientRect().width || 1;
    }

    function syncActiveIndexFromScroll() {
        const slideWidth = getSlideWidth();
        const newIndex = Math.max(0, Math.min(carouselItems.length - 1, Math.round(carouselTrack.scrollLeft / slideWidth)));

        if (newIndex !== activeIndex) {
            activeIndex = newIndex;
            updateActiveDot(activeIndex);
            updateCarouselHeight();
        }
    }

    function goToSlide(index, smooth = false) {
        const clampedIndex = ((index % carouselItems.length) + carouselItems.length) % carouselItems.length;
        activeIndex = clampedIndex;
        updateActiveDot(activeIndex);

        const left = getSlideWidth() * activeIndex;
        carouselTrack.scrollTo({
            left,
            behavior: smooth ? 'smooth' : 'auto'
        });

        updateCarouselHeight();
    }

    function nextSlide() {
        goToSlide(activeIndex + 1, true);
    }

    function prevSlide() {
        goToSlide(activeIndex - 1, true);
    }

    function startAutoplay() {
        autoplayTimer = window.setInterval(() => {
            nextSlide();
        }, autoplayDelay);
    }

    function resetAutoplay() {
        if (autoplayTimer) {
            window.clearInterval(autoplayTimer);
        }
        startAutoplay();
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
    }

    carouselTrack.addEventListener('scroll', () => {
        if (scrollFrameId !== null) {
            return;
        }

        scrollFrameId = window.requestAnimationFrame(() => {
            syncActiveIndexFromScroll();
            scrollFrameId = null;
        });
    }, { passive: true });

    carouselTrack.addEventListener('pointerdown', resetAutoplay, { passive: true });
    carouselTrack.addEventListener('touchstart', resetAutoplay, { passive: true });
    carouselTrack.addEventListener('keydown', resetAutoplay);

    window.addEventListener('resize', () => {
        goToSlide(activeIndex, false);
    });

    goToSlide(0, false);
    startAutoplay();
}

function initializeFeatureCallout() {
    const callout = document.querySelector('.tap-target');
    if (!callout) {
        return;
    }

    const calloutTargetId = callout.getAttribute('data-target');
    const calloutTarget = calloutTargetId ? document.getElementById(calloutTargetId) : null;
    if (!calloutTarget) {
        return;
    }

    let openTimer;
    let closeTimer;
    let wrapper = document.querySelector('.tap-target-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'tap-target-wrapper';
        document.body.appendChild(wrapper);
    }

    if (!wrapper.contains(callout)) {
        wrapper.appendChild(callout);
    }

    let wave = wrapper.querySelector('.tap-target-wave');
    if (!wave) {
        wave = document.createElement('div');
        wave.className = 'tap-target-wave';
        wrapper.appendChild(wave);
    }

    let origin = wave.querySelector('.tap-target-origin');
    if (!origin) {
        origin = calloutTarget.cloneNode(true);
        origin.classList.add('tap-target-origin');
        origin.removeAttribute('id');
        origin.removeAttribute('style');
        wave.appendChild(origin);
    }

    wrapper.classList.remove('open');
    callout.setAttribute('aria-hidden', 'true');

    const hasFixedParent = element => {
        let current = element;
        while (current && current !== document.body) {
            if (window.getComputedStyle(current).position === 'fixed') {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    };

    const calculatePositioning = () => {
        const isFixed = window.getComputedStyle(calloutTarget).position === 'fixed' || hasFixedParent(calloutTarget.parentElement);
        const originRect = calloutTarget.getBoundingClientRect();
        const originWidth = originRect.width;
        const originHeight = originRect.height;
        const scrollTop = window.scrollY || window.pageYOffset;
        const scrollLeft = window.scrollX || window.pageXOffset;
        const originTop = isFixed ? originRect.top : originRect.top + scrollTop;
        const originLeft = isFixed ? originRect.left : originRect.left + scrollLeft;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const centerX = windowWidth / 2;
        const centerY = windowHeight / 2;
        const isLeft = originLeft <= centerX;
        const isRight = originLeft > centerX;
        const isTop = originTop <= centerY;
        const isBottom = originTop > centerY;
        const isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

        const tapTargetWidth = callout.offsetWidth;
        const tapTargetHeight = callout.offsetHeight;
        const tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
        const tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;

        wrapper.style.top = isTop ? `${tapTargetTop}px` : '';
        wrapper.style.right = isRight ? `${windowWidth - tapTargetLeft - tapTargetWidth}px` : '';
        wrapper.style.bottom = isBottom ? `${windowHeight - tapTargetTop - tapTargetHeight}px` : '';
        wrapper.style.left = isLeft ? `${tapTargetLeft}px` : '';
        wrapper.style.position = isFixed ? 'fixed' : 'absolute';

        const content = callout.querySelector('.tap-target-content');
        if (content) {
            const textWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
            const textHeight = tapTargetHeight / 2;
            const textTop = isTop ? tapTargetHeight / 2 : 0;
            const textLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;

            content.style.width = `${textWidth}px`;
            content.style.height = `${textHeight}px`;
            content.style.top = `${textTop}px`;
            content.style.right = '0px';
            content.style.bottom = '0px';
            content.style.left = `${textLeft}px`;
            content.style.padding = `${originWidth}px`;
            content.style.verticalAlign = isBottom ? 'bottom' : 'top';
        }

        const waveSize = originWidth * 2;
        wave.style.top = `${tapTargetHeight / 2 - waveSize / 2}px`;
        wave.style.left = `${tapTargetWidth / 2 - waveSize / 2}px`;
        wave.style.width = `${waveSize}px`;
        wave.style.height = `${waveSize}px`;
    };

    const openCallout = () => {
        calculatePositioning();
        callout.setAttribute('aria-hidden', 'false');
        wrapper.classList.add('open');
    };

    const closeCallout = () => {
        wrapper.classList.remove('open');
        callout.setAttribute('aria-hidden', 'true');
    };

    const closeButton = callout.querySelector('[data-callout-close]');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.clearTimeout(openTimer);
            window.clearTimeout(closeTimer);
            closeCallout();
        });
    }

    window.addEventListener('resize', calculatePositioning);
    document.addEventListener('scroll', calculatePositioning, { passive: true });

    openTimer = window.setTimeout(openCallout, 7000);
    closeTimer = window.setTimeout(closeCallout, 15000);
}

document.addEventListener('DOMContentLoaded', function () {
    initializeThemeToggle();
    renderLucideIcons();
    scheduleParticlesInitialization();

    document.querySelectorAll('[data-user][data-domain]').forEach(mailLink => {
        const user = mailLink.getAttribute('data-user');
        const domain = mailLink.getAttribute('data-domain');
        if (!user || !domain) {
            return;
        }

        const email = `${user}@${domain}`;
        mailLink.setAttribute('href', `mailto:${email}`);
        mailLink.textContent = email;
    });

    if ('MutationObserver' in window) {
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        return;
                    }

                    renderLucideIcons(node);
                });
            });
        }).observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    initializeTooltips();
    initializeSidenavs();

    runNonCriticalEnhancement(() => {
        initializeReferencesCarousel();
        initializeFeatureCallout();
    });

    document.querySelectorAll('.service-card').forEach(card => {
        const chips = card.querySelectorAll('.service-chip');
        const panels = card.querySelectorAll('.service-expand');

        chips.forEach(chip => {
            chip.addEventListener('click', function () {
                const targetId = this.dataset.target;
                const targetPanel = card.querySelector('#' + targetId);
                const isOpen = this.classList.contains('active');

                chips.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-expanded', 'false');
                });

                panels.forEach(panel => {
                    panel.hidden = true;
                });

                card.classList.remove('open');

                if (!isOpen && targetPanel) {
                    this.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    targetPanel.hidden = false;
                    card.classList.add('open');
                }
            });
        });
    });

    const skillsFilters = document.getElementById('skills-filters');
    if (skillsFilters) {
        skillsFilters.addEventListener('click', function (e) {
            const chip = e.target.closest('[data-filter]');
            if (!chip) return;

            const filter = chip.dataset.filter;

            document.querySelectorAll('#skills-filters [data-filter]')
                .forEach(x => x.classList.toggle('is-active', x === chip));

            document.querySelectorAll('#skills-cards .ui-card')
                .forEach(card => card.classList.toggle(
                    'is-muted',
                    filter !== 'all' && !card.dataset.category.includes(filter)
                ));
        });
    }

    function closeExperienceCard(card) {
        const toggle = card.querySelector('.experience__toggle');
        const details = card.querySelector('.experience__details');
        const timelineItem = card.closest('.experience__timeline-item');

        card.classList.remove('is-open');

        if (timelineItem) {
            timelineItem.classList.remove('is-open');
        }

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');

            const label = toggle.querySelector('.experience__toggle-label');
            if (label && toggle.dataset.labelCollapsed) {
                label.textContent = toggle.dataset.labelCollapsed;
            }
        }

        if (details) {
            details.setAttribute('aria-hidden', 'true');
        }
    }

    function openExperienceCard(card) {
        const toggle = card.querySelector('.experience__toggle');
        const details = card.querySelector('.experience__details');
        const timelineItem = card.closest('.experience__timeline-item');

        card.classList.add('is-open');

        if (timelineItem) {
            timelineItem.classList.add('is-open');
        }

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');

            const label = toggle.querySelector('.experience__toggle-label');
            if (label && toggle.dataset.labelExpanded) {
                label.textContent = toggle.dataset.labelExpanded;
            }
        }

        if (details) {
            details.setAttribute('aria-hidden', 'false');
        }
    }

    const experienceSection = document.getElementById('experience');
    if (experienceSection) {
        experienceSection.querySelectorAll('.experience__toggle').forEach(toggle => {
            toggle.addEventListener('click', function () {
                const currentCard = this.closest('[data-experience-card]');
                const isOpen = currentCard.classList.contains('is-open');

                experienceSection.querySelectorAll('[data-experience-card]').forEach(closeExperienceCard);

                if (!isOpen) {
                    openExperienceCard(currentCard);
                }
            });
        });
    }

    const parallaxLayers = Array.from(document.querySelectorAll('.error-404 [data-parallax-depth]'));
    const supportsFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    if (supportsFinePointer && parallaxLayers.length) {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let frameId = null;
        const ease = 0.08;

        function renderParallax() {
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;

            parallaxLayers.forEach(layer => {
                const depth = Number(layer.dataset.parallaxDepth) || 0;
                layer.style.setProperty('--parallax-x', `${(currentX * depth).toFixed(2)}px`);
                layer.style.setProperty('--parallax-y', `${(currentY * depth).toFixed(2)}px`);
            });

            if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
                frameId = requestAnimationFrame(renderParallax);
            } else {
                frameId = null;
            }
        }

        window.addEventListener('mousemove', event => {
            targetX = (event.clientX / window.innerWidth - 0.5) * 2;
            targetY = (event.clientY / window.innerHeight - 0.5) * 2;

            if (frameId === null) {
                frameId = requestAnimationFrame(renderParallax);
            }
        }, { passive: true });
    }
    updateScrollAwareControls();
});

function updateScrollAwareControls() {
    const topBtn = document.querySelector('.top-btn');
    const stickyMenu = document.querySelector('.ui-nav');
    const mobileNavTrigger = document.querySelector('.mobile-nav-trigger');
    const currentScrollY = Math.max(window.scrollY || 0, 0);
    const isMobileWidth = window.matchMedia('(max-width: 600px)').matches;
    const isNearTop = currentScrollY <= 24;
    const isScrollingDown = currentScrollY > lastScrollY;

    if (topBtn) {
        if ((currentScrollY - 150) > 0) {
            topBtn.style.opacity = '1';
            topBtn.style.visibility = 'visible';
        } else {
            topBtn.style.opacity = '0';
            topBtn.style.visibility = 'hidden';
        }
    }

    if (stickyMenu) {
        if ((currentScrollY - 150) > 0 && window.innerWidth > 600) {
            stickyMenu.classList.add('ui-nav--sticky');
        } else {
            stickyMenu.classList.remove('ui-nav--sticky');
        }
    }

    if (mobileNavTrigger) {
        const shouldHideMobileTrigger = isMobileWidth
            && !isNearTop
            && isScrollingDown
            && !isMobileNavigationOpen;

        if (!isMobileWidth || isNearTop || !isScrollingDown || isMobileNavigationOpen) {
            mobileNavTrigger.classList.remove('is-hidden');
        } else if (shouldHideMobileTrigger) {
            mobileNavTrigger.classList.add('is-hidden');
        }
    }

    lastScrollY = currentScrollY;
}

document.addEventListener('scroll', updateScrollAwareControls, { passive: true });
window.addEventListener('resize', () => {
    lastScrollY = window.scrollY || 0;
    updateScrollAwareControls();
});
