import React, { useState } from "react";
import { auth, db } from "../../Firebase/Firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("user");
  const [adminPasskey, setAdminPasskey] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();


  const handleAuth = async (e) => {
    e.preventDefault();
    setError({}); // Reset all errors

    try {
      if (isSignup) {
        if (!firstName || !lastName) {
          setError((prev) => ({ ...prev, name: "Please enter full name" }));
          return;
        }

        if (!email) {
          setError((prev) => ({ ...prev, email: "Email is required" }));
          return;
        }

        if (!password) {
          setError((prev) => ({ ...prev, password: "Password is required" }));
          return;
        }

        if (role === "admin" && adminPasskey !== "CeleHUBadmin") {
          setError((prev) => ({ ...prev, passkey: "Invalid Admin Passkey" }));
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          role,
          createdAt: new Date(),
        });

        alert("Signup successful! You can now log in.");
        setIsSignup(false);
      } else {
        if (!email) {
          setError((prev) => ({ ...prev, email: "Email is required" }));
          return;
        }

        if (!password) {
          setError((prev) => ({ ...prev, password: "Password is required" }));
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          navigate(userData.role === "admin" ? "/admin" : "/user");
        } else {
          setError((prev) => ({ ...prev, login: "User data not found." }));
        }
      }
    } catch (err) {
      console.log("Firebase Auth Error:", err);
      const code = err.code;

      if (code === "auth/user-not-found") {
        setError((prev) => ({ ...prev, email: "No user found with this email." }));
      } else if (code === "auth/wrong-password") {
        setError((prev) => ({ ...prev, password: "Incorrect password." }));
      } else if (code === "auth/email-already-in-use") {
        setError((prev) => ({ ...prev, email: "Email already in use. Try logging in." }));
      } else if (code === "auth/invalid-email") {
        setError((prev) => ({ ...prev, email: "Invalid email format." }));
      } else if (code === "auth/weak-password") {
        setError((prev) => ({ ...prev, password: "Password should be at least 6 characters." }));
      } else {
        setError((prev) => ({ ...prev, firebase: err.message }));
      }
    }
  };

  const handleGoogleAuth = async () => {
    setError({});

    if (isSignup) {
      if (!role) {
        setError({ role: "Please select a role." });
        return;
      }

      if (role === "admin") {
        if (!adminPasskey) {
          setError({ passkey: "Admin passkey is required." });
          return;
        }
        if (adminPasskey !== "CeleHUBadmin") {
          setError({ passkey: "Invalid Admin Passkey." });
          return;
        }
      }
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (isSignup) {
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            firstName: "Google",
            lastName: "User",
            role: role,
            createdAt: new Date(),
          });
          alert("Signup successful! You can now log in.");
          setIsSignup(false);
        } else {
          setError({ firebase: "Account already exists. Try logging in." });
        }
      } else {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          navigate(userData.role === "admin" ? "/admin" : "/user");
        } else {
          setError({ firebase: "User not found. Please sign up first." });
        }
      }
    } catch (err) {
      setError({ firebase: err.message });
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleAuth}>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>

        {isSignup && (
          <div className="name-fields">
            <input type="text" placeholder="First Name" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" value={lastName}
              onChange={(e) => setLastName(e.target.value)} />
          </div>
        )}
        {error.name && <p className="auth-error">{error.name}</p>}

        {isSignup && (
          <div className="role-switcher">
            <div
              className={`role-option ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
            >
              User
            </div>
            <div
              className={`role-option ${role === "admin" ? "active" : ""}`}
              onClick={() => setRole("admin")}
            >
              Admin
            </div>
          </div>
        )}

        {isSignup && role === "admin" && (
          <>
            <input
              type="password"
              placeholder="Admin Passkey"
              value={adminPasskey}
              onChange={(e) => setAdminPasskey(e.target.value)}
            />
            {error.passkey && <p className="auth-error">{error.passkey}</p>}
          </>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {error.email && <p className="error-text">{error.email}</p>}

        <div className="auth-password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="auth-password-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">
            {showPassword ? (
              // Hidden icon
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
              </svg>

            ) : (
              // Visible icon
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
              </svg>

            )}
          </span>
        </div>
        {error.password && <p className="error-text">{error.password}</p>}
        {error.firebase && <p className="auth-error">{error.firebase}</p>}
        {error.login && <p className="auth-error">{error.login}</p>}

        <button className="auth-btn">{isSignup ? "Sign Up" : "Login"}</button>

        <div className="divider">or</div>

        <button type="button" className="google-btn" onClick={handleGoogleAuth}>
          Continue with Google
        </button>

        <p className="toggle-text">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => {
            setIsSignup(!isSignup);
            setError({});
          }}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
}
/*import React, { useState } from "react";
import { auth, db } from "../../Firebase/Firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [adminPasskey, setAdminPasskey] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignup) {
        if (role === "admin" && adminPasskey !== "celeHUBadmin") {
          setError("Invalid Admin Passkey");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date(),
        });

        alert("Signup successful! You can now log in.");
        setIsSignup(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          navigate(userData.role === "admin" ? "/admin" : "/user");
        } else {
          setError("User data not found.");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);

    // Pre-checks before calling Firebase auth
    if (isSignup) {
      if (!role) {
        setError("Please select a role before continuing with Google.");
        return;
      }

      if (role === "admin") {
        if (!adminPasskey) {
          setError("Admin passkey is required.");
          return;
        }
        if (adminPasskey !== "celeHUBadmin") {
          setError("Invalid Admin Passkey for Admin role.");
          return;
        }
      }
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (isSignup) {
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            role: role,
            createdAt: new Date(),
          });

          alert("Signup successful! You can now log in.");
          setIsSignup(false);
        } else {
          setError("Account already exists. Try logging in instead.");
        }
      } else {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          navigate(userData.role === "admin" ? "/admin" : "/user");
        } else {
          setError("User not found. Please sign up first.");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-log-sign-container">
        <h2 className="auth-title">{isSignup ? "Signup" : "Login"}</h2>
        <form className="auth-form" onSubmit={handleAuth}>
          {isSignup && (
            <div className="auth-role-selection">
              <label className="auth-radio-label">
                <input
                  className="auth-radio"
                  type="radio"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                />
                User
              </label>
              <label className="auth-radio-label">
                <input
                  className="auth-radio"
                  type="radio"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />
                Admin
              </label>
            </div>
          )}

          {isSignup && role === "admin" && (
            <input
              type="password"
              className="auth-input-field"
              placeholder="Enter Admin Passkey"
              value={adminPasskey}
              onChange={(e) => setAdminPasskey(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            className="auth-input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">
            {isSignup ? "Sign Up" : "Login"}
          </button>

          <hr className="auth-divider" />or<hr className="auth-divider" />

          {error && <p className="auth-error-message">{error}</p>}

          {(!isSignup || (isSignup && role)) && (
            <button
              type="button"
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleAuth}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-google"
                viewBox="0 0 16 16"
              >
                <path d="M8.159 6.674v2.73h3.787c-.152.955-1.142 2.799-3.787 2.799a4.117 4.117 0 0 1 0-8.233c1.174 0 1.96.5 2.411.934l1.64-1.583C11.63 2.485 10.045 1.75 8.159 1.75a6.25 6.25 0 1 0 0 12.5c3.598 0 5.975-2.51 5.975-6.042 0-.403-.045-.709-.1-.99H8.159Z" />
              </svg>
              Continue with Google
            </button>
          )}

          <p className="auth-toggle-text">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span
              className="auth-toggle-link"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
            >
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

/*import React, { useState } from "react";
import { auth, db } from "../../Firebase/Firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";
export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [adminPasskey, setAdminPasskey] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignup) {
        // Validate Admin Passkey if Admin is selected
        if (role === "admin" && adminPasskey !== "celeHUBadmin") {
          setError("Invalid Admin Passkey");
          return;
        }

        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user details in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date(),
        });

        alert("Signup successful! You can now log in.");
      } else {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Redirect based on role
          if (userData.role === "admin") {
            navigate("/admin"); // Redirect to Admin Dashboard
          } else {
            navigate("/user"); // Redirect to User Dashboard
          }
        } else {
          setError("User data not found.");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-log-sign-container">
        <h2 className="auth-title">{isSignup ? "Signup" : "Login"}</h2>
        <form className="auth-form" onSubmit={handleAuth}>

          {/* Role Selection *
          {isSignup && (
            <div className="auth-role-selection">
              <label className="auth-radio-label">
                <input
                  className="auth-radio"
                  type="radio"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                />
                User
              </label>
              <label className="auth-radio-label">
                <input
                  className="auth-radio"
                  type="radio"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />
                Admin
              </label>
            </div>
          )}

          {/* Show Admin Passkey only if Admin is selected *
          {isSignup && role === "admin" && (
            <input
              type="password"
              className="auth-input-field"
              placeholder="Enter Admin Passkey"
              value={adminPasskey}
              onChange={(e) => setAdminPasskey(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            className="auth-input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            protected
          />

          <button type="submit" className="auth-button">
            {isSignup ? "Sign Up" : "Login"}
          </button>

          <hr className="auth-divider" />or <hr className="auth-divider" />

          {error && <p className="auth-error-message">{error}</p>}

          <button type="submit" className="auth-google-button">
            Continue with Google
          </button>
          {/* Toggle between Login & Signup *
          <p className="auth-toggle-text">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span className="auth-toggle-link" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </p>

        </form>
      </div>
    </div>
  );
}
*/