(async () => {
    const storage = new Proxy({}, {
        get(_, key) {
            return browser.storage.local
                .get(key)
                .then(result => result[key] ?? null)
        },
        set(_, key, value) {
            browser.storage.local.set({[key]: value})
            return true
        },
    })

    const OBSERVER_CONFIG = {
        attributes: false,
        subtree: false,
        childList: true,
    };

    const flattenMutationListNodes = (mutationList) => mutationList
        .map(mutation => Array.from(mutation.addedNodes))
        .flat();

    const waitAndResolve = (callbackResolver) => new Promise((resolve, __err) => {
        let observer = null;
        observer = new MutationObserver(() => {
            const returned = (callbackResolver)()
            if (Array.isArray(returned) && !returned.length)
                return;
            if (returned) {
                observer.disconnect();
                (resolve)(returned);
            }
        })

        observer.observe(document.body, {attributes: false, subtree: true, childList: true});
    })

    const initializeEventListeners = async () => {
        const feedGrids = await waitAndResolve(() => Array.from(document.body.querySelectorAll('#primary #contents')));

        const hasDismissible = (element) => !!element.querySelector('#dismissible');
        const hideElement = (element) => element.style.setProperty('display', 'none', 'important');

        const hideShorts = (mutationList) =>
            flattenMutationListNodes(mutationList).filter(hasDismissible).forEach(hideElement);

        const observer = new MutationObserver(hideShorts);
        feedGrids.forEach(feedGrid => observer.observe(feedGrid, OBSERVER_CONFIG));

        feedGrids.map(grid => Array.from(grid.childNodes)).flat().filter(hasDismissible).forEach(hideElement)
    }

    const intializeGridSizeChanger = async (configuredSize) => {
        const feedGrids = await waitAndResolve(() => Array.from(document.body.querySelectorAll('#primary #contents')));
        console.log('GRID, FOUND '  +feedGrids.length + ' FEEDS');

        const changeElementSize = (element) => {
            if (element.querySelector('ytm-shorts-lockup-view-model'))
                return; // Don't edit short items if still displayed

            element.style.setProperty('--ytd-rich-grid-items-per-row', configuredSize, 'important')
        }

        const changeElementsSize = (mutationList) => {
            flattenMutationListNodes(mutationList)
            .filter(element => element.hasAttribute('items-per-row'))
            .forEach(changeElementSize);
        }

        const observer = new MutationObserver(changeElementsSize);
        feedGrids.forEach(feedGrid => observer.observe(feedGrid, OBSERVER_CONFIG));
        feedGrids
            .map(grid => Array.from(grid.querySelectorAll('[items-per-row]')))
            .flat()
            .forEach(changeElementSize)
    }


    const addExtensionListeners = async () => {
        // All features can be disabled at once
        if (!((await storage.enabled) ?? true))
            return;

        console.info('🔌 Shortener extension: intializing listeners');

        // Removed suggested shorts from feed grid content
        if ((await storage['removeShortsFromFeedGrid']) ?? true)
            initializeEventListeners()

        // Items per row changed => turn on observer
        const itemsPerRow = (await storage['itemsPerRow']) ?? 3;
        if (itemsPerRow !== 3)
            intializeGridSizeChanger(itemsPerRow);

        // Sidebar short button removal
        if ((await storage['removeShortsFromSidebar']) ?? true) {
            waitAndResolve(() => document.querySelector(`ytd-mini-guide-entry-renderer:has(a[href*='shorts'])`))
                .then(resolved => resolved.remove())
            waitAndResolve(() => document.querySelector(`ytd-guide-entry-renderer:has(a[title*='Shorts'])`))
                .then(resolved => resolved.remove())
        }
    }

    // Reload listeners on page init/change
    // (Thanks ChatGPT for the event name)
    window.addEventListener('yt-navigate-finish', addExtensionListeners)
})();


