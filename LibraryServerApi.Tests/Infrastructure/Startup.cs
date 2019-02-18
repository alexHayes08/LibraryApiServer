using System;
using LibraryServerApi.Models;
using LibraryServerApi.Service;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace LibraryServerApi.Tests.Infrastructure
{
    public class Startup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var serviceProvider = services.BuildServiceProvider();

            services.AddTransient(sp =>
            {
                var hostingEnvironment = sp.GetRequiredService<IHostingEnvironment>();
                var configuration = sp.GetRequiredService<IConfiguration>();

                var connectionStringKey = hostingEnvironment.IsDevelopment()
                ? "development"
                : "production";

                var connectionString = configuration
                    .GetConnectionString(connectionStringKey);

                var client = new MongoClient(connectionString);
                var db = client.GetDatabase("libraryapi-test");

                return db;
            });

            services.AddTransient(typeof(IMongoCollection<>), typeof(MongoCollection<>));
            services.AddTransient<ILockRecordService, LockRecordService>();
            services.AddTransient<ILockableService, LockableService>();
            services.AddTransient<IRandomDataService, RandomDataService>();

            return serviceProvider;
        }
    }
}
