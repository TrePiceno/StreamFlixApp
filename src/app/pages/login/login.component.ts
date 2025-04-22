import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
// Implementa OnInit para inicializar el formulario
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor( private fb: FormBuilder, private authService: AuthService, private router: Router ) {}

  ngOnInit(): void {
    // controles de validación para el formulario de login
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    // Verifica si el formulario es válido según los validadores definidos
    if (this.loginForm.valid) {

      this.errorMessage = '';

      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;

      // Llama al método login del AuthService
      const loginSuccess = this.authService.login(username, password);

      if (loginSuccess) {
        // Si el login fue exitoso, navega a la página principal
        this.router.navigate(['/media']);
      } else {
        // Si el login falló, muestra un mensaje de error
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        console.warn('Intento de login fallido.');
      }
    } else {
      // Si el formulario no es válido (campos vacíos, etc.)
      this.errorMessage = 'Por favor, ingrese usuario y contraseña.';
      console.warn('Formulario de login inválido.');
    }
  }
}
