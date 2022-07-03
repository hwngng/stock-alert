using Microsoft.EntityFrameworkCore.Migrations;

namespace CoreIdentity.API.Migrations.Data
{
    public partial class AddWatchlistIdToOption : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "WatchlistId",
                table: "AlertOptions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WatchlistId",
                table: "AlertOptions");
        }
    }
}
