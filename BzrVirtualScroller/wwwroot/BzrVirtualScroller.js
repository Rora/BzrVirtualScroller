window.bzrVirtualScroller = {
    
    scrollPastTopItems: (containerElement, nrOfItems) => {

        var items = containerElement.children;
        var totalHeightToScroll = 0;

        for (var i = 0; i < nrOfItems ; i++) {
            totalHeightToScroll += bzrVirtualScroller.outerHeight(items[i]);
        }

        //Curently scrolling the whole page, TODO option to scroll within a container
        window.scrollBy(0, totalHeightToScroll);

        return true;
    },

    outerHeight: (el) => {
        var styles = window.getComputedStyle(el);
        var margin = parseFloat(styles['marginTop']) +
            parseFloat(styles['marginBottom']);

        return Math.ceil(el.offsetHeight + margin);
    }
}