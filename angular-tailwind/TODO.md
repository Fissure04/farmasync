# TODO: Modify App to FarmAsync Pharmacy

## Information Gathered
- Current app is an Angular Tailwind template with auth pages (sign-in, sign-up), dashboard (ecommerce), and various components.
- Sign-in form has email/password, OAuth, etc.
- Sign-up form has first/last name, email, password.
- Dashboard shows metrics, charts, orders.
- Header has sidebar toggle, search, theme toggle, notifications, user dropdown.
- PDF contains agent content for client and admin.
- Palette: #000000, #0f1d29, #246a73, #409c97, #ffeed3, #ffffff.

## Plan
### 1. Update Authentication Forms
- Modify sign-in form: Change to username/password, labels in Spanish ("Nombre de usuario", "Contraseña", "Iniciar Sesion", "Registrarse").
- Modify sign-up form: Add basic info fields (e.g., phone, address), labels in Spanish, redirect to login after signup.
- Update routes: Default path to '/signin', after login redirect to '/dashboard'.

### 2. Create Pharmacy Dashboard
- Modify ecommerce dashboard to product dashboard: Show products with "Agregar al carrito" buttons.
- Add cart component for sales completion.
- Update header: Add buttons "Inicio", "Carrito", "Agente".

### 3. Implement Agent Feature
- Create agent component: Show PDF content based on user role (client or admin).
- Differentiate: Client sees client agent, admin sees admin agent.

### 4. Admin Features
- For admin login: Add sections for ordering products from suppliers, inventory management, client management.

### 5. Styling and Cleanup
- Apply color palette throughout the app.
- Remove unnecessary components/pages (e.g., charts, forms, etc., not related to pharmacy).
- Update titles, logos to "FarmAsync".

### 6. Simulation and Future Integration
- All data simulated (hardcoded users, products, etc.).
- Structure code for easy microservice connection later.

## Dependent Files to Edit
- src/app/pages/auth-pages/sign-in/sign-in.component.html
- src/app/pages/auth-pages/sign-up/sign-up.component.html
- src/app/app.routes.ts
- src/app/pages/dashboard/ecommerce/ecommerce.component.html
- src/app/shared/layout/app-header/app-header.component.html
- New components: cart, agent, admin sections.
- src/styles.css for colors.

## Followup Steps
- Test login/signup flow.
- Test dashboard and cart.
- Verify agent content.
- Ensure responsive design.
- Prepare for microservice integration (e.g., services for auth, products).
