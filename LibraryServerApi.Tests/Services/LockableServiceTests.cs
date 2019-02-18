using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Lock;
using LibraryServerApi.Models.Lockable;
using LibraryServerApi.Models.Pagination;
using LibraryServerApi.Service;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MongoDB.Driver;

namespace LibraryServerApi.Tests.Services
{
    [TestClass]
    public class LockableServiceTests
    {
        #region Nested Classes

        public class Customer : BaseEntity
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public int Age { get; set; }
        }

        #endregion

        #region Fields

        public static IMongoClient Client { get; set; }
        public static IMongoDatabase Database { get; set; }
        public static ILockableService LockableService { get; set; }

        public TestContext TestContext { get; set; }

        #endregion

        #region Startup/Cleanup

        [ClassInitialize]
        public static void ClassStartup(TestContext testContext)
        {
            Client = new MongoClient("mongodb://127.0.0.1:27017");
            Database = Client.GetDatabase("libraryapi-test");
            var lockRecordCollection = new MongoCollection<LockRecord>(Database);
            var lockablesCollection = new MongoCollection<Lockable>(Database);

            var lockRecordService = new LockRecordService(lockRecordCollection);

            LockableService = new LockableService(
                lockRecordService,
                lockablesCollection);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            Client.DropDatabase("libraryapi-test");
        }

        #endregion

        #region Tests

        [TestMethod]
        public async Task CreateTest()
        {
            var lockable = new Lockable
            {
                Categories = new[] { "blue", "purple" },
                CreatedOn = DateTime.Now,
                Data = new Customer
                {
                    FirstName = "Alex",
                    LastName = "Hayes",
                    Age = 23
                },
                Locks = new Lock[0],
                Name = "Customers"
            };

            var result = await LockableService.CreateAsync(lockable);

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task CreateManyTest()
        {
            var lockables = new[] {
                new Lockable
                {
                    Categories = new[] { "blue", "purple" },
                    CreatedOn = DateTime.Now,
                    Data = new Customer
                    {
                        FirstName = "Alex",
                        LastName = "Hayes",
                        Age = 23
                    },
                    Locks = new Lock[0],
                    Name = "Customers"
                },
                new Lockable
                {
                    Categories = new[] { "blue" },
                    CreatedOn = DateTime.Now,
                    Data = new Customer
                    {
                        FirstName = "Darth",
                        LastName = "Vader",
                        Age = 1000000
                    },
                    Locks = new Lock[0],
                    Name = "Customers"
                },
                new Lockable
                {
                    Categories = new[] { "purple" },
                    CreatedOn = DateTime.Now,
                    Data = new Customer
                    {
                        FirstName = "Davy",
                        LastName = "Jones",
                        Age = 500
                    },
                    Locks = new Lock[0],
                    Name = "Customers"
                }
            };

            var results = await LockableService.CreateManyAsync(lockables);

            Assert.IsNotNull(results);
            Assert.AreEqual(results.TotalCount, lockables.Length);
            Assert.IsTrue(results.Results.All(r => !String.IsNullOrEmpty(r.Id)));
        }

        [TestMethod]
        public async Task UpdateTest()
        {
            var lockables = await GenerateLockables(1);
            var lockable = lockables.First();

            var d = lockable.Data as Customer;
            var originalName = d.FirstName;
            d.FirstName += "-Test";

            var result = await LockableService.UpdateAsync(lockable);
            var md = result.Data as Customer;
            var modifiedName = md.FirstName;

            Assert.AreNotEqual(originalName, modifiedName);
        }

        [TestMethod]
        public async Task UpdateManyTest()
        {
            var lockables = await GenerateLockables(3);

            foreach (var lockable in lockables)
            {
                var d = lockable.Data as Customer;
                d.FirstName += "-Test";
            }

            var result = await LockableService.UpdateManyAsync(lockables);

            Assert.AreEqual(result.TotalCount, lockables.Count());
        }

        [TestMethod]
        public async Task RetrieveTest()
        {
            var lockable = await GenerateLockables(1)
                .ContinueWith(t => t.Result.First());

            var retrievedLockable = await LockableService
                .RetrieveAsync(l => l.Id, lockable.Id);

            Assert.AreEqual(lockable.Id, retrievedLockable.Id);
        }

        [TestMethod]
        public async Task DeleteTest()
        {
            var lockable = await GenerateLockables(1)
                .ContinueWith(t => t.Result.First());

            var result = await LockableService.DeleteAsync(lockable);

            Assert.IsTrue(result);
        }

        [TestMethod]
        public async Task DeleteManyTest()
        {
            var lockables = await GenerateLockables(3);

            var result = await LockableService.DeleteManyAsync(lockables);

            Assert.IsTrue(result);
        }

        [TestMethod]
        public async Task PaginateTest()
        {
            var lockables = await GenerateLockables(12);

            var firstResult = await LockableService.PaginateAsync(new Paginate<Lockable>
            {
                Limit = 4
            });
            Assert.IsNotNull(firstResult.Next);
            Assert.IsNull(firstResult.Previous);

            var secondResult = await LockableService.PaginateAsync(firstResult.Next);
            Assert.IsNotNull(secondResult.Next);
            Assert.IsNotNull(secondResult.Previous);

            var thirdResult = await LockableService.PaginateAsync(secondResult.Next);
            Assert.IsNotNull(thirdResult.Previous);
        }

        [TestMethod]
        public async Task LockTest()
        {
            var lockable = await GenerateLockables(1)
                .ContinueWith(t => t.Result.First());

            var @lock = new Lock
            {
                IsShared = false,
                MaxLeaseDate = DateTime.Now.AddHours(2),
                OwnerToken = "Alex Hayes"
            };

            var result = await LockableService.LockAsync(lockable, @lock);

            Assert.IsNotNull(result);
            Assert.IsFalse(String.IsNullOrEmpty(result.LockId));
            Assert.IsNotNull(result.Lockable);
        }

        [TestMethod]
        public async Task UnlockTest()
        {
            var lockable = await GenerateLockables(1)
                .ContinueWith(t => t.Result.First());

            var @lock = new Lock
            {
                IsShared = false,
                MaxLeaseDate = DateTime.Now.AddHours(2),
                OwnerToken = "Alex Hayes"
            };

            var result = await LockableService.LockAsync(lockable, @lock);

            // Verify the lockable was locked.
            Assert.IsTrue(result.Lockable.IsLocked());

            var unlockResult = await LockableService.UnlockAsync(
                result.Lockable,
                result.LockId);

            Assert.IsNotNull(unlockResult);
            Assert.IsNotNull(unlockResult.Lockable);
            Assert.IsNotNull(unlockResult.LockRecord);
        }

        [TestMethod]
        public async Task RetrieveLatestInCategoryTest()
        {
            var lockable = await GenerateLockables(9)
                .ContinueWith(t => t.Result.First());

            var categories = new[] { "blue", "purple" };

            var lockResult = await LockableService.RetrieveLatestInCategoryAsync(
                categories,
                false);

            var secondLockResult = await LockableService.RetrieveLatestInCategoryAsync(
                categories,
                true);

            var thirdLockResult = await LockableService.RetrieveLatestInCategoryAsync(
                categories,
                true);

            Assert.IsNotNull(lockResult.Lockable);
            Assert.IsFalse(String.IsNullOrEmpty(lockResult.LockId));

            CollectionAssert.AreEqual(
                categories,
                lockResult.Lockable.Categories.ToArray());

            Assert.IsNotNull(secondLockResult.Lockable);
            Assert.IsFalse(String.IsNullOrEmpty(secondLockResult.LockId));

            CollectionAssert.AreEqual(
                categories,
                secondLockResult.Lockable.Categories.ToArray());

            Assert.AreNotEqual(
                secondLockResult.Lockable.Id,
                lockResult.Lockable.Id);

            // Since the second and third lock requests are readonly they
            // should return the same lockable.
            Assert.AreEqual(
                secondLockResult.Lockable.Id,
                thirdLockResult.Lockable.Id);
        }

        #endregion

        #region Helper Methods

        private async Task<IEnumerable<Lockable>> GenerateLockables(int number)
        {
            var lockables = new List<Lockable>();

            for (var i = 0; i < number; i++)
            {
                var categories = i % 2 == 0
                    ? new[] { "blue", "purple" }
                    : new[] { "blue" };

                var customer = new Customer
                {
                    Age = i + 20,
                    FirstName = i % 2 == 0 ? "Bob" : "Tim",
                    LastName = i % 3 == 0 ? "Jones" : "Potter"
                };

                var lockable = new Lockable
                {
                    Categories = categories,
                    CreatedOn = DateTime.Now,
                    Data = customer,
                    Name = "Customer",
                    Locks = new Lock[0]
                };

                lockables.Add(lockable);
            }

            var results = await LockableService.CreateManyAsync(lockables);

            return results.Results;
        }

        #endregion
    }
}
