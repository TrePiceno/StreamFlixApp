import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  title = 'angular-movie-catalog';

  // Observable para controlar si el navbar/footer deben mostrarse
  showLayout$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor( private router: Router, private dialog: MatDialog) {
    // Aqui se determina si la ruta es login para no mostrar el layout (navbar y footer)
    this.showLayout$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: any) => !event.urlAfterRedirects.includes('/login'))
    );

    // Con esto el modal se cierra si el usuario cambia de vista y no presionó ningun botón del modal
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntil(this.destroy$) 
      )
      .subscribe(() => {
        this.dialog.closeAll();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}