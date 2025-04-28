import React, { useState, useEffect } from "react";
import { db, auth } from "../../Firebase/Firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

import axios from "axios";
import "./Stories.css";

export default function Stories() {
    const [stories, setStories] = useState([]);
    const [media, setMedia] = useState(null);
    const [duration, setDuration] = useState("1day");
    const [place, setPlace] = useState("");
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showStoryPopup, setShowStoryPopup] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);

    const isAdmin = auth?.currentUser?.email?.includes("admin"); // Adjust logic for role check

    const fetchStories = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "stories"));
            const now = Date.now();

            const validStories = [];
            querySnapshot.forEach((docSnap) => {
                const story = docSnap.data();
                const durationMs =
                    story.duration === "1day"
                        ? 86400000
                        : story.duration === "3days"
                            ? 3 * 86400000
                            : 7 * 86400000;

                const isExpired = now - story.uploadedAt > durationMs;

                if (!isExpired) {
                    validStories.push({ id: docSnap.id, ...story });
                } else {
                    // Optional: auto-remove expired stories from Firestore
                    deleteDoc(doc(db, "stories", docSnap.id));
                    // Optional: delete from Cloudinary (you need backend/cloud function)
                }
            });

            setStories(validStories);
        } catch (err) {
            console.error("Failed to fetch stories:", err);
        }
    };


    const handleUpload = async () => {
        if (!media || !place) return alert("Select media and fill in place");

        const formData = new FormData();
        formData.append("file", media);
        formData.append("upload_preset", "celehub_stories");

        try {
            const res = await axios.post("https://api.cloudinary.com/v1_1/dxavefpkp/auto/upload", formData);
            const uploadedUrl = res.data.secure_url;

            const storyData = {
                url: uploadedUrl,
                place,
                uploadedAt: Date.now(),
                duration,
                user: auth.currentUser.uid,
            };

            await addDoc(collection(db, "stories"), storyData);
            alert("Story upload successfully!");
            setShowUploadPopup(false);
            fetchStories();
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Try again.");
        }
    };


    useEffect(() => {
        fetchStories();
    }, []);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (showStoryPopup) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 30) {
                        nextStory();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showStoryPopup]);

    const nextStory = () => {
        const currentIndex = stories.findIndex(s => s.id === showStoryPopup.id);
        const nextIndex = currentIndex + 1;
        if (nextIndex < stories.length) {
            setShowStoryPopup(stories[nextIndex]);
        } else {
            setShowStoryPopup(null);
        }
    };

    return (
        <div className="stories-container">
            <h4 className="story-header">Latest Events</h4>
            <div className="stories-row">
                {isAdmin && (
                    <div>
                        <div className="story-circle-border">
                            <div className="story-circle upload-circle" onClick={() => setShowUploadPopup(true)}>
                                +
                            </div>
                        </div><p className="story-place">Add story</p>
                    </div>
                )}
                {stories.map((story, index) => (
                    <div>
                        <div className="story-circle-border">
                            <div key={index} className="story-circle" onClick={() => setShowStoryPopup(story)}>
                                <img src={story.url} alt="story" />
                            </div>
                        </div><p className="story-place">{story.place}</p>
                    </div>
                ))}
            </div>

            {/* Upload Popup */}
            {showUploadPopup && (
                <div className="story-popup">
                    <div className="popup-content">
                        <h4>Upload Story</h4>
                        {previewURL && (
                            <div className="story-preview">
                                {media?.type.startsWith("image/") ? (
                                    <img src={previewURL} alt="Preview" className="media-preview" />
                                ) : (
                                    <video src={previewURL} controls className="media-preview" />
                                )}
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setMedia(file);
                                if (file) {
                                    setPreviewURL(URL.createObjectURL(file));
                                }
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Place"
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                        />
                        {place.length > 0 && place.length < 3 || place.length > 15 && (
                            <p className="error-text">Place must be at least 3 and less than 15 characters.</p>
                        )}
                        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="1day">1 Day</option>
                            <option value="3days">3 Days</option>
                            <option value="1week">1 Week</option>
                        </select>
                        <button onClick={handleUpload} disabled={place.length < 3 || place.length > 15}>
                            Upload
                        </button>
                        <button onClick={() => setShowUploadPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Story Viewer Popup */}
            {showStoryPopup && (
                <div className="open-story-popup" onClick={() => setShowStoryPopup(null)}>
                    <div className="open-popup-content animated-story-slide">
                        <div className="story-progress-bar">
                            <div
                                className="story-progress"
                                style={{ width: `${(progress / 30) * 100}%` }}
                            ></div>
                        </div>

                        {showStoryPopup.url.endsWith(".mp4") ? (
                            <video
                                src={showStoryPopup.url}
                                autoPlay
                                muted
                                playsInline
                                onEnded={nextStory}
                            />
                        ) : (
                            <img src={showStoryPopup.url} alt="story" />
                        )}
                        <div className="story-meta">
                            <span className="story-duration">{showStoryPopup.duration}</span>
                            <span className="story-place">{showStoryPopup.place}</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
