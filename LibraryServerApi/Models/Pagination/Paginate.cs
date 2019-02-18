using MongoDB.Driver;

namespace LibraryServerApi.Models.Pagination
{
    public class Paginate<T>
    {
        public SortDefinition<T> OrderBy { get; set; }
        public FilterDefinition<T> Filter { get; set; }
        public int Limit { get; set; }
        public int Skip { get; set; }
    }
}
