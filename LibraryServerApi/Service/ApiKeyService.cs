using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using LibraryServerApi.Models.ApiKey;
using LibraryServerApi.Models.Pagination;
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

        public override Task<ApiKeyModel> CreateAsync(ApiKeyModel model, CancellationToken? cancellationToken = null)
        {
            model.Created = DateTime.Now;

            return base.CreateAsync(model, cancellationToken);
        }

        public override Task<PaginationResults<ApiKeyModel>> CreateManyAsync(IEnumerable<ApiKeyModel> models, CancellationToken? cancellationToken = null)
        {
            foreach (var model in models)
            {
                model.Created = DateTime.Now;

                if (model.Expires == default(DateTime))
                    model.Expires = DateTime.Now.AddYears(1);
            }

            return base.CreateManyAsync(models, cancellationToken);
        }

        #endregion
    }
}
