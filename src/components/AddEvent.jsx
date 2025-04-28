import React, { useState } from "react";
import { db, auth } from "../../Firebase/Firebase"; // adjust path if needed
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import axios from "axios";
import "./AddEvent.css";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxavefpkp/upload";
const Event_UPLOAD_PRESET = "event_card_img";

const AddEventForm = ({ fetchEvents }) => {
  const [eventName, setEventName] = useState("");
  const [type, setType] = useState("");
  const [range, setRange] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setDemoMode(false);
    }
  };

  const handleShowDemo = (e) => {
    e.preventDefault();
    if (!mediaFile) {
      alert("Please choose a file first!");
      return;
    }
    setDemoMode(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventName || !type || !range || !description || !price || !mediaFile) {
      alert("Please fill in all fields and select a file!");
      return;
    }

    setLoading(true);
    let mediaUrl = "";

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be signed in to add events.");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();

      if (!userData || userData.role !== "admin") {
        alert("You do not have permission to add events.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("upload_preset", Event_UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_URL, formData);
      mediaUrl = response.data.secure_url;

      await addDoc(collection(db, "events"), {
        eventName,
        type,
        range,
        description,
        price: Number(price),
        mediaUrl,
        createdAt: serverTimestamp(),
      });

      alert("✅ Event added successfully!");

      setEventName("");
      setType("");
      setRange("");
      setDescription("");
      setPrice("");
      setMediaFile(null);
      setMediaPreview(null);
      setDemoMode(false);
      fetchEvents();
    } catch (error) {
      console.error("❌ Upload failed:", error.message);
      alert("Failed to upload event: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="admin-addevent-container">
      <h3 className="admin-addevent-container-h3">Add New Event</h3>
      <form className="admin-addevent-form-grid" onSubmit={handleAddEvent}>
        <div className="admin-addevent-input-group">
          <label className="admin-addevent-input-label">Upload Image/Video</label>
          <input
            className="admin-addevent-input"
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
          />
        </div>

        <div className="admin-addevent-input-group">
          <label className="admin-addevent-input-label">Event Name</label>
          <input
            className="admin-addevent-input"
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        <div className="admin-addevent-input-group">
          <label className="admin-addevent-input-label">Event Type</label>
          <select
            className="admin-addevent-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Event Type</option>
            <option value="Wedding">Wedding</option>
            <option value="Engagement">Engagement</option>
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Festival">Festival</option>
          </select>
        </div>

        <div className="admin-addevent-input-group">
          <label className="admin-addevent-input-label">Range</label>
          <select
            className="admin-addevent-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="">Select Range</option>
            <option value="Normal">Normal</option>
            <option value="Medium">Medium</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <div className="admin-addevent-input-group">
          <label className="admin-addevent-input-label">Description</label>
          <input
            className="admin-addevent-input"
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="admin-addevent-input-group">
          <label className="admin-addevent-input-label">Price</label>
          <input
            className="admin-addevent-input"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
        <button className="admin-addevent-btn demo" onClick={handleShowDemo} type="button">
            🎨 Show Demo
          </button>
          <button className="admin-addevent-rst" type="reset">
            Reset
          </button>
        </div>
        <button className="admin-addevent-btn" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Add Event"}
          </button>
      </form>

      {/* 🎥 Demo Preview */}
      {demoMode && mediaPreview && (
        <div className="admin-event-demo-card">
          <h3>🎉 Event Preview</h3>
          {mediaFile.type.startsWith("image/") ? (
            <img src={mediaPreview} alt="preview" className="demo-media" />
          ) : (
            <video controls className="demo-media">
              <source src={mediaPreview} type={mediaFile.type} />
              Your browser does not support the video tag.
            </video>
          )}
          <p><strong>📌 Name:</strong> {eventName || "N/A"}</p>
          <p><strong>📅 Type:</strong> {type || "N/A"}</p>
          <p><strong>🔖 Range:</strong> {range || "N/A"}</p>
          <p><strong>📝 Description:</strong> {description || "N/A"}</p>
          <p><strong>💰 Price:</strong> ₹{price || "0"}</p>
        </div>
      )}
    </div>
  );
};

export default AddEventForm;
