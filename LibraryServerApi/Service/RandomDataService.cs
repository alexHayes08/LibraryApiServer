using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LibraryServerApi.Models.Pagination;
using LibraryServerApi.Models.RandomData;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LibraryServerApi.Service
{
    public class RandomDataService : CrudPlusPattern<RandomDataCollection>,
        IRandomDataService
    {
        #region Constructor

        public RandomDataService(
            IMongoCollection<RandomDataCollection> mongoCollection)
            : base(mongoCollection)
        { }

        #endregion

        #region Methods

        public async Task<RandomDataItem> GetRandomDataItemAsync(string groupName)
        {
            var group = Query()
                .Where(l => l.Group == groupName)
                .FirstOrDefault();

            if (group == null)
                return null;
            else if (!group.Items.Any())
                return null;

            // Retrieve all items that haven't been used recently.
            var validItems = group.Items
                .Where(i => !i.UsedRecently)
                .ToList();

            // Select a random one.
            var rndIndex = new Random().Next(0, validItems.Count);
            var item = group.Items.ElementAt(rndIndex);

            if (item == null)
                return null;

            // Mark item as used recently.
            item.UsedRecently = true;
            await UpdateAsync(group);

            // Verify some items haven't been used recently.
            await ValidateItemsOfCollection(group);

            return item;
        }

        public override Task<RandomDataCollection> CreateAsync(
            RandomDataCollection model,
            CancellationToken? cancellationToken = null)
        {
            ValidateItemIds(model);

            return base.CreateAsync(model, cancellationToken);
        }

        public override Task<PaginationResults<RandomDataCollection>> CreateManyAsync(
            IEnumerable<RandomDataCollection> models,
            CancellationToken? cancellationToken = null)
        {
            foreach (var model in models)
                ValidateItemIds(model);

            return base.CreateManyAsync(models, cancellationToken);
        }

        public override Task<RandomDataCollection> UpdateAsync(
            RandomDataCollection model,
            CancellationToken? cancellationToken = null)
        {
            ValidateItemIds(model);

            return base.UpdateAsync(model, cancellationToken);
        }

        public override Task<PaginationResults<RandomDataCollection>> UpdateManyAsync(
            IEnumerable<RandomDataCollection> models,
            CancellationToken? cancellationToken = null)
        {
            foreach (var model in models)
                ValidateItemIds(model);

            return base.UpdateManyAsync(models, cancellationToken);
        }

        //public async Task<RandomDataItem> CreateOfCollection(
        //    string groupName,
        //    RandomDataItem model,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (model == null)
        //        throw new ArgumentNullException(nameof(model));

        //    var group = await GetCollection(groupName);

        //    if (group == null)
        //        return null;

        //    group.Items.Add(model);
        //    await Update(group, cancellationToken);

        //    return model;
        //}

        //public async Task<PaginationResults<RandomDataItem>> CreateManyOfCollection(
        //    string groupName,
        //    IEnumerable<RandomDataItem> models,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (models == null)
        //        throw new ArgumentNullException(nameof(models));

        //    var group = await GetCollection(groupName);

        //    if (group == null)
        //        return null;

        //    foreach (var model in models)
        //        group.Items.Add(model);

        //    await Update(group);

        //    return new PaginationResults<RandomDataItem>(models);
        //}

        //public async Task<bool> DeleteOfCollection(
        //    string groupName,
        //    RandomDataItem model,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (model == null)
        //        throw new ArgumentNullException(nameof(model));

        //    var group = await GetCollection(groupName);

        //    if (group == null)
        //        return false;

        //    var removed = group.Items.Remove(model);

        //    if (!removed)
        //        return false;

        //    await Update(group);

        //    return true;
        //}

        //public async Task<bool> DeleteManyOfCollection(string groupName,
        //    IEnumerable<RandomDataItem> models,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (models == null)
        //        throw new ArgumentNullException(nameof(models));

        //    var group = await GetCollection(groupName);

        //    if (group == null)
        //        return false;

        //    foreach (var model in models)
        //    {
        //        var removed = group.Items.Remove(model);

        //        if (!removed)
        //            return false;
        //    }

        //    await Update(group);

        //    return true;
        //}

        //public Task<PaginationResults<RandomDataItem>> PaginateOfCollection(
        //    string groupName,
        //    Paginate<RandomDataItem> data,
        //    CancellationToken? cancellationToken = null)
        //{
        //    throw new NotImplementedException();
        //}

        //public async Task<IQueryable<RandomDataItem>> QueryOfCollection(string groupName)
        //{
        //    var group = await GetCollection(groupName);

        //    return group?.Items.AsQueryable();
        //}

        //public async Task<RandomDataItem> RetrieveOfCollection<V>(
        //    string groupName,
        //    Expression<Func<RandomDataItem, V>> field,
        //    V value,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (field == null)
        //        throw new ArgumentNullException(nameof(field));

        //    var group = await GetCollection(groupName);

        //    if (group == null)
        //        return null;

        //    var compiledExpression = field.Compile();

        //    var item = group.Items
        //        .FirstOrDefault(i => compiledExpression(i).Equals(value));

        //    return item;
        //}

        //public async Task<RandomDataItem> UpdateOfCollection(string groupName,
        //    RandomDataItem model,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (model == null)
        //        throw new ArgumentNullException(nameof(model));

        //    var group = await GetCollection(groupName);

        //    if (group == null)
        //        return null;

        //    var item = group.Items
        //        .Select((i, idx) => new { Item = i, Index = idx })
        //        .FirstOrDefault();

        //    if (item == null)
        //        return null;



        //    var result = await collection.ReplaceOneAsync(
        //        filter: doc => doc.Id == model.Id,
        //        replacement: model,
        //        cancellationToken: cancellationToken.GetValueOrDefault());

        //    if (!result.IsAcknowledged)
        //        throw new MongoException("Failed to update the model.");

        //    return model;
        //}

        //public async Task<PaginationResults<RandomDataItem>> UpdateManyOfCollection(
        //    string groupName,
        //    IEnumerable<RandomDataItem> models,
        //    CancellationToken? cancellationToken = null)
        //{
        //    if (models != null)
        //        throw new ArgumentNullException(nameof(models));

        //    foreach (var model in models)
        //        await Update(model, cancellationToken);

        //    return new PaginationResults<T>(models);
        //}

        private void ValidateItemIds(RandomDataCollection model)
        {
            foreach (var item in model.Items)
            {
                if (String.IsNullOrEmpty(item.Id))
                    item.Id = ObjectId.GenerateNewId().ToString();
            }
        }

        private async Task ValidateItemsOfCollection(
            RandomDataCollection collection)
        {
            if (!collection.Items.Any(i => !i.UsedRecently))
            {
                foreach (var item in collection.Items)
                    item.UsedRecently = false;

                await UpdateAsync(collection);
            }
        }

        private async Task<RandomDataCollection> GetCollection(string groupName)
        {
            return await collection
                .Find(g => g.Group == groupName)
                .FirstOrDefaultAsync();
        }

        #endregion
    }
}
