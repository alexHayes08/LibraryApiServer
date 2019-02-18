using System;

namespace LibraryServerApi.Models.Lock
{
    public interface IGenericLock
    {
        string OwnerToken { get; set; }
        bool IsShared { get; set; }
        DateTime LockedAt { get; set; }
        DateTime UnlockedAt { get; set; }
        DateTime MaxLeaseDate { get; set; }
    }
}
