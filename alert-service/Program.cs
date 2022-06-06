using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AlertService.Impls;
using AlertService.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AlertService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    services.AddSingleton<IWebSocketHub, WebSocketHub>();
                    services.AddSingleton<IHandleMessage, TestAlert>();
                    services.AddSingleton<IDistributeMessage, DistributeMessage>();
                    // services.AddSingleton<IHandleMessage, Test2Alert>();
                    services.AddSingleton<IDataHub, DataHub>();
                    services.AddHostedService<Worker>();
                });
    }
}
