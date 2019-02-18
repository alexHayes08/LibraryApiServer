using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Lockable;
using LibraryServerApi.Models.Pagination;
using LibraryServerApi.Service;
using Microsoft.AspNetCore.Mvc;

namespace LibraryServerApi.Controllers
{
    /// <summary>
    /// Controller for managing <c>Lockable</c>s.
    /// </summary>
    /// <seealso cref="Microsoft.AspNetCore.Mvc.ControllerBase" />
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class LockableController : ControllerBase
    {
        #region Fields

        private readonly ILockableService lockablesService;

        #endregion

        #region Constructor

        /// <summary>
        /// Initializes a new instance of the <see cref="LockableController"/> class.
        /// </summary>
        /// <param name="lockablesService">The lockables service.</param>
        public LockableController(ILockableService lockablesService)
        {
            this.lockablesService = lockablesService;
        }

        #endregion

        #region Methods

        /// <summary>
        /// Creates the specified lockable.
        /// </summary>
        /// <param name="lockable">The lockable.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<Lockable>> Create(
            [FromBody]BaseRequest<Lockable> lockable)
        {
            var createdLockable = await lockablesService.CreateAsync(lockable.Data);

            return createdLockable;
        }

        /// <summary>
        /// Bulk version of create.
        /// </summary>
        /// <param name="lockables">The lockables.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<PaginationResults<Lockable>>> CreateMany(
            [FromBody]BaseRequest<IEnumerable<Lockable>> lockables)
        {
            var results = await lockablesService.CreateManyAsync(lockables.Data);

            return results;
        }

        /// <summary>
        /// Retrieves the specified identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<Lockable>> Retrieve(
            [FromQuery]BaseRequest<string> id)
        {
            var result = await lockablesService.RetrieveAsync(l => l.Id, id.Data);

            if (result == null)
                return NotFound();
            else
                return result;
        }

        /// <summary>
        /// Updates the specified lockable.
        /// </summary>
        /// <param name="lockable">The lockable.</param>
        /// <returns></returns>
        [HttpPut]
        public async Task<ActionResult<Lockable>> Update(
            [FromBody]BaseRequest<Lockable> lockable)
        {
            var result = await lockablesService.UpdateAsync(lockable.Data);

            return result;
        }

        /// <summary>
        /// Updates the many.
        /// </summary>
        /// <param name="lockables">The lockables.</param>
        /// <returns></returns>
        [HttpPut]
        public async Task<ActionResult<PaginationResults<Lockable>>> UpdateMany(
            [FromBody]BaseRequest<IEnumerable<Lockable>> lockables)
        {
            var result = await lockablesService.UpdateManyAsync(lockables.Data);

            return result;
        }

        /// <summary>
        /// Deletes the specified identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<ActionResult<bool>> Delete(
            [FromBody]BaseRequest<string> id)
        {
            var lockable = await lockablesService.RetrieveAsync(l => l.Id, id.Data);

            if (lockable == null)
                return NotFound();

            var result = await lockablesService.DeleteAsync(lockable);

            return result;
        }

        /// <summary>
        /// Deletes the many.
        /// </summary>
        /// <param name="ids">The ids.</param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<ActionResult<bool>> DeleteMany(
            [FromBody]BaseRequest<IEnumerable<string>> ids)
        {
            var lockables = lockablesService
                .Query()
                .Where(l => ids.Data.Contains(l.Id))
                .ToList();

            if (!lockables.Any())
                return NotFound();

            var result = await lockablesService.DeleteManyAsync(lockables);

            return result;
        }

        /// <summary>
        /// Paginates.
        /// </summary>
        /// <param name="paginate">The paginate.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<PaginationResults<Lockable>>> Paginate(
            [FromBody]BaseRequest<Paginate<Lockable>> paginate)
        {
            var result = await lockablesService.PaginateAsync(paginate.Data);

            return result;
        }

        /// <summary>
        /// Retrieves a lockable that has read only locks or no locks.
        /// </summary>
        /// <param name="categories">The categories.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<LockResponse>> RetrieveReadOnly(
            [FromBody]BaseRequest<IEnumerable<string>> categories)
        {
            var result = await lockablesService.RetrieveLatestInCategoryAsync(
                categories.Data,
                true);

            if (result == null)
                return NotFound();
            else
                return result;
        }

        /// <summary>
        /// Retrieves a lockable that has no locks on it.
        /// </summary>
        /// <param name="categories">The categories.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<LockResponse>> RetrieveReadWrite(
            [FromBody]BaseRequest<IEnumerable<string>> categories)
        {
            var result = await lockablesService.RetrieveLatestInCategoryAsync(
                categories.Data,
                false);

            if (result == null)
                return NotFound();
            else
                return result;
        }

        /// <summary>
        /// Locks the specified lockable.
        /// </summary>
        /// <param name="lockRequest">The lock request.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<LockResponse>> Lock(
            [FromBody]BaseRequest<LockRequest> lockRequest)
        {
            var lockable = await lockablesService.RetrieveAsync(
                l => l.Id,
                lockRequest.Data.LockableId);

            var result = await lockablesService.LockAsync(
                lockable,
                lockRequest.Data.Lock);

            return result;
        }

        /// <summary>
        /// Unlocks a lockable.
        /// </summary>
        /// <param name="unlockRequest">The unlock request.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<UnlockResponse>> Unlock(
            [FromBody]BaseRequest<UnlockRequest> unlockRequest)
        {
            var lockable = await lockablesService.RetrieveAsync(
                l => l.Id,
                unlockRequest.Data.LockableId);

            if (lockable == null)
                return NotFound();

            var result = await lockablesService.UnlockAsync(
                lockable,
                unlockRequest.Data.LockId);

            return result;
        }
        
        #endregion
    }
}