using Microsoft.EntityFrameworkCore.Migrations;

namespace CoreIdentity.API.Migrations.Data
{
    public partial class AddMultitpleConditionTypeAlert : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TypeKey2",
                table: "AlertOptions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TypeKey2",
                table: "AlertOptions");
        }
    }
}
