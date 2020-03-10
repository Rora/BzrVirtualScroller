using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BzrVirtualScroller
{
    public class DummyDataLoader
    {
        public static async ValueTask<IEnumerable<VirtualScrollerEntry>> LoadDataAsync(ItemProducerArgs args)
        {
            await Task.Delay(100); //Simulate a delay to see more realistic perf

            if (args.ItemId == null)
            {
                return (IEnumerable<VirtualScrollerEntry>)Enumerable.Range(1, args.NrOfItemsToLoad)
                    .Select(i => new VirtualScrollerEntry { Id = i.ToString(), Value = i.ToString() })
                    .ToArray();
            }

            var itemId = Int32.Parse(args.ItemId);
            var items = args.ScrollDirection == ScrollDirection.Down
                ? Enumerable.Range(itemId + 1, args.NrOfItemsToLoad)
                : Enumerable.Range(itemId - args.NrOfItemsToLoad, args.NrOfItemsToLoad).Reverse();

            return (IEnumerable<VirtualScrollerEntry>)items
                .Select(i => new VirtualScrollerEntry { Id = i.ToString(), Value = i.ToString() })
                .ToArray();
        }
    }
}
