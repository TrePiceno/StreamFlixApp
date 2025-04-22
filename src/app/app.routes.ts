import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MediaListComponent } from './pages/media-list/media-list.component';
import { MediaDetailComponent } from './pages/media-detail/media-detail.component';
import { FavoriteListComponent } from './pages/favorite-list/favorite-list.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'media', component: MediaListComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoriteListComponent, canActivate: [AuthGuard] },
  { path: 'details/:id', component: MediaDetailComponent, canActivate: [AuthGuard] },

  // Redirige la ruta raíz ('') a '/login'
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Ruta comodín para manejar URLs desconocidas, redirige a media
  { path: '**', redirectTo: '/media' }
];