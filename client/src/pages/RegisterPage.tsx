import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import Toast from "../components/Toast";
import { Button } from "../components/ui/button";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/api/auth/register", {
        email,
        password,
      });

      navigate("/login?registered=1", { replace: true });
    } catch (err: unknown) {
      let message = "Something went wrong";

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error) {
          message = err.response.data.error;
        } else {
          message =
            "Cannot reach server. Check that backend is running and API URL is correct.";
        }
      }

      setToast({ message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card" style={{ display: "flex", flexDirection: "row", gap: 0, padding: 0, overflow: "hidden", maxWidth: "56rem", width: "100%" }}>

        {/* Left — form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, padding: "2.4rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "0.6rem", background: "linear-gradient(135deg,var(--brand),var(--brand-hover))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: "white" }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>Vi-Notes</span>
          </div>

          <h1 className="auth-title" style={{ marginBottom: "0.3rem" }}>Create Account</h1>
          <p className="auth-subtitle" style={{ marginBottom: "1.6rem" }}>Register to access your dashboard and start collecting keystroke data.</p>

          <label className="field-label" htmlFor="register-email">Email</label>
          <input
            id="register-email"
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginBottom: "0.8rem" }}
          />

          <label className="field-label" htmlFor="register-password">Password</label>
          <div className="password-wrapper" style={{ marginBottom: "1.2rem" }}>
            <input
              id="register-password"
              className="field-input"
              type={showPassword ? "text" : "password"}
              placeholder="Choose a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="eye-toggle" onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" disabled={isSubmitting} style={{ marginBottom: "1rem" }}>
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>

          <p className="auth-footnote">Already have an account? <Link to="/login">Login here</Link></p>
        </form>

        {/* Right — image */}
        <div className="hidden md:block" style={{ width: "22rem", flexShrink: 0 }}>
          <img src="/assest/login.png" alt="Vi-Notes" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default RegisterPage;
