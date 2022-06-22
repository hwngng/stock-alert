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
using Microsoft.Extensions.Logging;

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
            var wsSettings = new WebSocketSettings();
            // wsSettings.SubStocks = Configuration.GetValue<List<string>>("WebSocket:SubStocks");
            Configuration.GetSection("WebSocket").Bind(wsSettings);
            services.AddSingleton(wsSettings);
            services.AddSingleton<IWebSocketHub, WebSocketHub>();
			services.AddSingleton<IHandleMessage, TestAlert>();
			services.AddSingleton<IDistributeMessage, DistributeMessage>();
			// services.AddSingleton<IHandleMessage, Test2Alert>();
			services.AddSingleton<IDataProvider, DataProvider>();
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

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<AlertHub>("/alert");
            });
        }
    }
}
