import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';


@Component({
  selector: 'app-signup-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {

  showPassword = false;
  isChecked = false;

  fname = '';
  lname = '';
  username = '';
  email = '';
  phone = '';
  address = '';
  password = '';

  constructor(private auth: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    if (!this.fname || !this.lname || !this.email || !this.password || !this.isChecked) {
      alert('Por favor completa todos los campos obligatorios y acepta los términos');
      return;
    }

    const dto = {
      nombre: this.fname,
      apellido: this.lname,
      email: this.email,
      direccion: this.address,
      telefono: this.phone,
      password: this.password,
      // idRol is optional here — backend register assigns CLIENTE (id=2) by default
      idRol: 2
    };

    this.auth.register(dto).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        window.location.href = '/signin';
      },
      error: (err) => {
        console.error(err);
        alert('Error en el registro: ' + (err?.error || err?.message || '')); 
      }
    });
  }
}
