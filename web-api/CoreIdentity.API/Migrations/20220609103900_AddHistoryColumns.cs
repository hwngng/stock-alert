using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CoreIdentity.API.Migrations
{
    public partial class AddHistoryColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "RefreshTokens",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Machine",
                table: "RefreshTokens",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "Machine",
                table: "RefreshTokens");
        }
    }
}
