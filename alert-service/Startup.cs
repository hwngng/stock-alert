using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Services;
using AlertService.Services.Hubs;
using AlertService.Services.Impls;
using AlertService.Services.Interfaces;
using AlertService.Services.Settings;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Caching.Distributed;
namespace AlertService
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
            services.AddLogging();
            // var wsSettings = JsonSerializer.Deserialize<WebSocketSettings>(Configuration.GetValue<string>("WebSocket"));
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials()
                       .WithOrigins("http://localhost:3000");;
            }));
            var wsSettings = new WebSocketSettings();
            // wsSettings.SubStocks = Configuration.GetValue<List<string>>("WebSocket:SubStocks");
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = "localhost:6379";
                options.InstanceName = "AlertService_";
            });
            Configuration.GetSection("WebSocket").Bind(wsSettings);
            services.AddSingleton(wsSettings);
            services.AddSingleton<IWebSocketHub, WebSocketHub>();
            services.AddSingleton<BasicCandle>();
            services.AddSingleton<ComplexCandle>();
            services.AddSingleton<TechAlert>();
			// services.AddSingleton<IHandleMessage, TestAlert>();
            services.AddSingleton<IHandleMessage>(x => x.GetService<BasicCandle>());
            services.AddSingleton<IAlertProvider>(x => x.GetService<BasicCandle>());
            services.AddSingleton<IHandleMessage>(x => x.GetService<ComplexCandle>());
            services.AddSingleton<IAlertProvider>(x => x.GetService<ComplexCandle>());
            services.AddSingleton<IHandleMessage>(x => x.GetService<TechAlert>());
            services.AddSingleton<IAlertProvider>(x => x.GetService<TechAlert>());
			services.AddSingleton<IDistributeMessage, DistributeMessage>();
			services.AddSingleton<IDataProvider, DataProvider>();
			services.AddSingleton<AlertHandler>();
			services.AddSingleton<AlertPublisher>();
			services.AddSingleton<AlertFilterService>();
			services.AddSignalR();
            services.AddControllers();
			services.AddHostedService<AlertWorker>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // app.UseHttpsRedirection();

            app.UseRouting();
            app.UseCors("CorsPolicy");

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<AlertHub>("/alert");
            });
        }
    }
}
