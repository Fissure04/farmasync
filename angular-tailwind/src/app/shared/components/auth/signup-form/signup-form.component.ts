import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    console.log('First Name:', this.fname);
    console.log('Last Name:', this.lname);
    console.log('Username:', this.username);
    console.log('Email:', this.email);
    console.log('Phone:', this.phone);
    console.log('Address:', this.address);
    console.log('Password:', this.password);
    console.log('Terms Accepted:', this.isChecked);
    // Simulate signup and redirect to signin
    if (this.fname && this.lname && this.username && this.email && this.password && this.isChecked) {
      // For demo, any data works
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      window.location.href = '/signin';
    } else {
      alert('Por favor, completa todos los campos obligatorios y acepta los términos.');
    }
  }
}
