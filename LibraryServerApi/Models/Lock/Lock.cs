using System;
using MongoDB.Bson;

namespace LibraryServerApi.Models.Lock
{
    public class Lock : BaseEntity, IGenericLock
    {
        public string OwnerToken { get; set; }
        public bool IsShared { get; set; }
        public DateTime LockedAt { get; set; }
        public DateTime UnlockedAt { get; set; }
        public DateTime MaxLeaseDate { get; set; }
    }
}
