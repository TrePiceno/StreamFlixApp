import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
// Implementa la interfaz CanActivate
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {} 

  // El método canActivate se ejecuta cuando se intenta acceder a una ruta protegida
  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Obtiene el Observable del estado de login del AuthService
    return this.authService.isLoggedIn$.pipe(
      // take(1): Toma el último valor emitido por isLoggedIn$ y luego completa el Observable.
      // Esto es importante para que el Guard decida y no se quede suscrito indefinidamente.
      take(1), 

      // map: Transforma el valor booleano de isLoggedIn a la decisión del Guard (boolean o UrlTree)
      map((isLoggedIn: boolean) => {
        // <-- Recibe el estado de login (true/false)
        if (isLoggedIn) {
          // Si está logueado, permite el acceso a la ruta
          return true;
        } else {
          // Si NO está logueado, redirige a la página de login
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}