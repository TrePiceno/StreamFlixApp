import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Credenciales hardcodeadas para el login
  private readonly validUsername = 'admin';
  private readonly validPassword = 'pass123';

  private readonly localStorageLoginKey = 'isLoggedIn';

  // Aqui se guarda el estado de login recibe como valor true o false
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.getLoginStateFromLocalStorage());
  // Observable público
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {}

  // Método para verificar si el usuario está logueado
  private getLoginStateFromLocalStorage(): boolean {
    const loggedInStatus = localStorage.getItem(this.localStorageLoginKey);
    return loggedInStatus === 'true';
  }

  // Si el uusuario y contraseña son correctos, el estado de login cambia a true
  login(username: string, password: string): boolean {
    if (username === this.validUsername && password === this.validPassword) {
      this.isLoggedInSubject.next(true);
      // Se guarda el estado de login en localStorage
      localStorage.setItem(this.localStorageLoginKey, 'true');
      return true;
    } else {
      this.isLoggedInSubject.next(false);
      localStorage.removeItem(this.localStorageLoginKey);
      return false;
    }
  }

  // Con el logout se cambia el estado de login a false y se redirige a la página de login
  logout(): void {
    this.isLoggedInSubject.next(false);
    localStorage.removeItem(this.localStorageLoginKey); 
    this.router.navigate(['/login']);
  }

  // Método para obtener el estado actual de login de forma síncrona (útil en guards)
  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.getValue();
  }
}