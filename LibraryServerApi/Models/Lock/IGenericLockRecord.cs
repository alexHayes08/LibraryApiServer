namespace LibraryServerApi.Models.Lock
{
    public interface IGenericLockRecord : IGenericLock
    {
        string LockableId { get; set; }
    }
}
