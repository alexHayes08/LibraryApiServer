using Microsoft.AspNetCore.Mvc;

namespace LibraryServerApi.Controllers
{
    [Route("api/[action]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        /// <summary>
        /// Gets the version of this instance.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult Version()
        {
            var versionStr = GetType().Assembly.GetName().Version;
            return new JsonResult(versionStr);
        }
    }
}
