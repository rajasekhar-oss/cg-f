import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserTodoService } from '../../services/user-todo.service';
import { UserTodo } from '../../models/user-todo.model';

@Component({
  standalone: true,
  selector: 'app-user-todo',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>User Todos</h2>
    <form (ngSubmit)="addTodo()">
      <input [(ngModel)]="newTitle" name="title" placeholder="Title" required />
      <input [(ngModel)]="newDescription" name="description" placeholder="Description" />
      <button type="submit">Add Todo</button>
    </form>
    <ul>
      <li *ngFor="let todo of todos">
        <input type="checkbox" [(ngModel)]="todo.completed" (change)="updateTodo(todo)" />
        <span [style.textDecoration]="todo.completed ? 'line-through' : 'none'">{{todo.title}}</span>
        <button (click)="deleteTodo(todo.id)">Delete</button>
      </li>
    </ul>
  `
})
export class UserTodoComponent {
  todos: UserTodo[] = [];
  newTitle = '';
  newDescription = '';

  constructor(private todoService: UserTodoService) {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe(todos => this.todos = todos);
  }

  addTodo() {
    if (!this.newTitle.trim()) return;
    this.todoService.addTodo({ title: this.newTitle, description: this.newDescription, completed: false }).subscribe(todo => {
      this.todos.push(todo);
      this.newTitle = '';
      this.newDescription = '';
    });
  }

  updateTodo(todo: UserTodo) {
    this.todoService.updateTodo(todo.id, { completed: todo.completed }).subscribe();
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter(t => t.id !== id);
    });
  }
}
