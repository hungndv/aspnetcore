using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReactAu.ViewModels
{
    public class PaginatedList<T>
    {
        public int PageIndex { get; private set; }
        public int TotalPages { get; private set; }
        public List<T> Items { get; private set; }
        public int TotalCount { get; private set; }

        public PaginatedList(List<T> items, int count, int pageIndex, int pageSize, int totalPages)
        {
            PageIndex = pageIndex;
            TotalPages = totalPages;
            Items = items;
            TotalCount = count;
        }

        public bool HasPreviousPage
        {
            get
            {
                return (PageIndex > 1);
            }
        }

        public bool HasNextPage
        {
            get
            {
                return (PageIndex < TotalPages);
            }
        }

        public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize)
        {
            var count = await source.CountAsync();
            var totalPages = (int)Math.Ceiling(count / (double)pageSize);
            if (pageIndex > totalPages) pageIndex = totalPages;
            var items = await source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PaginatedList<T>(items, count, pageIndex, pageSize, totalPages);
        }
    }
}
