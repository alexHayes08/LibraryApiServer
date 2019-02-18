using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using LibraryServerApi.Extensions;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Pagination;
using MongoDB.Driver;

namespace LibraryServerApi.Service
{
    /// <summary>
    /// Default implementation of the ICrudPlusPattern{T}.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <seealso cref="LibraryServerApi.Service.ICrudPlusPattern{T}" />
    public class CrudPlusPattern<T> : ICrudPlusPattern<T> where T : BaseEntity
    {
        #region Fields

        protected readonly IMongoCollection<T> collection;

        #endregion

        #region Constructor

        /// <summary>
        /// Initializes a new instance of the <see cref="CrudPlusPattern{T}"/> class.
        /// </summary>
        /// <param name="configuration">The configuration.</param>
        /// <param name="collectionName">The name of the collection.</param>
        public CrudPlusPattern(IMongoCollection<T> collection)
        {
            this.collection = collection;
        }

        #endregion

        #region Methods

        public virtual async Task<T> CreateAsync(T model,
            CancellationToken? cancellationToken = null)
        {
            if (model == null)
                throw new ArgumentNullException(nameof(model));

            await collection.InsertOneAsync(
                document: model,
                cancellationToken: cancellationToken.GetValueOrDefault());

            return model;
        }

        public virtual async Task<PaginationResults<T>> CreateManyAsync(
            IEnumerable<T> models,
            CancellationToken? cancellationToken = null)
        {
            if (models == null)
                throw new ArgumentNullException(nameof(models));

            await collection.InsertManyAsync(
                documents: models,
                cancellationToken: cancellationToken.GetValueOrDefault());

            return new PaginationResults<T>(models, totalCount: models.Count());
        }

        public virtual async Task<bool> DeleteAsync(T model,
            CancellationToken? cancellationToken = null)
        {
            if (model == null)
                throw new ArgumentNullException(nameof(model));

            var filter = new ExpressionFilterDefinition<T>(
                doc => doc.Id == model.Id);

            var result = await collection.DeleteOneAsync(
                filter: filter,
                cancellationToken: cancellationToken.GetValueOrDefault());

            return result.DeletedCount == 1;
        }

        public virtual async Task<bool> DeleteManyAsync(IEnumerable<T> models,
            CancellationToken? cancellationToken = null)
        {
            if (models == null)
                throw new ArgumentNullException(nameof(models));

            var ids = models.Select(m => m.Id);
            var filter = new ExpressionFilterDefinition<T>(
                doc => ids.Contains(doc.Id));

            var result = await collection.DeleteManyAsync(
                filter: filter,
                cancellationToken: cancellationToken.GetValueOrDefault());

            return result.DeletedCount == models.Count();
        }

        public virtual async Task<PaginationResults<T>> PaginateAsync(
            Paginate<T> data,
            CancellationToken? cancellationToken = null)
        {
            if (data == null)
                throw new ArgumentNullException(nameof(data));

            var query = collection.Find(data.Filter ?? FilterDefinition<T>.Empty);

            if (data.OrderBy != null)
                query = query.Sort(data.OrderBy);

            var totalCount = await query.CountDocumentsAsync(
                cancellationToken.GetValueOrDefault());

            var resultCursor = await query
                .Skip(data.Skip)
                .Limit(data.Limit)
                .ToListAsync(cancellationToken.GetValueOrDefault());

            var result = resultCursor.ToList();
            var hasNext = totalCount > (data.Skip + result.Count);
            var hasPrev = data.Skip > 0;
            var next = default(Paginate<T>);
            var previous = default(Paginate<T>);

            if (hasNext)
            {
                next = new Paginate<T>
                {
                    Filter = data.Filter,
                    Limit = data.Limit,
                    OrderBy = data.OrderBy,
                    Skip = data.Skip + result.Count
                };
            }

            if (hasPrev)
            {
                previous = new Paginate<T>
                {
                    Filter = data.Filter,
                    Limit = data.Limit,
                    OrderBy = data.OrderBy,
                    Skip = Math.Max(data.Skip - result.Count, 0)
                };
            }

            return new PaginationResults<T>(result,
                next,
                previous,
                totalCount);
        }

        public virtual IQueryable<T> Query()
        {
            return collection.AsQueryable();
        }

        public virtual async Task<T> RetrieveAsync<V>(
            Expression<Func<T, V>> field,
            V value,
            CancellationToken? cancellationToken = null)
        {
            if (field == null)
                throw new ArgumentNullException(nameof(field));

            var filterBuilder = new FilterDefinitionBuilder<T>();
            var name = ExpressionExtensions.GetNameFromLambdaExpression(field); //field.GetNameFromExpression<T, V>(field);
            var filter = filterBuilder.Eq(name, value);
            var result = await collection
                .Find(filter)
                .FirstOrDefaultAsync(cancellationToken.GetValueOrDefault());

            return result;
        }

        public virtual async Task<T> RetrieveAsync(string fieldName,
            object value,
            CancellationToken? cancellationToken = null)
        {
            if (String.IsNullOrEmpty(fieldName))
                throw new ArgumentNullException(nameof(fieldName));

            var filterBuilder = new FilterDefinitionBuilder<T>();
            var filter = filterBuilder.Eq(fieldName, value);
            var result = await collection
                .Find(filter)
                .FirstOrDefaultAsync(cancellationToken.GetValueOrDefault());

            return result;
        }

        public virtual async Task<T> UpdateAsync(T model,
            CancellationToken? cancellationToken = null)
        {
            if (model == null)
                throw new ArgumentNullException(nameof(model));

            var updateBuilder = new UpdateDefinitionBuilder<T>();

            var result = await collection.ReplaceOneAsync(
                filter:  doc => doc.Id == model.Id,
                replacement:  model,
                cancellationToken: cancellationToken.GetValueOrDefault());

            if (!result.IsAcknowledged)
                throw new MongoException("Failed to update the model.");

            return model;
        }

        public virtual async Task<PaginationResults<T>> UpdateManyAsync(
            IEnumerable<T> models,
            CancellationToken? cancellationToken = null)
        {
            if (models == null)
                throw new ArgumentNullException(nameof(models));

            foreach (var model in models)
                await UpdateAsync(model, cancellationToken.GetValueOrDefault());

            return new PaginationResults<T>(models, totalCount: models.Count());
        }

        #endregion
    }
}
