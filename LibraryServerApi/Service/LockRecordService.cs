using LibraryServerApi.Models.Lock;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace LibraryServerApi.Service
{
    /// <summary>
    /// Manages <c>LockRecord</c>s.
    /// </summary>
    /// <seealso cref="LibraryServerApi.Service.CrudPlusPattern{LibraryServerApi.Models.Lock.LockRecord}" />
    public class LockRecordService : CrudPlusPattern<LockRecord>,
        ILockRecordService
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LockRecordService"/> class.
        /// </summary>
        /// <param name="mongoCollection">The mongo collection.</param>
        public LockRecordService(IMongoCollection<LockRecord> mongoCollection)
            : base(mongoCollection)
        { }
    }
}
