using System;
using System.Text;

namespace AlertService.Services.Common
{
    public class Constants
    {
        public readonly static string PING = "2";

        public readonly static ArraySegment<byte> PONG = Encoding.ASCII.GetBytes("3");

        public readonly static ArraySegment<byte> HANDSHAKE = Encoding.ASCII.GetBytes("40");
    }
}