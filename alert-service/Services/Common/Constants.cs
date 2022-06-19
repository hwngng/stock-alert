using System;
using System.Text;

namespace AlertService.Services.Common
{
    public class Constants
    {

        public static string PING = "2";

        public static ArraySegment<byte> PONG = Encoding.ASCII.GetBytes("3");

        public static ArraySegment<byte> HANDSHAKE = Encoding.ASCII.GetBytes("40");
    }
}