import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../Firebase/Firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import './UpdatePasskey.css'; // Create styling as needed

export default function UpdatePasskey() {
  const [passkey, setPasskey] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [updatedByName, setUpdatedByName] = useState('');
  const [updatedByEmail, setUpdatedByEmail] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const docRef = doc(db, 'adminConfig', 'adminPasskey');

  useEffect(() => {
    const fetchPasskey = async () => {
      setLoading(true);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPasskey(data.passkey || '');
        setUpdatedByName(data.updatedByName || '');
        setUpdatedByEmail(data.updatedByEmail || '');
        setUpdatedAt(data.updatedAt?.toDate().toLocaleString() || '');
      }
      setLoading(false);
    };
    fetchPasskey();
  }, []);

  const handleUpdate = async () => {
    if (!passkey.trim()) return alert('Passkey cannot be empty');

    const data = {
      passkey: passkey.trim(),
      updatedByName: currentUser?.displayName || 'Admin',
      updatedByEmail: currentUser?.email || '',
      updatedAt: new Date(),
    };

    await setDoc(docRef, data, { merge: true });
    setEditMode(false);
    alert('Admin Passkey updated!');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="update-passkey-container">
      <h2>Update Admin Passkey</h2>
      <div className="passkey-box">
        <label>Admin Passkey:</label>
        <input
          type="text"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          disabled={!editMode}
        />
        <div className="update-actions">
          {!editMode ? (
            <button onClick={() => setEditMode(true)}>Update</button>
          ) : (
            <button onClick={handleUpdate}>Save</button>
          )}
        </div>
      </div>
      <div className="update-meta">
        <p><strong>Last Updated By:</strong> {updatedByName}</p>
        <p><strong>Email:</strong> {updatedByEmail}</p>
        <p><strong>Updated At:</strong> {updatedAt}</p>
      </div>
    </div>
  );
}
