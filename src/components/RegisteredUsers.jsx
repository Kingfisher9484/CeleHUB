import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./RegisteredUsers.css";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const admins = users.filter((u) => u.role === "admin");
  const normalUsers = users.filter((u) => u.role === "user");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = (data, title) => {
    const doc = new jsPDF();
    doc.text(title, 20, 10);
    const tableData = data.map((user) => [
      user.username || "N/A",
      user.email || "N/A",
      user.role || "N/A",
      user.createdAt
        ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
        : "N/A",
    ]);
    doc.autoTable({
      head: [["Username", "Email", "Role", "Registered Date"]],
      body: tableData,
    });
    doc.save(`${title}.pdf`);
  };

  // ✅ Correct filtering based on the right search inputs
  const filteredAdmins = admins.filter((user) =>
    adminSearch.trim() === ""
      ? true
      : user?.username?.toLowerCase().includes(adminSearch.toLowerCase())
  );
  
  const filteredUsers = normalUsers.filter((user) =>
    userSearch.trim() === ""
      ? true
      : user?.username?.toLowerCase().includes(userSearch.toLowerCase())
  );
  

  return (
    <div className="registered-users-container">
      {/* Admins Table */}
      <section className="user-table-section">
        <h2>Admin Users</h2>
        <p className="count-text">Total Admins: {filteredAdmins.length}</p>   {/* 👈 add this */}
        <div className="search-download-bar">
          <input
            type="text"
            placeholder="Search Admins..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="search-input"
          />
          <div className="action-buttons">
            <button onClick={handlePrint} className="print-btn">
              Print
            </button>
            <button
              onClick={() => handleDownloadPDF(filteredAdmins, "Admin Users")}
              className="pdf-btn"
            >
              Download PDF
            </button>
          </div>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Username</th>
              <th>Role</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((user) => (
              <tr key={user.id}>
                <td>
                  <img
                    src={user.profilePic ||  "/default-profile.png"}
                    alt="Profile"
                    className="user-profile-pic"
                  />
                </td>
                <td>{user.username || "No username"}</td>
                <td>{user.role || "No role"}</td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Normal Users Table */}
      <section className="user-table-section">
        <h2>Normal Users</h2>
        <p className="count-text">Total Users: {filteredUsers.length}</p>   {/* 👈 add this */}
        <div className="search-download-bar">
          <input
            type="text"
            placeholder="Search Users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="search-input"
          />
          <div className="action-buttons">
            <button onClick={handlePrint} className="print-btn">
              Print
            </button>
            <button
              onClick={() => handleDownloadPDF(filteredUsers, "Normal Users")}
              className="pdf-btn"
            >
              Download PDF
            </button>
          </div>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Username</th>
              <th>Role</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <img
                    src={user.profilePicURL || user.profilePic || "/default-profile.png"}
                    alt="Profile"
                    className="user-profile-pic"
                  />
                </td>
                <td>{user.username || "No username"}</td>
                <td>{user.role || "No role"}</td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default RegisteredUsers;
