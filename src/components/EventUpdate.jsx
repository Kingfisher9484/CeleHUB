import React, { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import axios from "axios";
import "./EventUpdate.css";

const EventUpdate = ({ event, onClose, onUpdate }) => {
  const [updatedEvent, setUpdatedEvent] = useState({ ...event });
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setUpdatedEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "event_card_img"); // Replace with your preset
    setUploading(true);

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dxavefpkp/image/upload", // Replace cloud_name
        formData
      );
      setUpdatedEvent((prev) => ({
        ...prev,
        mediaUrl: res.data.secure_url,
      }));
    } catch (err) {
      alert("Image upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const ref = doc(db, "events", updatedEvent.id);
      await updateDoc(ref, {
        eventName: updatedEvent.eventName,
        type: updatedEvent.type,
        range: updatedEvent.range,
        price: Number(updatedEvent.price),
        description: updatedEvent.description,
        mediaUrl: updatedEvent.mediaUrl || "",
      });
      alert("✅ Event updated successfully!");
      onUpdate(); // refetch or close
    } catch (error) {
      console.error("Error updating event:", error);
      alert("❌ Failed to update event");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this event?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "events", updatedEvent.id));
      alert("🗑️ Event deleted successfully!");
      onUpdate(); // refetch or close
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("❌ Failed to delete event");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>
        <h2>Edit Event</h2>

        {updatedEvent.imageUrl && (
          <img
            src={updatedEvent.mediaUrl}
            alt="Event"
            style={{ width: "100%", borderRadius: "0.5rem", marginBottom: "1rem" }}
          />
        )}
        <input className="update-input" type="file" onChange={handleImageUpload} disabled={uploading} />
        <div className="popup-form">
          <input
            className="update-input"
            type="text"
            value={updatedEvent.eventName}
            onChange={(e) => handleChange("eventName", e.target.value)}
            placeholder="Event Name"
          />
          <input
            className="update-input"
            type="text"
            value={updatedEvent.type}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="Type"
          />
          <input
            className="update-input"
            type="text"
            value={updatedEvent.range}
            onChange={(e) => handleChange("range", e.target.value)}
            placeholder="Range"
          />
          <input
            className="update-input"
            type="number"
            value={updatedEvent.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="Price"
          />
          <textarea
            className="update-input"
            value={updatedEvent.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
            rows={4}
          ></textarea>

          <div style={{ marginTop: "1rem" }}>
            <button className="event-update-btn" onClick={handleUpdate} disabled={uploading}>
              Update
            </button>
            <button className="event-update-delete-btn" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventUpdate;
/* EventUpdate.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import "./EventUpdate.css";

const EventUpdate = () => {
  const [events, setEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (eventId, field, value) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === eventId ? { ...event, [field]: value } : event))
    );
  };

  const handleUpdate = async (eventId) => {
    const eventToUpdate = events.find((event) => event.id === eventId);
    if (!eventToUpdate) return;

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        eventName: eventToUpdate.eventName,
        type: eventToUpdate.type,
        range: eventToUpdate.range,
        price: Number(eventToUpdate.price),
        description: eventToUpdate.description,
        imageUrl: eventToUpdate.imageUrl,
      });
      alert("Event updated successfully!");
      setEditingEventId(null);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents(events.filter((event) => event.id !== eventId));
      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="event-update-container">
      <h3 className="event-update-heading">Update Events</h3>
      <div className="event-grid">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <img
                src={event.imageUrl || "/placeholder.jpg"}
                alt={event.eventName}
                className="event-image"
              />
              <h2>{event.eventName}</h2>
              <p className="event-meta">
                {event.type} | {event.range} | ₹{event.price}
              </p>
              {editingEventId === event.id && (
                <div className="event-edit-form">
                  <input
                    type="text"
                    value={event.eventName}
                    onChange={(e) => handleInputChange(event.id, "eventName", e.target.value)}
                  />
                  <input
                    type="text"
                    value={event.type}
                    onChange={(e) => handleInputChange(event.id, "type", e.target.value)}
                  />
                  <input
                    type="text"
                    value={event.range}
                    onChange={(e) => handleInputChange(event.id, "range", e.target.value)}
                  />
                  <input
                    type="number"
                    value={event.price}
                    onChange={(e) => handleInputChange(event.id, "price", e.target.value)}
                  />
                  <textarea
                    value={event.description}
                    onChange={(e) => handleInputChange(event.id, "description", e.target.value)}
                  />
                  <input
                    type="text"
                    value={event.imageUrl}
                    onChange={(e) => handleInputChange(event.id, "imageUrl", e.target.value)}
                    placeholder="Paste image URL"
                  />
                </div>
              )}
              <div className="event-buttons">
                {editingEventId === event.id ? (
                  <>
                    <button onClick={() => handleUpdate(event.id)}>Update</button>
                    <button onClick={() => setEditingEventId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingEventId(event.id)}>Edit</button>
                    <button onClick={() => handleDelete(event.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventUpdate;*/
/** AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import EventUpdate from "./EventUpdate";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const eventList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setIsPopupOpen(true);
  };

  return (
    <div className="admin-dashboard">
      <h2>Manage Events</h2>
      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <img src={event.imageUrl} alt={event.eventName} className="event-image" />
            <h2>{event.eventName}</h2>
            <p>{event.type} | {event.range} | ₹{event.price}</p>
            <button onClick={() => handleEditClick(event)}>Edit</button>
          </div>
        ))}
      </div>

      {isPopupOpen && selectedEvent && (
        <EventUpdate
          event={selectedEvent}
          onClose={() => setIsPopupOpen(false)}
          onRefresh={fetchEvents}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
 */