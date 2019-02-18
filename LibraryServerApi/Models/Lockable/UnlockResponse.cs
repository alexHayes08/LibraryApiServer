using LibraryServerApi.Models.Lock;

namespace LibraryServerApi.Models.Lockable
{
    public class UnlockResponse
    {
        public Lockable Lockable { get; set; }
        public LockRecord LockRecord { get; set; }
    }
}
