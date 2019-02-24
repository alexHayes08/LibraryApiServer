using System.Threading.Tasks;
using LibraryServerApi.Models.ApiKey;

namespace LibraryServerApi.Service
{
    /// <summary>
    /// Manages api keys.
    /// </summary>
    public interface IApiKeyService : ICrudPlusPattern<ApiKeyModel>
    {
        /// <summary>
        /// Determines whether the key is valid (it exists and isn't expired).
        /// </summary>
        /// <param name="key">The key.</param>
        /// <returns></returns>
        Task<ApiKeyValidationResponse> IsValidKeyAsync(string key);

        /// <summary>
        /// Generates a new key.
        /// </summary>
        /// <returns></returns>
        Task<ApiKeyModel> GenerateNewKey();
    }
}