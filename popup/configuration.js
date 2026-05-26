// Configuration Storage
(() => {
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

    const defaults = {
        'enabled': true,
        'removeShortsFromFeedGrid': true,
        'removeShortsFromSidebar': true,
        'itemsPerRow': 3,
    }

    const initialize = async () => {
        const promises = Array.from(document.querySelectorAll(`input[storage-key],checkbox[storage-key]`)).map(async element => {
            const storageKey = element.getAttribute('storage-key');
            const isCheckbox = element.getAttribute('type') === 'checkbox';

            element.addEventListener('change', () => {
                const value = isCheckbox ? element.checked : element.value
                storage[storageKey] = value
            });

            let value = await storage[storageKey]
                ?? defaults[storageKey]
                ?? null

            if (isCheckbox)
                element.checked = value;
            else
                element.value = value;

        })

        await Promise.allSettled(promises)

        const itemsPerRowInput = itemsPerRowLabel.previousElementSibling;
        const updateItemsPerRowLabel = () =>
            itemsPerRowLabel.innerText = itemsPerRowInput.value;

        itemsPerRowInput.addEventListener('change', updateItemsPerRowLabel);
        updateItemsPerRowLabel();
    }

    document.addEventListener('DOMContentLoaded', initialize)
})();
