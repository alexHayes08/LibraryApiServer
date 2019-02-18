using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Pagination;
using LibraryServerApi.Models.RandomData;
using LibraryServerApi.Service;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MongoDB.Driver;

namespace LibraryServerApi.Tests.Services
{
    [TestClass]
    public class RandomDataServiceTest
    {
        #region Nested Class

        public class Address
        {
            public string Address1 { get; set; }
            public string Address2 { get; set; }
            public string ZipCode { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string StateProvince { get; set; }
            public string Country { get; set; }
        }

        #endregion

        #region Fields

        public static IMongoClient Client { get; set; }
        public static IMongoDatabase Database { get; set; }
        public static IRandomDataService RandomDataService { get; set; }

        public TestContext TestContext { get; set; }

        #endregion

        #region Setup/Cleanup

        [ClassInitialize]
        public static void ClassSetup(TestContext testContext)
        {
            Client = new MongoClient("mongodb://127.0.0.1:27017");
            Database = Client.GetDatabase("libraryapi-test");
            var randomDataCollection = new MongoCollection<RandomDataCollection>(Database);

            RandomDataService = new RandomDataService(randomDataCollection);
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
            var collection = await GenerateRandomDataItems(6, true);

            Assert.IsNotNull(collection);
        }

        [TestMethod]
        public async Task CreateManyTest()
        {
            var collections = new List<RandomDataCollection>();
            var rnd = new Random();

            for (var i = 0; i < 3; i++)
            {
                collections.Add(
                    await GenerateRandomDataItems(
                        rnd.Next(0, 9),
                        false));
            }

            var result = await RandomDataService.CreateManyAsync(collections);

            Assert.AreEqual(result.TotalCount, collections.Count);
        }

        [TestMethod]
        public async Task RetrieveTest()
        {
            var rd = await GenerateRandomDataItems(6, true);
            var retrievedRd = await RandomDataService.RetrieveAsync(r => r.Id, rd.Id);

            Assert.AreEqual(rd.Id, retrievedRd.Id);
        }

        [TestMethod]
        public async Task UpdateAsyncTest()
        {
            var rd = await GenerateRandomDataItems(6, true);

            rd.Group += "-Test";
            var result = await RandomDataService.UpdateAsync(rd);

            Assert.IsTrue(result.Group.EndsWith("-Test"));
        }

        [TestMethod]
        public async Task UpdateManyAsyncTest()
        {
            var collections = new List<RandomDataCollection>();

            for (var i = 0; i < 3; i++)
            {
                var collection = await GenerateRandomDataItems(6, true);
                collections.Add(collection);
            }

            foreach (var collection in collections)
            {
                collection.Group += "-Test";
            }

            var result = await RandomDataService.UpdateManyAsync(collections);

            Assert.AreEqual(result.TotalCount, collections.Count);
        }

        [TestMethod]
        public async Task DeleteAsyncTest()
        {
            var collection = await GenerateRandomDataItems(6, true);

            var result = await RandomDataService.DeleteAsync(collection);

            Assert.IsTrue(result);
        }

        [TestMethod]
        public async Task DeleteManyAsyncTest()
        {
            var collections = new List<RandomDataCollection>();

            for (var i = 0; i < 3; i++)
            {
                var collection = await GenerateRandomDataItems(6, true);
                collections.Add(collection);
            }

            var result = await RandomDataService.DeleteManyAsync(collections);

            Assert.IsTrue(result);
        }

        [TestMethod]
        public async Task PaginateAsyncTest()
        {
            var collections = new List<RandomDataCollection>();

            for (var i = 0; i < 12; i++)
            {
                var collection = await GenerateRandomDataItems(6, true);
                collections.Add(collection);
            }

            var firstResult = await RandomDataService.PaginateAsync(
                new Paginate<RandomDataCollection>
                {
                    Limit = 4
                });
            Assert.IsNotNull(firstResult.Next);
            Assert.IsNull(firstResult.Previous);

            var secondResult = await RandomDataService.PaginateAsync(firstResult.Next);
            Assert.IsNotNull(secondResult.Next);
            Assert.IsNotNull(secondResult.Previous);

            var thirdResult = await RandomDataService.PaginateAsync(secondResult.Next);
            Assert.IsNotNull(thirdResult.Previous);
        }

        [TestMethod]
        public async Task GetRandomDataItemAsyncTest()
        {
            var group = "Address";
            var collections = await GenerateRandomDataItems(6, true);
            var firstRndData = await RandomDataService.GetRandomDataItemAsync(group);
            var secondRndData = await RandomDataService.GetRandomDataItemAsync(group);
            var thirdRndData = await RandomDataService.GetRandomDataItemAsync(group);

            Assert.AreNotEqual(
                firstRndData.Id,
                secondRndData.Id,
                thirdRndData.Id);

            Assert.IsTrue(
                (new[] { firstRndData, secondRndData, thirdRndData })
                    .All(i => i.UsedRecently == true));
        }

        #endregion

        #region Helper Methods

        private async Task<RandomDataCollection> GenerateRandomDataItems(
            int number,
            bool save)
        {
            var collection = new RandomDataCollection
            {
                Group = "Address"
            };

            for (var i = 0; i < number; i++)
            {
                var isOf2 = i % 2 == 0;
                var isOf3 = i % 3 == 0;

                var randomData = new RandomDataItem
                {
                    UsedRecently = false,
                    Data = new Address
                    {
                        Address1 = isOf2 ? "Make Believe Ln." : "Other address",
                        Address2 = isOf3 ? "Suite B" : null,
                        Country = "United States",
                        FirstName = isOf2 ? "Tim" : "Bob",
                        LastName = isOf3 ? "Jones" : "Sparrow",
                        StateProvince = "Wisconsin",
                        ZipCode = "53186"
                    }
                };

                collection.Items.Add(randomData);
            }

            if (save)
                await RandomDataService.CreateAsync(collection);

            return collection;
        }

        #endregion
    }
}
