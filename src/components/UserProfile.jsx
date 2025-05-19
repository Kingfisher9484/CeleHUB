import React, { useEffect, useState } from 'react';
import { getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPreviewUrl(data.profilePic || '');
      }
    };

    fetchUserData();
  }, [user]);

  const handleImageUpload = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('file', newImage);
    formData.append('upload_preset', 'user_profiles'); // Replace with your Cloudinary preset
    const res = await axios.post('https://api.cloudinary.com/v1_1/dxavefpkp/image/upload', formData); // Replace with your Cloudinary URL
    const imageUrl = res.data.secure_url;

    await updateDoc(doc(db, 'users', user.uid), { profilePic: imageUrl });
    setPreviewUrl(imageUrl);
    setNewImage(null);
    alert('Profile picture updated!');
  };

  const handleDeleteImage = async () => {
    await updateDoc(doc(db, 'users', user.uid), { profilePic: '' });
    setPreviewUrl('');
    alert('Profile picture deleted!');
  };

  const handleUpdateName = async () => {
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      alert('Name too short!');
      return;
    }
    await updateDoc(doc(db, 'users', user.uid), { firstName, lastName });
    alert('Name updated!');
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert(`Password reset link sent to ${user.email}`);
    } catch (error) {
      alert('Error sending reset email: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="profile-section">
      <h2 className="profile-h2">User Profile</h2>
      <div className="profile-pic-container">
        <div className="profile-pic-wrapper">
          <img className="profile-pic" src={previewUrl || '/default-avatar.png'} alt="Profile" />
        </div>
        <div className="edit-icon">
          📷
          <input className="img-input" name="file" type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
        </div>
        {previewUrl && (
          <button className="delete-btn" onClick={handleDeleteImage}>🗑️</button>
        )}
      </div>

      <div className="user-info">
        {userData && (
          <div className="details">
            <h4 className="profile-name"><strong>Name:</strong> {userData.firstName} {userData.lastName}</h4>
            <div className="name-fields">
              <input className="inpt" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
              <input className="inpt" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
              <button className="update-name-btn" onClick={handleUpdateName}>Update Name</button>
            </div>
            <p><strong>Email:</strong> {userData.email}</p>
            <button className="reset-btn" onClick={handleResetPassword}>Reset Password</button>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Created At:</strong> {userData.createdAt?.toDate().toLocaleString()}</p>
          </div>
        )}

        {newImage && (
          <button className="upload-btn" onClick={handleImageUpload}>Upload Image</button>
        )}

        <div className="profile-dropdown-btn" onClick={handleLogout}>Logout</div>
      </div>
    </div>
  );
};

export default UserProfile;
