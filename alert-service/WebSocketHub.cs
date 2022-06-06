using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using AlertService.Common;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Collections.Generic;
using AlertService.Interfaces;
using System.Linq;
using AlertService.Models;
using System.Text.RegularExpressions;
using System.Text.Json;

namespace AlertService
{
    public class WebSocketHub: IWebSocketHub
    {
        private ClientWebSocket _webSocket;
        private readonly IConfiguration _config;
        private Task _keepAlive;
        private CancellationTokenSource _tokenSource;
        private readonly ILogger<WebSocketHub> _logger;
        private IDistributeMessage _distributeMsg;
        
        public WebSocketHub (IConfiguration config, ILogger<WebSocketHub> logger, IDistributeMessage distributeMessage) {
            
            _config = config;
            _logger = logger;
            _distributeMsg = distributeMessage;
            
        }

        public async Task Connect () {
            try {
                _webSocket = new ClientWebSocket();
                _tokenSource = new CancellationTokenSource();
                var ct = _tokenSource.Token;
                _keepAlive = new Task(async () => {
                    ct.ThrowIfCancellationRequested();
                    while (!ct.IsCancellationRequested && this._webSocket.State == WebSocketState.Open) {
                        await this._webSocket.SendAsync(Constants.PING, WebSocketMessageType.Text, true, CancellationToken.None);
                        await Task.Delay(int.Parse(_config["WebSocket:PingInterval"] ?? "25000"));
                        _logger.LogInformation("Sent ping {ping} ({time})", Encoding.ASCII.GetString(Constants.PING), DateTimeOffset.Now);
                    }
                }, ct);
                await _webSocket.ConnectAsync(new System.Uri(_config["WebSocket:DataSourceApi"]), CancellationToken.None);
                _logger.LogInformation("Connected to {url}", _config["WebSocket:DataSourceApi"]);
                _keepAlive.Start();
            } catch (WebSocketException e) {
                _logger.LogError(e, "Error at WebSocketHub");
                this._tokenSource.Cancel();
            }
        }

        public async Task SubscribeStock (List<string> codes) {
            try {
                if (_webSocket.State != WebSocketState.Open)
                    return;
                var msg = string.Format("42[\"sub\",[\"{0}\"]]", string.Join("\",\"", codes));
                await _webSocket.SendAsync(new ArraySegment<byte>(Encoding.ASCII.GetBytes(msg)), WebSocketMessageType.Text, true, CancellationToken.None);
                _logger.LogInformation("Sent: {msg}", msg);
            } catch (WebSocketException e) {
                _logger.LogError(e, "Error at WebSocketHub");
                this._tokenSource.Cancel();
            }
        }

        public async Task StartFetchMessage (CancellationToken cancellationToken) {
            try {
                var msgNamespace = _config["MessageNamespace"];
                var bytesReceived = new ArraySegment<byte>(new byte[10240]);
                while (_webSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested) {
                    var result =  await _webSocket.ReceiveAsync(bytesReceived, CancellationToken.None);
                    var msg = Encoding.ASCII.GetString(bytesReceived.Array, 0, result.Count);
                    var sockData = GetSocketData(msg);
                    var msgObj = VNDHelper.Parse(sockData, msgNamespace);
                    if (!(msgObj is null))
                        await _distributeMsg.Distribute(msgObj);
                    // _logger.LogInformation("From WebScoketHandler ({time}): {msg}", DateTimeOffset.Now, msg);
                }
            } catch (WebSocketException e) {
                _logger.LogError(e, "Error at WebSocketHub");
                _tokenSource.Cancel();
            }
        }

        public async Task Disconnect () {
            if (_webSocket.State == WebSocketState.Open)
                await _webSocket.CloseAsync(WebSocketCloseStatus.Empty, "", CancellationToken.None);
            _webSocket.Dispose();
        }

        private string GetSocketData (string sockMsg) {
            try {
                sockMsg = Regex.Unescape(sockMsg);                  // parse socket message 42[\"<event>\", \"<data>\"]
                sockMsg = sockMsg.Substring(sockMsg.IndexOf('['));
                var sockLst = JsonSerializer.Deserialize<List<string>>(sockMsg);
                if (sockLst.Count == 2)
                    return sockLst[1];
            } catch {
                _logger.LogWarning("Cannot serialize message: {msg}", sockMsg);
            }
            return "";
        }
	}
}