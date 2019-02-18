using System;

namespace LibraryServerApi.Models.Lock
{
    public class LockRecord : BaseEntity, IGenericLockRecord
    {
        public DateTime UnlockedAt { get; set; }
        public string LockableId { get; set; }
        public string OwnerToken { get; set; }
        public bool IsShared { get; set; }
        public DateTime LockedAt { get; set; }
        public DateTime MaxLeaseDate { get; set; }
    }
}
