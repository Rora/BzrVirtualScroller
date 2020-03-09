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
        init: (scrollContainerElementSelector, containerElement, dotnetRef) => {
            let state = {
                dotnetRef: dotnetRef,
                scrollContainerElement: null,
                containerElement: containerElement,
                observer: null,
                visibleItemIds: [],
            };

            let scrollContainerElement = null

            if (scrollContainerElementSelector !== '') {
                scrollContainerElement = document.querySelector(scrollContainerElementSelector);

                if (scrollContainerElement === undefined) {
                    throw 'scrollContainerElementSelector "' + scrollContainerElementSelector + '" found no elements';
                }
            }

            var observerOptions = {
                root: scrollContainerElement,
                threshold: [0]
            };

            state.scrollContainerElement = (scrollContainerElement !== null) ? scrollContainerElement : window;
            state.observer = new IntersectionObserver((e, o) => onItemEnteredOrLeftViewPort(state, e, o), observerOptions);

            _states.set(dotnetRef._id, state);
        },

        ensureAllItemIntersectionsAreObserved: (dotnetRef) => {

            let markingAttrName = 'intersectionObserverd';
            let state = _states.get(dotnetRef._id);
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

            let state = _states.get(dotnetRef._id);
            let items = state.containerElement.children;
            let totalHeightToScroll = 0;

            for (let i = 0; i < nrOfItems; i++) {
                totalHeightToScroll += outerHeight(items[i]);
            }

            var scrollTop = state.scrollContainerElement === window
                ? state.scrollContainerElement.scrollY
                : state.scrollContainerElement.scrollTop;

            if (scrollTop < 25) {
                console.log("Scrolling past added top items.");
                state.scrollContainerElement.scrollBy(0, totalHeightToScroll);
            }

            return true;
        },

        ensureUserIsNotScrolledToTheBottom: (dotnetRef) => {
            let state = _states.get(dotnetRef._id);
            let scrollWindowHeight;
            let scrollBottomPosition;

            if (state.scrollContainerElement == window) {
                scrollWindowHeight = ((document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight);
                scrollWindowHeight = scrollWindowHeight - 2; //This fixes an offset issue on macOS
                scrollBottomPosition = window.innerHeight + window.scrollY;
            }
            else {
                let scrollCont = state.scrollContainerElement;
                scrollWindowHeight = scrollCont.scrollHeight;
                scrollBottomPosition = scrollCont.clientHeight + scrollCont.scrollTop;
            }

            if (scrollBottomPosition >= scrollWindowHeight) {
                // you're at the bottom of the scroll container
                state.scrollContainerElement.scrollBy(0, -1);
            }
        },

        dispose: (dotnetRef) => {
            _states.get(dotnetRef._id).observer.disconnect();
            _states.delete(dotnetRef._id);
        }
    };
})();