using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BzrVirtualScroller
{
    public class ItemProducerArgs
    {
        public string ItemId { get; set; }
        public int NrOfItemsToLoad { get; set; }
        public ScrollDirection ScrollDirection { get; set; }
    }
}
