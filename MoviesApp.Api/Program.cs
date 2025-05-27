using BCrypt.Net;
using Microsoft.AspNetCore.Identity;
using MoviesApp.Api.Data;
using MoviesApp.Api.Helpers;
using MoviesApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<DataContext>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PeliculaSerieRepository>();
builder.Services.AddScoped<CatalogService>();
builder.Services.AddScoped<UsuariosFavoritosRepository>();
builder.Services.AddScoped<FavoriteService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        corsBuilder =>
        {
            corsBuilder.WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.Run();