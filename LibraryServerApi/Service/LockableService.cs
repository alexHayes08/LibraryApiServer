using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LibraryServerApi.Models.Lock;
using LibraryServerApi.Models.Lockable;
using LibraryServerApi.Models.Pagination;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LibraryServerApi.Service
{
    public class LockableService : CrudPlusPattern<Lockable>, ILockableService
    {
        #region Fields

        private readonly ILockRecordService lockRecordService;

        #endregion

        #region Constructor

        public LockableService(ILockRecordService lockRecordService,
            IMongoCollection<Lockable> collection)
            : base(collection)
        {
            this.lockRecordService = lockRecordService;
        }

        #endregion

        #region Methods

        public async Task<LockResponse> LockAsync(Lockable lockable, Lock @lock)
        {
            if (lockable == null)
                throw new ArgumentNullException(nameof(lockable));
            else if (@lock == null)
                throw new ArgumentNullException(nameof(@lock));

            // Generate an id for the lock.
            if (String.IsNullOrEmpty(@lock.Id))
                @lock.Id = ObjectId.GenerateNewId().ToString();

            // Verify the Locks property isn't readonly.
            if (lockable.Locks.IsReadOnly)
                lockable.Locks = lockable.Locks.ToList();

            // Set the LockedAt property.
            @lock.LockedAt = DateTime.Now;

            lockable.Locks.Add(@lock);

            var response = await UpdateAsync(lockable);

            return new LockResponse
            {
                Lockable = response,
                LockId = @lock.Id
            };
        }

        public async Task<UnlockResponse> UnlockAsync(Lockable lockable, string lockId)
        {
            if (lockable == null)
                throw new ArgumentNullException(nameof(lockable));
            else if (String.IsNullOrEmpty(lockId))
                throw new ArgumentException(nameof(lockId));

            var @lock = lockable.Locks.FirstOrDefault(l => l.Id == lockId);

            if (@lock == null)
                throw new Exception("No such lock matching the id.");

            var lockRecord = new LockRecord
            {
                IsShared = @lock.IsShared,
                LockableId = lockable.Id,
                LockedAt = @lock.LockedAt,
                MaxLeaseDate = @lock.MaxLeaseDate,
                OwnerToken = @lock.OwnerToken,
                UnlockedAt = DateTime.Now
            };

            await lockRecordService.CreateAsync(lockRecord);
            lockable.Locks.Remove(@lock);
            var result = await UpdateAsync(lockable);

            return new UnlockResponse
            {
                Lockable = result,
                LockRecord = lockRecord
            };
        }

        public async Task<LockResponse> RetrieveLatestInCategoryAsync(
            IEnumerable<string> categoryNames,
            bool isReadonly)
        {
            var fb = new FilterDefinitionBuilder<Lockable>();

            var filter = fb.And(
                fb.All(l => l.Categories, categoryNames),
                fb.Or(
                    $"{{ \"Locks.IsShared\": {isReadonly.ToString().ToLower()} }}",
                    "{ Locks: { $size: 0 } }"));

            var lockable = await collection
                .Find(filter)
                .FirstOrDefaultAsync();

            if (lockable == null)
                return null;

            var @lock = new Lock
            {
                IsShared = isReadonly,
                MaxLeaseDate = DateTime.Now.AddHours(1),
                OwnerToken = null,
                UnlockedAt = default(DateTime)
            };

            var response = await LockAsync(lockable, @lock);

            return response;
        }

        public override Task<Lockable> CreateAsync(Lockable model,
            CancellationToken? cancellationToken = null)
        {
            model.CreatedOn = DateTime.Now;

            return base.CreateAsync(model, cancellationToken);
        }

        public override Task<PaginationResults<Lockable>> CreateManyAsync(
            IEnumerable<Lockable> models,
            CancellationToken? cancellationToken = null)
        {
            foreach (var model in models)
                model.CreatedOn = DateTime.Now;

            return base.CreateManyAsync(models, cancellationToken);
        }

        public override async Task<bool> DeleteAsync(Lockable model,
            CancellationToken? cancellationToken = null)
        {
            var result = await base.DeleteAsync(model, cancellationToken);

            if (result)
            {
                var records = lockRecordService
                    .Query()
                    .Where(l => l.LockableId == model.Id)
                    .ToList();

                if (records.Any())
                    result = await lockRecordService.DeleteManyAsync(records);
            }

            return result;
        }

        public override async Task<bool> DeleteManyAsync(
            IEnumerable<Lockable> models,
            CancellationToken? cancellationToken = null)
        {
            var result = await base.DeleteManyAsync(models, cancellationToken);

            if (result)
            {
                var ids = models.Select(l => l.Id).ToList();
                var records = lockRecordService.Query()
                    .Where(l => ids.Contains(l.LockableId))
                    .ToList();

                if (records.Any())
                    result = await lockRecordService.DeleteManyAsync(records);
            }

            return result;
        }

        #endregion
    }
}
