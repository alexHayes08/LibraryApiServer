using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryServerApi.Models.Lockable
{
    /// <summary>
    /// Lockable.
    /// </summary>
    /// <seealso cref="LibraryServerApi.Models.BaseEntity" />
    public class Lockable : BaseEntity
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Lockable"/> class.
        /// </summary>
        public Lockable()
        {
            Locks = new List<Lock.Lock>();
        }

        /// <summary>
        /// Gets or sets the locks.
        /// </summary>
        /// <value>
        /// The locks.
        /// </value>
        public IList<Lock.Lock> Locks { get; set; }

        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        /// <value>
        /// The name.
        /// </value>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the created on.
        /// </summary>
        /// <value>
        /// The created on.
        /// </value>
        public DateTime CreatedOn { get; set; }

        /// <summary>
        /// Gets or sets the categories.
        /// </summary>
        /// <value>
        /// The categories.
        /// </value>
        public IList<string> Categories { get; set; }

        /// <summary>
        /// Gets or sets the data.
        /// </summary>
        /// <value>
        /// The data.
        /// </value>
        public object Data { get; set; }

        /// <summary>
        /// Gets the active locks.
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Lock.Lock> GetActiveLocks()
        {
            if (Locks == null)
                return Enumerable.Empty<Lock.Lock>();

            var now = DateTime.Now;

            var activeLocks = Locks
                .Where(l => l.UnlockedAt > now || l.UnlockedAt == default(DateTime))
                .ToList();

            return activeLocks;
        }

        /// <summary>
        /// Gets the inactive locks.
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Lock.Lock> GetInactiveLocks()
        {
            var now = DateTime.Now;

            return Locks.Where(l => l.UnlockedAt <= now);
        }

        /// <summary>
        /// Determines whether this instance is locked.
        /// </summary>
        /// <returns>
        ///   <c>true</c> if this instance is locked; otherwise, <c>false</c>.
        /// </returns>
        public bool IsLocked()
        {
            return GetActiveLocks().Any(l => !l.IsShared);
        }

        /// <summary>
        /// Determines whether this instance is shared.
        /// </summary>
        /// <returns>
        ///   <c>true</c> if this instance is shared; otherwise, <c>false</c>.
        /// </returns>
        public bool IsShared()
        {
            if (Locks == null)
                return false;

            return GetActiveLocks().Any(l => l.IsShared);
        }
}
}
