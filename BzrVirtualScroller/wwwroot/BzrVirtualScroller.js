window.bzrVirtualScroller = (function () {

    _containerElement = null;
    _dotnetRef = null;
    _observer = null;
    _visibleItemIds = [];

    onItemEnteredOrLeftViewPort = function (entries, observer) {
        let anyChange = false;

        for (var i = 0; i < entries.length; i++) {
            let entry = entries[i];
            let entryItemId = entry.target.getAttribute('data-bzr-virtual-scroller-item-id');
            
            if (entry.isIntersecting) {
                if (!_visibleItemIds.includes(entryItemId)) {
                    _visibleItemIds.push(entryItemId);
                    anyChange = true;
                }
            } else {
                var itemIndex = _visibleItemIds.indexOf(entryItemId);

                if (itemIndex !== -1) {
                    _visibleItemIds.splice(itemIndex, 1);
                    anyChange = true;
                }
            }
        }

        if (anyChange) {
            _dotnetRef.invokeMethodAsync('UpdateViewportAsync', _visibleItemIds);
        }
    };

    outerHeight = function (el) {
        let styles = window.getComputedStyle(el);
        let margin = parseFloat(styles['marginTop']) +
            parseFloat(styles['marginBottom']);

        return Math.ceil(el.offsetHeight + margin);
    };

    return {
        init: (containerElement, dotnetRef) => {
            _containerElement = containerElement;
            _dotnetRef = dotnetRef;
            _observer = new IntersectionObserver(onItemEnteredOrLeftViewPort, { root: null, threshold: [0, 0.01] });
        },

        /**
        * @param {HTMLElement} containerElement
        */
        ensureAllItemIntersectionsAreObserved: () => {

            let markingAttrName = 'intersectionObserverd';
            let allItems = _containerElement.children;
            for (let i = 0; i < allItems.length; i++) {

                let item = allItems[i];
                let markingAttr = item.getAttribute(markingAttrName);

                if (markingAttr !== 'marked') {
                    console.log('marking...');
                    this._observer.observe(item);
                    item.setAttribute(markingAttrName, 'marked');
                }
            }

            //Todo unobserve when items are destroyed (if needed)
        },

        /**
        * @param {HTMLElement} containerElement
        * @param {Number} nrOfItems
        */
        scrollPastTopItems: (nrOfItems) => {

            let items = _containerElement.children;
            let totalHeightToScroll = 0;

            for (let i = 0; i < nrOfItems; i++) {
                totalHeightToScroll += outerHeight(items[i]);
            }

            //Curently scrolling the whole page, TODO option to scroll within a container
            window.scrollBy(0, totalHeightToScroll);

            return true;
        }
    };
})();
