import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./UserSetting.css";
import ThemeToggle from "../components/ThemeToggle";

const UserSetting = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: "en",
    timezone: "IST",
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (currentUser) {
      console.log("Saving settings for UID:", currentUser.uid, settings);
      alert("Settings saved (simulated)");
      // Firestore saving logic can go here
    } else {
      alert("User not logged in.");
    }
  };

  if (!currentUser) return <p>Please login to access your settings.</p>;

  return (
    <div className="user-settings">
      <h2>Settings for {currentUser.email}</h2>

      <div className="setting-row">
        <label>Dark Mode</label>
        <ThemeToggle />
      </div>

      <div className="setting-row">
        <label>Notifications</label>
        <button onClick={() => handleToggle("notifications")}>
          {settings.notifications ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="setting-row">
        <label>Language</label>
        <select
          value={settings.language}
          onChange={(e) => handleChange("language", e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div className="setting-row">
        <label>Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
        >
          <option value="IST">IST</option>
          <option value="GMT">GMT</option>
          <option value="EST">EST</option>
        </select>
      </div>

      <button className="save-btn" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
};

export default UserSetting;
