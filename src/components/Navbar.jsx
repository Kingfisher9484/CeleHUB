import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../Firebase/Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaBars } from "react-icons/fa";
import ThemeToggle from "../components/ThemeToggle";
import "./Navbar.css";
import UserProfile from "../components/UserProfile";

const CustomNavbar = () => {
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      // Close mobile menu if clicked outside
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role);

            // ✅ Use 'profilePic' field which contains full Cloudinary URL
            const firebasePhotoURL = userData.profilePic || "";
            setProfilePic(firebasePhotoURL);
          } else {
            console.warn("No such user document.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setRole(null);
        setProfilePic(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar-container">
        {(role === "admin" || role === "user") && (
          <button
            className="mobile-sidebar-toggle"
            onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="24"
              fill="white"
              className="bi bi-layout-sidebar-inset"
              viewBox="0 0 16 16"
            >
              <path d="M3 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H3zm0 1h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
              <path d="M4 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1V2H4z" />
            </svg>
          </button>
        )}

        <Link to="/" className="navbar-brand app-logo">
          <h3 className="logo-heading" style={{ position: "relative" }}>
            <span className="stars">✨</span>
            <span className="nav-brand">CeleHUB</span>
          </h3>
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        <ul className={`navbar-links ${menuOpen ? "active" : ""}`} ref={menuRef}>
          <li><ThemeToggle /></li>

          {role === "admin" && (
            <li className="dashboard"><Link to="/admin">Admin Dashboard</Link></li>
          )}
          {role === "user" && (
            <li className="dashboard"><Link to="/user">User Dashboard</Link></li>
          )}

            <div className="profile-con" ref={profileRef}>
              {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="profile-image"
                onClick={() => setShowProfile(!showProfile)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://res.cloudinary.com/dxavefpkp/image/upload/v1744712904/profiles/userID/filename/zzxpwvkcpfxebrwv5ofq.jpg";
                }}
              />
            ) : (
              <FaUserCircle
                className="profile-icon"
                onClick={() => setShowProfile(!showProfile)}
              />
            )}

            {showProfile && (
              <div className="profile-dropdown">
                {!user ? (
                  <div className="profile-dropdown-btn" onClick={() => navigate("/auth")}>
                    Login
                  </div>
                ) : (
                  <>
                    <div className="profile-dropdown-item">{user.email}</div>
                    <div
                      className="profile-dropdown-item"
                      onClick={() => {
                        setShowProfile(false);
                        setShowUpdateProfile(true);
                      }}
                    >
                      Update Profile
                    </div>
                    <div className="profile-dropdown-btn" onClick={handleLogout}>
                      Logout
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </ul>
      </nav>

      {showUpdateProfile && (
        <div className="popup-overlay" onClick={() => setShowUpdateProfile(false)}>
          <div
            className="profile-popup-container popup-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="popup-close-btn"
              onClick={() => setShowUpdateProfile(false)}
            >
              ✖
            </button>
            <UserProfile onClose={() => setShowUpdateProfile(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default CustomNavbar;
/*import React, { useState, useEffect } from "react";
import { auth, db } from "../../Firebase/Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaBars } from "react-icons/fa";
import ThemeToggle from "../components/ThemeToggle";
import "./Navbar.css";
import UserProfile from "../pages/UserProfile";

const CustomNavbar = () => {
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  const getCloudinaryURL = (photoURL) => {
    if (!photoURL || photoURL === "default") {
      return "https://res.cloudinary.com/dxavefpkp/image/upload/v1/user_profiles/default_profile.jpg";
    }

    // If it's already a full URL (custom Cloudinary or Google)
    if (photoURL.startsWith("http")) {
      return photoURL;
    }

    // Else, assume it's a Cloudinary public ID
    return `https://res.cloudinary.com/dxavefpkp/image/upload/v1/user_profiles/${photoURL}.jpg`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role);

            const firebasePhoto = userData.photoURL || "default";
            const finalProfilePic = getCloudinaryURL(firebasePhoto);
            setProfilePic(finalProfilePic);
          } else {
            console.warn("No such user document.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setRole(null);
        setProfilePic(null);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar-container">
        {(role === "admin" || role === "user") && (
          <button
            className="mobile-sidebar-toggle"
            onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="24"
              fill="white"
              className="bi bi-layout-sidebar-inset"
              viewBox="0 0 16 16"
            >
              <path d="M3 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H3zm0 1h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
              <path d="M4 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1V2H4z" />
            </svg>
          </button>
        )}

        <Link to="/" className="navbar-brand">
          <span className="text-warning">Cele</span>HUB
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <li><ThemeToggle /></li>
          {role === "admin" && (
            <li className="dashboard"><Link to="/admin">Admin Dashboard</Link></li>
          )}
          {role === "user" && (
            <li className="dashboard"><Link to="/user">User Dashboard</Link></li>
          )}

            <div className="profile-con">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="profile-image"
                  onClick={() => setShowProfile(!showProfile)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://res.cloudinary.com/dxavefpkp/image/upload/v1/user_profiles/default_profile.jpg";
                  }}
                />

              ) : (
                <FaUserCircle
                  className="profile-icon"
                  onClick={() => setShowProfile(!showProfile)}
                />
              )}

              {showProfile && (
                <div className="profile-dropdown">
                  {!user ? (
                    <div className="profile-dropdown-btn" onClick={() => navigate("/auth")}>
                      Login
                    </div>
                  ) : (
                    <>
                      <div className="profile-dropdown-item">{user.email}</div>
                      <div
                        className="profile-dropdown-item"
                        onClick={() => {
                          setShowProfile(false);
                          setShowUpdateProfile(true);
                        }}
                      >
                        Update Profile
                      </div>
                      <div className="profile-dropdown-btn" onClick={handleLogout}>
                        Logout
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
        </ul>
      </nav>

      {showUpdateProfile && (
        <div className="popup-overlay" onClick={() => setShowUpdateProfile(false)}>
          <div
            className="profile-popup-container popup-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="popup-close-btn"
              onClick={() => setShowUpdateProfile(false)}
            >
              ✖
            </button>
            <UserProfile onClose={() => setShowUpdateProfile(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default CustomNavbar;*/