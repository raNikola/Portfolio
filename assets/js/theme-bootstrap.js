(function () {
    var storageKey = 'portfolio-theme';
    var theme = 'light';

    try {
        var savedTheme = window.localStorage.getItem(storageKey);
        var systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemPrefersDark ? 'dark' : 'light';
    } catch (error) {
        theme = 'light';
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
}());
