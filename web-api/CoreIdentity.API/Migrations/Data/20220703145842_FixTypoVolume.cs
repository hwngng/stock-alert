using Microsoft.EntityFrameworkCore.Migrations;

namespace CoreIdentity.API.Migrations.Data
{
    public partial class FixTypoVolume : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Average5Volumne",
                table: "AlertOptions");

            migrationBuilder.AddColumn<long>(
                name: "Average5Volume",
                table: "AlertOptions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Average5Volume",
                table: "AlertOptions");

            migrationBuilder.AddColumn<long>(
                name: "Average5Volumne",
                table: "AlertOptions",
                type: "bigint",
                nullable: true);
        }
    }
}
