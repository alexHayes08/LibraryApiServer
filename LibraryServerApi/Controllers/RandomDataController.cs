using System.Collections.Generic;
using System.Threading.Tasks;
using LibraryServerApi.Models;
using LibraryServerApi.Models.Pagination;
using LibraryServerApi.Models.RandomData;
using LibraryServerApi.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace LibraryServerApi.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class RandomDataController : ControllerBase
    {
        #region Fields

        private readonly IRandomDataService randomDataService;

        #endregion

        #region Constructor

        public RandomDataController(IConfiguration configuration,
            IRandomDataService randomDataService)
        {
            this.randomDataService = randomDataService;
        }

        #endregion

        #region Methods

        [HttpPost]
        public async Task<ActionResult<RandomDataCollection>> Create(
            [FromBody]BaseRequest<RandomDataCollection> randomDataCollection)
        {
            var result = await randomDataService.CreateAsync(randomDataCollection.Data);

            return result;
        }

        [HttpPost]
        public async Task<ActionResult<PaginationResults<RandomDataCollection>>> CreateMany(
            [FromBody]BaseRequest<IEnumerable<RandomDataCollection>> randomDataCollection)
        {
            var result = await randomDataService.CreateManyAsync(randomDataCollection.Data);

            return result;
        }

        [HttpPut]
        public async Task<ActionResult<RandomDataCollection>> Update(
            [FromBody]BaseRequest<RandomDataCollection> randomDataCollection)
        {
            var result = await randomDataService.UpdateAsync(randomDataCollection.Data);

            return result;
        }

        [HttpPut]
        public async Task<ActionResult<PaginationResults<RandomDataCollection>>> UpdateMany(
            [FromBody]BaseRequest<IEnumerable<RandomDataCollection>> randomDataCollection)
        {
            var result = await randomDataService.UpdateManyAsync(randomDataCollection.Data);

            return result;
        }

        [HttpDelete]
        public async Task<ActionResult<bool>> Delete(
            [FromBody]BaseRequest<RandomDataCollection> randomDataCollection)
        {
            var result = await randomDataService.DeleteAsync(randomDataCollection.Data);

            return result;
        }

        [HttpDelete]
        public async Task<ActionResult<bool>> DeleteMany(
            [FromBody]BaseRequest<IEnumerable<RandomDataCollection>> randomDataCollection)
        {
            var result = await randomDataService.DeleteManyAsync(randomDataCollection.Data);

            return result;
        }

        [HttpPost]
        public async Task<ActionResult<PaginationResults<RandomDataCollection>>> Paginate(
            [FromBody]BaseRequest<Paginate<RandomDataCollection>> paginate)
        {
            var result = await randomDataService.PaginateAsync(paginate.Data);

            return result;
        }

        #endregion
    }
}
