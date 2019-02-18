using System.Threading.Tasks;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Lock;
using LibraryServerApi.Models.Pagination;
using LibraryServerApi.Service;
using Microsoft.AspNetCore.Mvc;

namespace LibraryServerApi.Controllers
{
    /// <summary>
    /// Controller responsible for managing <c>LockRecord</c>s.
    /// </summary>
    /// <seealso cref="Microsoft.AspNetCore.Mvc.ControllerBase" />
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class LockRecordController : ControllerBase
    {
        #region Fields

        private readonly ILockRecordService lockRecordService;

        #endregion

        #region Constructor

        /// <summary>
        /// Initializes a new instance of the <see cref="LockRecordController"/> class.
        /// </summary>
        /// <param name="lockRecordService">The lock record service.</param>
        public LockRecordController(ILockRecordService lockRecordService)
        {
            this.lockRecordService = lockRecordService;
        }

        #endregion

        #region Methods

        /// <summary>
        /// Retrieves the specified identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<LockRecord>> Retrieve(
            [FromBody]BaseRequest<string> id)
        {
            var lockRecord = await lockRecordService.RetrieveAsync(
                l => l.Id,
                id.Data);

            if (lockRecord == null)
                return NotFound();
            else
                return lockRecord;
        }

        /// <summary>
        /// Paginates the <c>LockRecord</c>s.
        /// </summary>
        /// <param name="paginate">The paginate.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<PaginationResults<LockRecord>>> Paginate(
            [FromBody]BaseRequest<Paginate<LockRecord>> paginate)
        {
            var results = await lockRecordService.PaginateAsync(paginate.Data);

            return results;
        }

        #endregion
    }
}
