import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  accountType?: "candidat" | "entreprise";
  text?: "signin_with" | "signup_with";
}

interface GoogleWindow extends Window {
  google?: {
    accounts: {
      id: {
        renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        initialize: (config: Record<string, unknown>) => void;
      };
    };
  };
}

export default function GoogleLoginButton({
  onSuccess,
  accountType = "candidat",
  text = "signin_with",
}: GoogleLoginButtonProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  // Helper function to decode JWT
  const parseJwt = useCallback((token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse JWT:", e);
      return {};
    }
  }, []);

  const handleGoogleResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) {
        toast.error("Erreur d'authentification Google");
        return;
      }

      try {
        // Decode the JWT token to get user info
        const decoded = parseJwt(response.credential);
        const { email, name, picture, email_verified } = decoded as {
          email: string;
          name: string;
          picture: string;
          email_verified: boolean;
        };

        if (!email_verified) {
          toast.error("Veuillez vérifier votre adresse email Google");
          return;
        }

        // Try to sign in first
        const { error: signInError, user: existingUser } = await signIn(
          email,
          response.credential
        );

        if (existingUser) {
          // User already exists, sign them in
          toast.success("Connexion réussie!");
          navigate("/");
          onSuccess?.();
        } else if (signInError) {
          // User doesn't exist, create an account
          const metadata: Record<string, unknown> = {
            user_type: accountType === "entreprise" ? "company" : "candidate",
            full_name: name,
            country: "congo",
            profile_image_url: picture,
          };

          if (accountType === "entreprise") {
            metadata.company_name = name;
          }

          const { error: signUpError } = await signUp(
            email,
            response.credential,
            metadata
          );

          if (!signUpError) {
            toast.success("Inscription réussie ! Veuillez vous connecter.");
            navigate("/connexion");
            onSuccess?.();
          } else {
            toast.error(signUpError.message || "Erreur lors de l'inscription");
          }
        }
      } catch (error) {
        console.error("Google authentication error:", error);
        toast.error("Erreur lors de l'authentification Google");
      }
    },
    [accountType, navigate, onSuccess, parseJwt, signIn, signUp]
  );

  useEffect(() => {
    if (!divRef.current || !(window as GoogleWindow).google) return;

    try {
      (window as GoogleWindow).google!.accounts.id.renderButton(divRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text,
        locale: "fr",
        logo_alignment: "center",
      });

      (window as GoogleWindow).google!.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: handleGoogleResponse,
      });
    } catch (error) {
      console.error("Google Sign-In initialization failed:", error);
    }
  }, [handleGoogleResponse, text]);

  return <div ref={divRef} className="flex justify-center" />;
}
