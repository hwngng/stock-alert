﻿// <auto-generated />
using System;
using CoreIdentity.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CoreIdentity.API.Migrations.Data
{
    [DbContext(typeof(DataContext))]
    [Migration("20220703145842_FixTypoVolume")]
    partial class FixTypoVolume
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .HasAnnotation("ProductVersion", "3.1.20")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("CoreIdentity.Data.Models.AlertOption", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<long?>("Average5Volume")
                        .HasColumnType("bigint");

                    b.Property<string>("Exchange")
                        .HasColumnType("text");

                    b.Property<string>("ParametersJson")
                        .HasColumnType("text");

                    b.Property<string>("SymbolListJson")
                        .HasColumnType("text");

                    b.Property<string>("TypeKey")
                        .HasColumnType("text");

                    b.Property<long>("UserLocalId")
                        .HasColumnType("bigint");

                    b.Property<long?>("WatchlistId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("AlertOptions");
                });

            modelBuilder.Entity("CoreIdentity.Data.Models.AlertType", b =>
                {
                    b.Property<string>("TypeKey")
                        .HasColumnType("text");

                    b.Property<string>("Parent")
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.HasKey("TypeKey");

                    b.ToTable("AlertTypes");
                });

            modelBuilder.Entity("CoreIdentity.Data.Models.Watchlist", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<DateTime?>("CreatedTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<DateTime?>("ModifiedTime")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("SymbolJson")
                        .HasColumnType("text");

                    b.Property<long>("UserLocalId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Watchlists");
                });

            modelBuilder.Entity("CoreIdentity.Data.Models.spGetManyExamples", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<bool>("Active")
                        .HasColumnType("boolean");

                    b.Property<DateTime?>("DOB")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("spGetManyExamples");
                });

            modelBuilder.Entity("CoreIdentity.Data.Models.spGetOneExample", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<bool>("Active")
                        .HasColumnType("boolean");

                    b.Property<DateTime?>("DOB")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("spGetOneExample");
                });
#pragma warning restore 612, 618
        }
    }
}
