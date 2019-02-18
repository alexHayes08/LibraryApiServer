using LibraryServerApi.Models.Lock;

namespace LibraryServerApi.Service
{
    /// <summary>
    /// Manages <c>LockRecord</c>s.
    /// </summary>
    /// <seealso cref="LibraryServerApi.Service.ICrudPlusPattern{LibraryServerApi.Models.Lock.LockRecord}" />
    public interface ILockRecordService : ICrudPlusPattern<LockRecord>
    { }
}
