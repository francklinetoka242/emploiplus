// src/pages/admin/register/content-admin/page.tsx
import RegisterForm from "../components/RegisterForm";

export default function ContentAdminRegister() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Création d'admin Contenu / Offres
      </h1>
      <p className="text-center text-sm text-gray-600 mb-4">
        Les admins de contenu sont créés uniquement par le Super Admin depuis son tableau de bord.
      </p>
    </div>
  );
}