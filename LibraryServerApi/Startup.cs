using System;
using System.IO;
using System.Reflection;
using LibraryServerApi.Extensions;
using LibraryServerApi.Models;
using LibraryServerApi.Service;
using LibraryServerApi.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Swashbuckle.AspNetCore.Swagger;

namespace LibraryServerApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            // Generate openapi doc.
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v2", new Info
                {
                    Title = "Lockables Api",
                    Description = "A simple library api for retrieving/locking/unlocking resources.",
                    TermsOfService = "None",
                    Contact = new Contact
                    {
                        Name = "Alex Hayes",
                        Email = "alex.hayes@aperturelabs.biz"
                    }
                });

                c.AddSecurityDefinition("api_key", new ApiKeyScheme
                {
                    Type = "apiKey",
                    In = "query",
                    Name = "key"
                });

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                c.EnableAnnotations();
            });

            // Services.
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
                var db = client.GetDatabase("libraryapi");

                return db;
            });

            services.AddTransient(typeof(IMongoCollection<>), typeof(MongoCollection<>));
            services.AddTransient<ILockRecordService, LockRecordService>();
            services.AddTransient<ILockableService, LockableService>();
            services.AddTransient<IRandomDataService, RandomDataService>();
            services.AddTransient<IApiKeyService, ApiKeyService>();

            // Tasks.
            services.AddHostedService<CheckLockableLeasesTask>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();
            else
                app.UseHsts();

            app.UseApiKeyAuthentication();

            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), 
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v2/swagger.json", "Lockables Api");
                c.RoutePrefix = String.Empty;
            });

            app.UseHttpsRedirection();
            app.UseMvc(routes =>
            {
                routes.MapRoute("default", "index.html");
            });
        }
    }
}
