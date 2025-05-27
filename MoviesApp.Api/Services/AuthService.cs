using MoviesApp.Api.Models;
using MoviesApp.Api.Data;
using MoviesApp.Api.Helpers;

namespace MoviesApp.Api.Services
{
    public class AuthService
    {
        private readonly UserRepository _userRepository;

        public AuthService(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Usuario?> Register(string username, string password)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(username);
            if (existingUser != null)
            {
                return null;
            }

            string passwordHash = PasswordHasher.HashPassword(password);

            var newUser = new Usuario
            {
                Username = username,
                PasswordHash = passwordHash,
                FechaCreacion = DateTime.Now
            };

            var newUserId = await _userRepository.CreateUserAsync(newUser);

            newUser.UsuarioId = newUserId;
            return newUser;
        }

        public async Task<Usuario?> Authenticate(string username, string password)
        {
            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null || !PasswordHasher.VerifyPassword(password, user.PasswordHash))
            {
                return null;
            }

            return user;
        }

    }
}