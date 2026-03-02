// src/pages/admin/register/super-admin/page.tsx
import RegisterForm from "../components/RegisterForm";

export default function SuperAdminRegister() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Créer un Super Administrateur
      </h1>
      <RegisterForm role="super_admin" title="Super Admin" color="text-red-600" />
    </div>
  );
}