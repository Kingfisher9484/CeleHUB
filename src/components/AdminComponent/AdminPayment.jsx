import React, { useEffect, useState } from 'react';
import { db } from '../../../Firebase/Firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import './AdminPayment.css';

const CLOUDINARY_UPLOAD_PRESET = 'admin_payment';
const CLOUDINARY_CLOUD_NAME = 'dxavefpkp';

const AdminPayment = () => {
  const [paymentData, setPaymentData] = useState({
    paymentNumber: '',
    accountNumber: '',
    upiId: '',
  });
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [allPayments, setAllPayments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const fetchPayments = async () => {
    const snapshot = await getDocs(collection(db, 'adminPayment'));
    const payments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAllPayments(payments);
  };

  const handleUpload = async () => {
    if (allPayments.length > 0) {
      alert('Only one payment record is allowed. Please edit or delete the existing one.');
      return;
    }

    if (!image) return alert('Please select an image.');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();

      const newPayment = {
        imageUrl: data.secure_url,
        paymentNumber: paymentData.paymentNumber,
        accountNumber: paymentData.accountNumber,
        upiId: paymentData.upiId,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'adminPayment'), newPayment);
      setPaymentData({ paymentNumber: '', accountNumber: '', upiId: '' });
      setImage(null);
      fetchPayments();
    } catch (error) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id) => {
    const item = allPayments.find((p) => p.id === id);
    setPaymentData({
      paymentNumber: item.paymentNumber,
      accountNumber: item.accountNumber,
      upiId: item.upiId,
    });
    setImage(null); // clear image on edit
    setEditingId(id);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    let imageUrl = allPayments.find(p => p.id === editingId)?.imageUrl;

    // If a new image is selected, upload it
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await res.json();
        imageUrl = data.secure_url;
      } catch (error) {
        alert('Image update failed.');
        return;
      }
    }

    await updateDoc(doc(db, 'adminPayment', editingId), {
      paymentNumber: paymentData.paymentNumber,
      accountNumber: paymentData.accountNumber,
      upiId: paymentData.upiId,
      imageUrl,
      updatedAt: Timestamp.now(),
    });

    setEditingId(null);
    setPaymentData({ paymentNumber: '', accountNumber: '', upiId: '' });
    setImage(null);
    fetchPayments();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteDoc(doc(db, 'adminPayment', id));
      fetchPayments();
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="admin-container">
      <h2 className="admin-title"> Admin Payment Manager</h2>

      {/* Form is only shown when editing OR no existing payment card */}
      {(editingId || allPayments.length === 0) && (
        <div className="form-box">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <input
            type="text"
            name="paymentNumber"
            placeholder="Payment Number"
            value={paymentData.paymentNumber}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={paymentData.accountNumber}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="upiId"
            placeholder="UPI ID"
            value={paymentData.upiId}
            onChange={handleInputChange}
          />

          {editingId ? (
            <button className="btn update-btn" onClick={handleUpdate}>
              Update Info
            </button>
          ) : (
            <button className="btn upload-btn" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Payment Info'}
            </button>
          )}
        </div>
      )}

      <div className="cards-wrapper">
        {allPayments.map((p) => (
          <div className="card fade-in" key={p.id}>
            <img src={p.imageUrl} alt="scanner" />
            <p><strong>Payment:</strong> {p.paymentNumber}</p>
            <p><strong>Account:</strong> {p.accountNumber}</p>
            <p><strong>UPI:</strong> {p.upiId}</p>
            <div className="card-buttons">
              <button className="editpayment" onClick={() => handleEdit(p.id)}>✏️ Edit</button>
              <button className="deletepayment" onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPayment;
