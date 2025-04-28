import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');


  useEffect(() => {
    const fetchUserData = async () => {
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
  }, [user.uid]);

  const handleImageUpload = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('file', newImage);
    formData.append('upload_preset', 'user_profiles'); // 🔁 Replace
    const res = await axios.post('https://api.cloudinary.com/v1_1/dxavefpkp/image/upload', formData); // 🔁 Replace
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
  
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
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
          <input className='img-input' name="file" type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
          {/*<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" class="img-input-icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>*/}
        </div>
        {previewUrl && <button className="delete-btn" onClick={handleDeleteImage}>🗑️</button>}
      </div>
      <div className="user-info">


        {userData && (
          <div className="details">
            <h4 className="profile-name"><strong>Name:</strong> {userData.firstName}{userData.lastName}</h4>
            <div className="name-fields">
              <input className="inpt" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
              <input className="inpt" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
              <button className="update-name-btn" onClick={handleUpdateName}>Update Name</button>
            </div>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Created At:</strong> {userData.createdAt?.toDate().toLocaleString()}</p>
          </div>
        )}
        <div className="profile-dropdown-btn" onClick={handleLogout}>
          Logout
        </div>
        {newImage && <button className="upload-btn" onClick={handleImageUpload}>Upload Image</button>}
      </div>
    </div>

  );
};

export default UserProfile;
/* <div className="user-profile-backdrop" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
       </div>
   </div>  */