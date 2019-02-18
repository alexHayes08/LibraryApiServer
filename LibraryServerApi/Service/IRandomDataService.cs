using System.Threading.Tasks;
using LibraryServerApi.Models.RandomData;

namespace LibraryServerApi.Service
{
    /// <summary>
    /// Manages <c>RandomDataCollection</c>s.
    /// </summary>
    /// <seealso cref="LibraryServerApi.Service.ICrudPlusPattern{LibraryServerApi.Models.RandomData.RandomDataCollection}" />
    public interface IRandomDataService : ICrudPlusPattern<RandomDataCollection>
    {
        /// <summary>
        /// Gets a random data item of the collection or null if the either the
        /// collection doesn't exist or the collection has no items.
        /// </summary>
        /// <param name="groupName">Name of the group.</param>
        /// <returns></returns>
        Task<RandomDataItem> GetRandomDataItemAsync(string groupName);
    }
}