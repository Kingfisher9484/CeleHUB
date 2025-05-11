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
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError({});

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
        if (!otpInput) {
          setError((prev) => ({ ...prev, otp: "Please enter the OTP" }));
          return;
        }
        if (otpInput !== generatedOtp) {
          setError((prev) => ({ ...prev, otp: "Invalid OTP" }));
          return;
        }
        if (!captchaVerified) {
          setError((prev) => ({ ...prev, captcha: "Please verify CAPTCHA" }));
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
        setOtpSent(false);
        setOtpInput("");
        setCaptchaVerified(false);
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
      const code = err.code;
      const errorMessages = {
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "Email already in use. Try logging in.",
        "auth/invalid-email": "Invalid email format.",
        "auth/weak-password": "Password should be at least 6 characters.",
      };
      setError((prev) => ({ ...prev, [code.includes("password") ? "password" : "email"]: errorMessages[code] || err.message }));
    }
  };

  const handleGoogleAuth = async () => {
    setError({});
    if (isSignup && role === "admin" && adminPasskey !== "CeleHUBadmin") {
      setError({ passkey: "Invalid Admin Passkey" });
      return;
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
            role,
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

  const handleSendOtp = () => {
    if (!email) {
      setError((prev) => ({ ...prev, email: "Enter email to send OTP" }));
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    console.log("OTP (for demo):", otp);
    alert(`OTP sent to ${email} (Simulated): ${otp}`);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleAuth}>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>

        {isSignup && (
          <>
            <div className="name-fields">
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            {error.name && <p className="auth-error">{error.name}</p>}
          </>
        )}

        {isSignup && (
          <div className="role-switcher">
            <div className={`role-option ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>User</div>
            <div className={`role-option ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>Admin</div>
          </div>
        )}

        {isSignup && role === "admin" && (
          <>
            <input type="password" placeholder="Admin Passkey" value={adminPasskey} onChange={(e) => setAdminPasskey(e.target.value)} />
            {error.passkey && <p className="auth-error">{error.passkey}</p>}
          </>
        )}

        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        {error.email && <p className="auth-error">{error.email}</p>}

        <div className="auth-password-wrapper">
          <input type={showPassword ? "text" : "password"} className="auth-password-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye"></span>
        </div>
        {error.password && <p className="auth-error">{error.password}</p>}

        {isSignup && (
          <>
            <button type="button" className="otp-btn" onClick={handleSendOtp} disabled={otpSent || !email}>
              {otpSent ? "OTP Sent" : "Send OTP"}
            </button>
            {otpSent && (
              <input type="text" placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
            )}
            {error.otp && <p className="error-text">{error.otp}</p>}

            <div className="captcha-box">
              <label>
                <input type="checkbox" checked={captchaVerified} onChange={(e) => setCaptchaVerified(e.target.checked)} />
                I'm not a robot
              </label>
            </div>
            {error.captcha && <p className="error-text">{error.captcha}</p>}
          </>
        )}

        {error.firebase && <p className="auth-error">{error.firebase}</p>}
        {error.login && <p className="auth-error">{error.login}</p>}

        <button className="auth-btn">{isSignup ? "Sign Up" : "Login"}</button>

        <div className="divider">or</div>

        <button type="button" className="google-btn" onClick={handleGoogleAuth}>Continue with Google</button>

        <p className="toggle-text">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => { setIsSignup(!isSignup); setError({}); }}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
}


// import React, { useState } from "react";
// import { auth, db } from "../../Firebase/Firebase";
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
// } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";
// import "./AuthForm.css";

// export default function AuthForm() {
//   const [isSignup, setIsSignup] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [role, setRole] = useState("user");
//   const [adminPasskey, setAdminPasskey] = useState("");
//   const [error, setError] = useState({});
//   const navigate = useNavigate();
//   const provider = new GoogleAuthProvider();

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setError({});

//     try {
//       if (isSignup) {
//         if (!firstName || !lastName) {
//           setError((prev) => ({ ...prev, name: "Please enter full name" }));
//           return;
//         }
//         if (!email) {
//           setError((prev) => ({ ...prev, email: "Email is required" }));
//           return;
//         }
//         if (!password) {
//           setError((prev) => ({ ...prev, password: "Password is required" }));
//           return;
//         }
//         if (role === "admin" && adminPasskey !== "CeleHUBadmin") {
//           setError((prev) => ({ ...prev, passkey: "Invalid Admin Passkey" }));
//           return;
//         }

//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         await setDoc(doc(db, "users", user.uid), {
//           uid: user.uid,
//           email: user.email,
//           firstName,
//           lastName,
//           role,
//           createdAt: new Date(),
//         });

//         alert("Signup successful! You can now log in.");
//         setIsSignup(false);
//       } else {
//         if (!email) {
//           setError((prev) => ({ ...prev, email: "Email is required" }));
//           return;
//         }
//         if (!password) {
//           setError((prev) => ({ ...prev, password: "Password is required" }));
//           return;
//         }

//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const userDoc = await getDoc(doc(db, "users", user.uid));

//         if (userDoc.exists()) {
//           const userData = userDoc.data();
//           navigate(userData.role === "admin" ? "/admin" : "/user");
//         } else {
//           setError((prev) => ({ ...prev, login: "User data not found." }));
//         }
//       }
//     } catch (err) {
//       const code = err.code;
//       if (code === "auth/user-not-found") {
//         setError((prev) => ({ ...prev, email: "No user found with this email." }));
//       } else if (code === "auth/wrong-password") {
//         setError((prev) => ({ ...prev, password: "Incorrect password." }));
//       } else if (code === "auth/email-already-in-use") {
//         setError((prev) => ({ ...prev, email: "Email already in use. Try logging in." }));
//       } else if (code === "auth/invalid-email") {
//         setError((prev) => ({ ...prev, email: "Invalid email format." }));
//       } else if (code === "auth/weak-password") {
//         setError((prev) => ({ ...prev, password: "Password should be at least 6 characters." }));
//       } else {
//         setError((prev) => ({ ...prev, firebase: err.message }));
//       }
//     }
//   };

//   const handleGoogleAuth = async () => {
//     setError({});
//     if (isSignup && role === "admin" && adminPasskey !== "CeleHUBadmin") {
//       setError({ passkey: "Invalid Admin Passkey" });
//       return;
//     }

//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;
//       const userRef = doc(db, "users", user.uid);
//       const userSnap = await getDoc(userRef);

//       if (isSignup) {
//         if (!userSnap.exists()) {
//           await setDoc(userRef, {
//             uid: user.uid,
//             email: user.email,
//             firstName: "Google",
//             lastName: "User",
//             role,
//             createdAt: new Date(),
//           });
//           alert("Signup successful! You can now log in.");
//           setIsSignup(false);
//         } else {
//           setError({ firebase: "Account already exists. Try logging in." });
//         }
//       } else {
//         if (userSnap.exists()) {
//           const userData = userSnap.data();
//           navigate(userData.role === "admin" ? "/admin" : "/user");
//         } else {
//           setError({ firebase: "User not found. Please sign up first." });
//         }
//       }
//     } catch (err) {
//       setError({ firebase: err.message });
//     }
//   };

//   return (
//     <div className="auth-container">
//       <form className="auth-form" onSubmit={handleAuth}>
//         <h2>{isSignup ? "Sign Up" : "Login"}</h2>

//         {isSignup && (
//           <>
//             <div className="name-fields">
//               <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
//               <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
//             </div>
//             {error.name && <p className="auth-error">{error.name}</p>}
//           </>
//         )}

//         {isSignup && (
//           <div className="role-switcher">
//             <div className={`role-option ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>User</div>
//             <div className={`role-option ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>Admin</div>
//           </div>
//         )}

//         {isSignup && role === "admin" && (
//           <>
//             <input type="password" placeholder="Admin Passkey" value={adminPasskey} onChange={(e) => setAdminPasskey(e.target.value)} />
//             {error.passkey && <p className="auth-error">{error.passkey}</p>}
//           </>
//         )}

//         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
//         {error.email && <p className="error-text">{error.email}</p>}

//         <div className="auth-password-wrapper">
//           <input type={showPassword ? "text" : "password"} className="auth-password-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//           <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">
//             {showPassword ? (
//               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
//                 <path d="..." />
//               </svg>
//             ) : (
//               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
//                 <path d="..." />
//               </svg>
//             )}
//           </span>
//         </div>
//         {error.password && <p className="error-text">{error.password}</p>}
//         {error.firebase && <p className="auth-error">{error.firebase}</p>}
//         {error.login && <p className="auth-error">{error.login}</p>}

//         <button className="auth-btn">{isSignup ? "Sign Up" : "Login"}</button>

//         <div className="divider">or</div>

//         <button type="button" className="google-btn" onClick={handleGoogleAuth}>Continue with Google</button>

//         <p className="toggle-text">
//           {isSignup ? "Already have an account? " : "Don't have an account? "}
//           <span onClick={() => { setIsSignup(!isSignup); setError({}); }}>
//             {isSignup ? "Login" : "Sign Up"}
//           </span>
//         </p>
//       </form>
//     </div>
//   );
// }