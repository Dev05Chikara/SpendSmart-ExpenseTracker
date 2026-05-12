import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../models/models';
import { environment } from '../../../environments/environment';
import { mapCategory, unwrapData } from './backend-response';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${environment.apiGateway}/categories`).pipe(
      map(response => (unwrapData<any[]>(response) ?? []).map(mapCategory))
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<any>(`${environment.apiGateway}/categories/${id}`).pipe(
      map(response => mapCategory(unwrapData(response)))
    );
  }

  createCategory(cat: Partial<Category>): Observable<Category> {
    return this.http.post<any>(`${environment.apiGateway}/categories`, cat).pipe(
      map(response => mapCategory(unwrapData(response)))
    );
  }

  updateCategory(id: string, cat: Partial<Category>): Observable<Category> {
    return this.http.put<any>(`${environment.apiGateway}/categories/${id}`, cat).pipe(
      map(response => mapCategory(unwrapData(response)))
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiGateway}/categories/${id}`);
  }
}
