using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using LibraryServerApi.Models.ApiKey;
using MongoDB.Driver;

namespace LibraryServerApi.Service
{
    public class ApiKeyService : CrudPlusPattern<ApiKeyModel>, IApiKeyService
    {
        #region Fields

        private readonly RNGCryptoServiceProvider rngCryptoServiceProvider;
        private readonly Random random;

        #endregion

        #region Constructor

        public ApiKeyService(IMongoCollection<ApiKeyModel> apiKeyCollection)
            : base(apiKeyCollection)
        {
            rngCryptoServiceProvider = new RNGCryptoServiceProvider();
            random = new Random();
        }

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

        public Task<ApiKeyModel> GenerateNewKey()
        {
            var bytes = new byte[random.Next(48, 60)];
            rngCryptoServiceProvider.GetBytes(bytes);

            var model = new ApiKeyModel
            {
                Key = Convert.ToBase64String(bytes),
                Expires = DateTime.Now.AddYears(1)
            };

            return CreateAsync(model);
        }

        #endregion
    }
}
