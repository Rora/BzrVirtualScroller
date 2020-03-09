window.bzrVirtualScroller = (function () {

    _states = new Map();

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
            _states.set(dotnetRef._id, {
                dotnetRef: dotnetRef,
                containerElement: containerElement,
                observer: new IntersectionObserver((e, o) => onItemEnteredOrLeftViewPort(_states.get(dotnetRef._id), e, o), { root: null, threshold: [0, 0.01] }),
                visibleItemIds: [],
            });
        },

        ensureAllItemIntersectionsAreObserved: (dotnetRef) => {

            let markingAttrName = 'intersectionObserverd';
            var state = _states.get(dotnetRef._id);
            let allItems = state.containerElement.children;
            for (let i = 0; i < allItems.length; i++) {

                let item = allItems[i];
                let markingAttr = item.getAttribute(markingAttrName);

                if (markingAttr !== 'marked') {
                    //Will be unobserved once the dom element is deleted
                    state.observer.observe(item);
                    item.setAttribute(markingAttrName, 'marked');
                }
            }
        },

        scrollPastTopItems: (dotnetRef, nrOfItems) => {

            let items = _states.get(dotnetRef._id).containerElement.children;
            let totalHeightToScroll = 0;

            for (let i = 0; i < nrOfItems; i++) {
                totalHeightToScroll += outerHeight(items[i]);
            }

            //Curently scrolling the whole page, TODO option to scroll within a container
            window.scrollBy(0, totalHeightToScroll);

            return true;
        },

        //TODO make this work for scrolling within a container
        ensureUserIsNotScrolledToTheBottom: (dotnetRef) => {
            var containerScrollHeight = ((document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight);
            containerScrollHeight = containerScrollHeight - 2; //This fixes an offset issue on macOS
            if ((window.innerHeight + window.scrollY) >= containerScrollHeight) {
                // you're at the bottom of the page
                window.scrollBy(0, -1);
            }
        },

        dispose: (dotnetRef) => {
            _states.get(dotnetRef._id).observer.disconnect();
            _states.delete(dotnetRef._id);
        }
    };
})();

function A() {
    window.scrollTo(0, ((document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight));
}