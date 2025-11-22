import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (!this.email || !this.password) {
      alert('Ingrese email y contraseña');
      return;
    }

    this.auth.login(this.email, this.password)
      .pipe(first())
      .subscribe({
        next: () => {
          const role = this.auth.currentUser?.role;
          if (role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        },
        error: (err) => {
          console.error(err);
          alert('Credenciales incorrectas');
        }
      });
  }
}
