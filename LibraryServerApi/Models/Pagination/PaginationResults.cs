using System;
using System.Collections.Generic;

namespace LibraryServerApi.Models.Pagination
{
    public class PaginationResults<T>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PaginationResults{T}"/> class.
        /// </summary>
        public PaginationResults()
        {
            Results = new T[0];
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PaginationResults{T}"/> class.
        /// </summary>
        /// <param name="results">The results.</param>
        /// <param name="next">The next.</param>
        /// <param name="previous">The previous.</param>
        /// <param name="totalCount">The total count.</param>
        /// <exception cref="System.ArgumentNullException">results</exception>
        public PaginationResults(IEnumerable<T> results,
            Paginate<T> next = null,
            Paginate<T> previous = null,
            long totalCount = 0)
        {
            Results = results
                ?? throw new ArgumentNullException(nameof(results));

            Next = next;
            Previous = previous;
            TotalCount = totalCount;
        }

        public IEnumerable<T> Results { get; set; }

        public Paginate<T> Next { get; set; }

        public Paginate<T> Previous { get; set; }

        public long TotalCount { get; set; }
    }
}
