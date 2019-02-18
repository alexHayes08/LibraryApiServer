using LibraryServerApi.Middleware;
using Microsoft.AspNetCore.Builder;

namespace LibraryServerApi.Extensions
{
    public static class ApiKeyAuthenticationExtensions
    {
        public static IApplicationBuilder UseApiKeyAuthentication(
            this IApplicationBuilder applicationBuilder)
        {
            return applicationBuilder.UseMiddleware<ApiKeyAuthentication>();
        }
    }
}
