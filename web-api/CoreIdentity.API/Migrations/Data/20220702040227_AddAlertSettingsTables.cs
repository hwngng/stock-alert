using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CoreIdentity.API.Migrations.Data
{
    public partial class AddAlertSettingsTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlertOptions",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserLocalId = table.Column<long>(nullable: false),
                    TypeKey = table.Column<string>(nullable: true),
                    ParametersJson = table.Column<string>(nullable: true),
                    Exchange = table.Column<string>(nullable: true),
                    SymbolListJson = table.Column<string>(nullable: true),
                    Average5Volumne = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertOptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AlertTypes",
                columns: table => new
                {
                    TypeKey = table.Column<string>(nullable: false),
                    Title = table.Column<string>(nullable: true),
                    Parent = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertTypes", x => x.TypeKey);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertOptions");

            migrationBuilder.DropTable(
                name: "AlertTypes");
        }
    }
}
