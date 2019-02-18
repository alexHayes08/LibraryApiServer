using System.Threading.Tasks;
using LibraryServerApi.Models.ApiKey;
using MongoDB.Driver;

namespace LibraryServerApi.Service
{
    public class ApiKeyService : CrudPlusPattern<ApiKeyModel>, IApiKeyService
    {
        #region Constructor

        public ApiKeyService(IMongoCollection<ApiKeyModel> apiKeyCollection)
            : base(apiKeyCollection)
        { }

        #endregion

        #region Methods

        public async Task<ApiKeyValidationResponse> IsValidKeyAsync(string key)
        {
            var response = new ApiKeyValidationResponse();

            if (string.IsNullOrEmpty(key))
            {
                response.Reason = "Key is required.";
                return response;
            }

            var keyRecord = await RetrieveAsync(k => k.Key, key);

            if (keyRecord == null)
                response.Reason = "Invalid key.";
            else if (keyRecord.IsExpired())
                response.Reason = "Key expired.";
            else
                response.IsValid = true;

            return response;
        }

        #endregion
    }
}
