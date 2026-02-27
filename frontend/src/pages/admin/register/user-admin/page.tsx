// src/pages/admin/register/user-admin/page.tsx
import RegisterForm from "../components/RegisterForm";

export default function UserAdminRegister() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Créer un Admin Utilisateurs
      </h1>
      <RegisterForm role="admin_users" title="Admin Users" color="text-green-600" />
    </div>
  );
}