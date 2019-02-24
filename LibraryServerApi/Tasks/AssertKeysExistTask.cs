using LibraryServerApi.Service;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LibraryServerApi.Tasks
{
    public class AssertKeysExistTask : IHostedService
    {
        #region Fields

        private readonly IApiKeyService apiKeyService;

        #endregion

        #region Constructor

        public AssertKeysExistTask(IApiKeyService apiKeyService)
        {
            this.apiKeyService = apiKeyService;
        }

        #endregion

        #region Methods

        public Task StartAsync(CancellationToken cancellationToken)
        {
            if (!apiKeyService.Query().Any())
                apiKeyService.GenerateNewKey();

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        #endregion
    }
}
