using System.Collections.Generic;
using System.Threading.Tasks;
using LibraryServerApi.Models.Lock;
using LibraryServerApi.Models.Lockable;

namespace LibraryServerApi.Service
{
    /// <summary>
    /// Service for managing <c>Lockable</c>s.
    /// </summary>
    /// <seealso cref="LibraryServerApi.Service.ICrudPlusPattern{T}" />
    public interface ILockableService : ICrudPlusPattern<Lockable>
    {
        /// <summary>
        /// Locks the specified lockable.
        /// </summary>
        /// <param name="lockable">The lockable.</param>
        /// <param name="lock">The lock.</param>
        /// <returns></returns>
        Task<LockResponse> LockAsync(Lockable lockable, Lock @lock);

        /// <summary>
        /// Retrieves the latest in category.
        /// </summary>
        /// <param name="categoryNames">The category names.</param>
        /// <param name="isReadonly">
        /// If true then only lockables that have either no locks or readonly
        /// locks will be returned.
        /// </param>
        /// <returns></returns>
        Task<LockResponse> RetrieveLatestInCategoryAsync(
            IEnumerable<string> categoryNames,
            bool isReadonly);

        /// <summary>
        /// Unlocks the specified lockable.
        /// </summary>
        /// <param name="lockable">The lockable.</param>
        /// <param name="lockId">The lock identifier.</param>
        /// <returns></returns>
        Task<UnlockResponse> UnlockAsync(Lockable lockable, string lockId);
    }
}