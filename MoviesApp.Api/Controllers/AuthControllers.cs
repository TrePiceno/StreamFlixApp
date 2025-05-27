using Microsoft.AspNetCore.Mvc;
using MoviesApp.Api.Services;
using MoviesApp.Api.Models;
public class LoginRequest
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}

public class RegisterRequest
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}

[ApiController]
[Route("api/Auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.Authenticate(request.Username, request.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Nombre de usuario o contraseña incorrectos." });
        }

        return Ok(new { message = "Login exitoso", userId = user.UsuarioId, username = user.Username });
    }

    [HttpPost("register")] 
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Nombre de usuario y contraseña son requeridos." });
        }

        var newUser = await _authService.Register(request.Username, request.Password);

        if (newUser == null)
        {
            return Conflict(new { message = "El nombre de usuario ya está registrado." });
        }

        return CreatedAtAction(nameof(Login), new { username = newUser.Username }, new { message = "Usuario registrado con éxito", userId = newUser.UsuarioId });

    }

}