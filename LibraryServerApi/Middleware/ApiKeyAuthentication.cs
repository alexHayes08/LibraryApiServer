using System.Threading.Tasks;
using LibraryServerApi.Service;
using Microsoft.AspNetCore.Http;

namespace LibraryServerApi.Middleware
{
    public class ApiKeyAuthentication
    {
        private readonly RequestDelegate requestDelegate;
        private readonly IApiKeyService apiKeyService;

        public ApiKeyAuthentication(RequestDelegate requestDelegate,
            IApiKeyService apiKeyService)
        {
            this.requestDelegate = requestDelegate;
            this.apiKeyService = apiKeyService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments(new PathString("/api")))
            {
                string apiKey = null;

                if (context.Request.Query.TryGetValue("key", out var _apiKey))
                    apiKey = _apiKey;

                var validationResponse = await apiKeyService.IsValidKeyAsync(apiKey);

                if (!validationResponse.IsValid)
                    await InvalidApiKey(context, validationResponse.Reason);
                else
                    await requestDelegate(context);
            }
            else
            {
                // Only require key authentication for paths that start with
                // api.
                await requestDelegate(context);
            }
        }

        private async Task InvalidApiKey(HttpContext context, string message)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync(message);
        }
    }
}
