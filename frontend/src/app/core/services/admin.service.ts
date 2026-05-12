import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, DashboardSummary } from '../models/models';
import { environment } from '../../../environments/environment';
import { mapUser, unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<any>(`${environment.apiGateway}/admin/users`).pipe(
      map(response => (unwrapData<any[]>(response) ?? []).map(mapUser))
    );
  }

  suspendUser(id: string): Observable<void> {
    return this.http.put<void>(`${environment.apiGateway}/admin/users/${id}/suspend`, {});
  }

  activateUser(id: string): Observable<void> {
    return this.http.put<void>(`${environment.apiGateway}/admin/users/${id}/activate`, {});
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiGateway}/admin/users/${id}`);
  }
}
