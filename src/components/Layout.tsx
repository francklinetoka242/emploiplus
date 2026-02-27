import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AuthUserFooter from "./AuthUserFooter";
import { MessagingWidget } from "./messaging/MessagingWidget";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" role="main" className="flex-1">
        <Outlet />
      </main>
      {user ? <AuthUserFooter /> : <Footer />}
      {user && <MessagingWidget />}
    </div>
  );
};

export default Layout;
