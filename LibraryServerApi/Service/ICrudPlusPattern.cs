using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Pagination;

namespace LibraryServerApi.Service
{
    public interface ICrudPlusPattern<T> where T : BaseEntity
    {
        /// <summary>
        /// Creates the specified model.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<T> CreateAsync(T model, CancellationToken? cancellationToken = null);

        /// <summary>
        /// Bulk version of Create.
        /// </summary>
        /// <param name="models">The models.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<PaginationResults<T>> CreateManyAsync(IEnumerable<T> models,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Retrieves the specified field.
        /// </summary>
        /// <typeparam name="V"></typeparam>
        /// <param name="field">The field.</param>
        /// <param name="value">The value.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<T> RetrieveAsync<V>(Expression<Func<T, V>> field,
            V value,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Retrieves the specified field name.
        /// </summary>
        /// <param name="fieldName">Name of the field.</param>
        /// <param name="value">The value.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<T> RetrieveAsync(string fieldName,
            object value,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Updates the specified model.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<T> UpdateAsync(T model, CancellationToken? cancellationToken = null);

        /// <summary>
        /// Updates the many.
        /// </summary>
        /// <param name="models">The models.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<PaginationResults<T>> UpdateManyAsync(IEnumerable<T> models,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Deletes the specified model.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<bool> DeleteAsync(T model,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Deletes the many.
        /// </summary>
        /// <param name="models">The models.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<bool> DeleteManyAsync(IEnumerable<T> models,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Paginates the specified data.
        /// </summary>
        /// <param name="data">The data.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<PaginationResults<T>> PaginateAsync(Paginate<T> data,
            CancellationToken? cancellationToken = null);

        /// <summary>
        /// Queries this instance.
        /// </summary>
        /// <returns></returns>
        IQueryable<T> Query();
    }
}
