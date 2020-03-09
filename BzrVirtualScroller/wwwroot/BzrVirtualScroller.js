window.bzrVirtualScroller = (function () {

    _states = {};

    onItemEnteredOrLeftViewPort = function (state, entries, observer) {
        let anyChange = false;

        for (var i = 0; i < entries.length; i++) {
            let entry = entries[i];
            let entryItemId = entry.target.getAttribute('data-bzr-virtual-scroller-item-id');
            
            if (entry.isIntersecting) {
                if (!state.visibleItemIds.includes(entryItemId)) {
                    state.visibleItemIds.push(entryItemId);
                    anyChange = true;
                }
            } else {
                var itemIndex = state.visibleItemIds.indexOf(entryItemId);

                if (itemIndex !== -1) {
                    state.visibleItemIds.splice(itemIndex, 1);
                    anyChange = true;
                }
            }
        }

        if (anyChange) {
            state.dotnetRef.invokeMethodAsync('UpdateViewportAsync', state.visibleItemIds);
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
            _states[dotnetRef._id] = {
                dotnetRef: dotnetRef,
                containerElement: containerElement,
                observer: new IntersectionObserver((e, o) => onItemEnteredOrLeftViewPort(_states[dotnetRef._id], e, o), { root: null, threshold: [0, 0.01] }),
                visibleItemIds: [],
            };
        },

        ensureAllItemIntersectionsAreObserved: (dotnetRef) => {

            let markingAttrName = 'intersectionObserverd';
            let allItems = _states[dotnetRef._id].containerElement.children;
            for (let i = 0; i < allItems.length; i++) {

                let item = allItems[i];
                let markingAttr = item.getAttribute(markingAttrName);

                if (markingAttr !== 'marked') {
                    //Will be unobserved once the dom element is deleted
                    _states[dotnetRef._id].observer.observe(item);
                    item.setAttribute(markingAttrName, 'marked');
                }
            }
        },

        scrollPastTopItems: (dotnetRef, nrOfItems) => {

            let items = _states[dotnetRef._id].containerElement.children;
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
