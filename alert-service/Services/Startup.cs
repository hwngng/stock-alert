using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AlertService.Services.Impls;
using AlertService.Services.Interfaces;
using AlertService.Services.Hubs;
using AlertService.Services;

namespace AlertService.Old
{
	public class Startup
	{
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddSingleton<IWebSocketHub, WebSocketHub>();
			services.AddSingleton<IHandleMessage, TestAlert>();
			services.AddSingleton<IDistributeMessage, DistributeMessage>();
			// services.AddSingleton<IHandleMessage, Test2Alert>();
			services.AddSingleton<IDataProvider, DataProvider>();
			services.AddSignalR();
			services.AddHostedService<AlertWorker>();
		}

		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseRouting();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapHub<AlertHub>("/alert");
			});
		}
	}
}