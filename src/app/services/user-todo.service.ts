import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserTodo } from '../models/user-todo.model';

@Injectable({ providedIn: 'root' })
export class UserTodoService {
  constructor(private http: HttpClient) {}

  getTodos(): Observable<UserTodo[]> {
    return this.http.get<UserTodo[]>('/user/todos');
  }

  addTodo(todo: Partial<UserTodo>): Observable<UserTodo> {
    return this.http.post<UserTodo>('/user/todos', todo);
  }

  updateTodo(id: number, todo: Partial<UserTodo>): Observable<UserTodo> {
    return this.http.put<UserTodo>(`/user/todos/${id}`, todo);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`/user/todos/${id}`);
  }
}
