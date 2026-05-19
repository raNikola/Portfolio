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

function isBelowTabletWidth() {
    return window.matchMedia('(max-width: 767px)').matches;
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

document.addEventListener('DOMContentLoaded', function () {
    renderLucideIcons();
    scheduleParticlesInitialization();

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

    const toolTipped = document.querySelectorAll('.tooltipped');
    if (window.M && toolTipped.length) {
        M.Tooltip.init(toolTipped);
    }

    const nav = document.querySelectorAll('.sidenav');
    if (window.M && nav.length) {
        nav.forEach(sidenav => {
            const triggers = Array.from(document.querySelectorAll(`[data-target="${sidenav.id}"]`));
            const isMobileNavigation = sidenav.id === 'mobile-nav';

            triggers.forEach(trigger => {
                trigger.setAttribute('aria-controls', sidenav.id);
                trigger.setAttribute('aria-expanded', 'false');
            });

            if (isMobileNavigation) {
                sidenav.hidden = true;
                sidenav.setAttribute('aria-hidden', 'true');
            }

            M.Sidenav.init(sidenav, {
                edge: 'right',
                draggable: true,
                inDuration: 250,
                outDuration: 200,
                preventScrolling: true,
                onOpenStart: () => {
                    if (isMobileNavigation) {
                        isMobileNavigationOpen = true;
                        sidenav.hidden = false;
                        sidenav.setAttribute('aria-hidden', 'false');
                        triggers.forEach(trigger => trigger.classList.remove('is-hidden'));
                    }

                    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'true'));
                },
                onCloseEnd: () => {
                    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));

                    if (isMobileNavigation) {
                        isMobileNavigationOpen = false;
                        sidenav.hidden = true;
                        sidenav.setAttribute('aria-hidden', 'true');
                        triggers.forEach(trigger => trigger.classList.remove('is-hidden'));
                        lastScrollY = window.scrollY || 0;
                    }
                }
            });
        });
    }

    runNonCriticalEnhancement(() => {
        const referencesCarousel = document.querySelector('.references__carousel');
        if (window.M && referencesCarousel) {
            const instance = M.Carousel.init(referencesCarousel, {
                fullWidth: true,
                indicators: true,
                duration: 250
            });

            const prevButton = document.querySelector('.references__control--prev');
            const nextButton = document.querySelector('.references__control--next');
            const carouselContainer = document.querySelector('.references__carousel-container');
            const carouselTrack = document.querySelector('.references__track');
            const carouselItems = [...referencesCarousel.querySelectorAll('.references__carousel-item')];
            const referenceCard = carouselItems[2]?.querySelector('.references__card');

            function updateCarouselHeight() {
                if (!carouselContainer || !carouselTrack || !referenceCard) return;

                const extraSpace = window.matchMedia('(max-width: 480px)').matches
                    ? 100
                    : window.matchMedia('(max-width: 600px)').matches
                        ? 90
                        : 70;

                const height = referenceCard.offsetHeight + extraSpace;

                [referencesCarousel, carouselContainer, carouselTrack].forEach(el => {
                    el.style.height = `${height}px`;
                    el.style.minHeight = `${height}px`;
                });

                carouselItems.forEach(item => {
                    item.style.minHeight = `${height}px`;
                });
            }

            const autoplayDelay = 15000;
            let autoplayTimer;

            function startAutoplay() {
                autoplayTimer = setInterval(() => {
                    instance.next();
                    updateCarouselHeight();
                }, autoplayDelay);
            }

            function resetAutoplay() {
                clearInterval(autoplayTimer);
                startAutoplay();
            }

            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    instance.prev();
                    updateCarouselHeight();
                    resetAutoplay();
                });
            }

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    instance.next();
                    updateCarouselHeight();
                    resetAutoplay();
                });
            }

            referencesCarousel.addEventListener('click', event => {
                if (event.target.closest('.indicator-item')) {
                    setTimeout(updateCarouselHeight, 300);
                    resetAutoplay();
                }
            });

            updateCarouselHeight();
            window.addEventListener('resize', updateCarouselHeight);

            startAutoplay();
        }

        const tapTarget = document.querySelector('.tap-target');
        if (window.M && tapTarget) {
            const instance = M.TapTarget.init(tapTarget);

            setTimeout(function () {
              instance.open();
            }, 7000);

            setTimeout(function () {
              instance.close();
            }, 15000);
        }
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

            document.querySelectorAll('#skills-cards .card')
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
    const mainMenu = document.querySelector('.header__navbar');
    const stickyMenu = document.querySelector('.navbar-sticky');
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

    if (mainMenu && stickyMenu) {
        if ((currentScrollY - 150) > 0 && window.innerWidth > 600) {
            mainMenu.classList.add('navbar-fixed');
            stickyMenu.style.position = 'fixed';
        } else {
            mainMenu.classList.remove('navbar-fixed');
            stickyMenu.style.position = 'sticky';
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
