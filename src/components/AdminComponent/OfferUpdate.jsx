import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "../../../Firebase/Firebase";
import axios from "axios";
import "./OfferUpdate.css";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxavefpkp/upload";
const Offer_UPLOAD_PRESET = "offer_bg_img";

const OfferUpdate = () => {
    const [offers, setOffers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [offer, setOffer] = useState({
        type: "",
        range: "",
        discount: "",
        fromDate: "",
        uptoDate: "",
        offerName: "",
        description: "",
        backgroundUrl: "",
    });

    const resetOfferState = () => {
        setOffer({
            type: "",
            range: "",
            discount: "",
            fromDate: "",
            uptoDate: "",
            offerName: "",
            description: "",
            backgroundUrl: "",
        });
        setEditingId(null);
    };

    const fetchOffers = async () => {
        try {
            const offerDocRef = doc(db, "adminSettings", "offer");
            const offerDocSnap = await getDoc(offerDocRef);

            if (offerDocSnap.exists()) {
                const dataCollectionRef = collection(
                    db,
                    "adminSettings",
                    "offer",
                    "data"
                );
                const snapshot = await getDocs(dataCollectionRef);
                const offersList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOffers(offersList);
            } else {
                console.error("Offer document does not exist.");
            }
        } catch (error) {
            console.error("Error fetching offers:", error);
        }
    };

    // Fetch offers on mount
    useEffect(() => {
        fetchOffers();
    }, []);

    // Automatically delete expired offers
    useEffect(() => {
        const checkAndDeleteExpiredOffers = async () => {
            const today = new Date().toISOString().split("T")[0];
            const snapshot = await getDocs(
                collection(db, "adminSettings", "offer", "data")
            );
            snapshot.docs.forEach(async (docSnap) => {
                const data = docSnap.data();
                if (data.uptoDate < today) {
                    await deleteDoc(
                        doc(db, "adminSettings", "offer", "data", docSnap.id)
                    );
                }
            });
            fetchOffers();
        };

        const interval = setInterval(
            checkAndDeleteExpiredOffers,
            24 * 60 * 60 * 1000
        );
        checkAndDeleteExpiredOffers(); // Also run on mount

        return () => clearInterval(interval);
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", Offer_UPLOAD_PRESET);

        try {
            const response = await axios.post(CLOUDINARY_URL, formData);
            if (response.data.secure_url) {
                setOffer((prev) => ({
                    ...prev,
                    backgroundUrl: response.data.secure_url,
                }));
            }
        } catch (err) {
            alert("❌ Image upload failed");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (offer.discount > 50) return alert("⚠️ Discount must be ≤ 50%");
        if (!offer.backgroundUrl) return alert("Please upload an image");

        try {
            if (editingId) {
                await updateDoc(
                    doc(db, "adminSettings", "offer", "data", editingId),
                    offer
                );
                alert("✅ Offer updated");
            } else {
                await addDoc(collection(db, "adminSettings", "offer", "data"), offer);
                alert("✅ Offer published");
            }
            resetOfferState();
            fetchOffers();
        } catch (err) {
            alert("❌ Failed to save offer");
        }
    };

    const handleEdit = (o) => {
        setOffer(o);
        setEditingId(o.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this offer?")) {
            await deleteDoc(doc(db, "adminSettings", "offer", "data", id));
            fetchOffers();
        }
    };

    return (
        <div className="add-offer-div">
            <h3>{editingId ? "Update Offer" : "Add Offer"}</h3>
            <form className="add-offer-form" onSubmit={handleSave}>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <select
                    value={offer.type}
                    onChange={(e) => setOffer({ ...offer, type: e.target.value })}
                    required
                >
                    <option value="">Select Event Type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Festival">Festival</option>
                </select>

                <select
                    value={offer.range}
                    onChange={(e) => setOffer({ ...offer, range: e.target.value })}
                    required
                >
                    <option value="">Select Range</option>
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="Luxury">Luxury</option>
                </select>

                <input
                    type="number"
                    placeholder="Discount (%)"
                    value={offer.discount}
                    onChange={(e) =>
                        setOffer({ ...offer, discount: Number(e.target.value) })
                    }
                    max={50}
                    required
                />

                <input
                    type="date"
                    value={offer.fromDate}
                    onChange={(e) => setOffer({ ...offer, fromDate: e.target.value })}
                    required
                />

                <input
                    type="date"
                    value={offer.uptoDate}
                    onChange={(e) => setOffer({ ...offer, uptoDate: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="Offer Name"
                    value={offer.offerName}
                    onChange={(e) => setOffer({ ...offer, offerName: e.target.value })}
                    required
                />

                <input
                    placeholder="Description"
                    value={offer.description}
                    onChange={(e) =>
                        setOffer({ ...offer, description: e.target.value })
                    }
                    required
                />

                {offer.backgroundUrl && (
                    <img
                        src={offer.backgroundUrl}
                        alt="preview"
                        style={{
                            width: "100%",
                            marginTop: 10,
                            borderRadius: 8,
                        }}
                    />
                )}

                <button type="submit">
                    {editingId ? "🔄 Update Offer" : "📢 Publish Offer"}
                </button>
            </form>

            <div className="offer-list-wrapper">
                {offers.length === 0 && (
                    <p style={{ color: "#000" }}>No offers found.</p>
                )}
                {offers.map((o) => (
                    <div
                        key={o.id}
                        className="offer-container"
                        style={{
                            backgroundImage: `url(${o.backgroundUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            padding: "20px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            color: "#fff",
                        }}
                    >
                        <h2>{o.offerName}</h2>
                        <p>{o.description}</p>
                        <p>
                            🎉 {o.discount}% OFF on {o.type} events from{" "}
                            {o.fromDate} to {o.uptoDate}
                        </p>
                        <button onClick={() => handleEdit(o)}>✏️ Edit</button>
                        <button onClick={() => handleDelete(o.id)}>🗑️ Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OfferUpdate;
