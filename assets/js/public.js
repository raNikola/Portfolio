/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
if (window.particlesJS && document.getElementById('particles-js')) {
    particlesJS.load('particles-js', 'assets/particles.json');
}

document.addEventListener('DOMContentLoaded', function () {
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
        M.Sidenav.init(nav, {
            edge: 'right',
            draggable: true,
            inDuration: 250,
            outDuration: 200,
            preventScrolling: true
        });
    }

    const referencesCarousel = document.querySelector('.references__carousel');
    if (window.M && referencesCarousel) {
        const instance = M.Carousel.init(referencesCarousel, {
            fullWidth: true,
            indicators: true,
            duration: 250
        });

        const prevButton = document.querySelector('.references__control--prev');
        const nextButton = document.querySelector('.references__control--next');

        const autoplayDelay = 12000;
        let autoplayTimer;

        function startAutoplay() {
            autoplayTimer = setInterval(() => {
                instance.next();
            }, autoplayDelay);
        }

        function resetAutoplay() {
            clearInterval(autoplayTimer);
            startAutoplay();
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                instance.prev();
                resetAutoplay();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                instance.next();
                resetAutoplay();
            });
        }

        startAutoplay();
    }

    const tapTarget = document.querySelector('.tap-target');
    if (window.M && tapTarget) {
        const instance = M.TapTarget.init(tapTarget);

        /*setTimeout(function () {
          instance.open();
        }, 7000);

        setTimeout(function () {
          instance.close();
        }, 15000);*/
    }

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
});

document.addEventListener('scroll', function () {
    const topBtn = document.querySelector('.top-btn');
    const mainMenu = document.querySelector('.header__navbar');
    const stickyMenu = document.querySelector('.navbar-sticky');

    if (!topBtn || !mainMenu || !stickyMenu) {
        return;
    }

    if ((window.scrollY - 150) > 0) {
        topBtn.style.opacity = '1';
        topBtn.style.visibility = 'visible';

    } else {
        topBtn.style.opacity = '0';
        topBtn.style.visibility = 'hidden';
    }

    if ((window.scrollY - 150) > 0 && window.innerWidth > 600) {
        mainMenu.classList.add('navbar-fixed');
        stickyMenu.style.position = 'fixed';
    } else {
        mainMenu.classList.remove('navbar-fixed');
        stickyMenu.style.position = 'sticky';
    }
});
