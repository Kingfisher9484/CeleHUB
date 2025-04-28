import React, { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/Firebase";
import { collection, getDoc, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import SearchBar from "../components/SearchBar"; // Import the SearchBar component
import { useNavigate } from "react-router-dom";
import { Search, User, Settings } from "lucide-react";
/*
<Search size={24} />
<User size={24} />
<Settings size={24} />*/
import "./AdminDashboard.css";
import NotificationBell from "../components/NotificationBell"; // Import notification component
import Stories from "../components/Stories";
import axios from "axios";
import EventUpdate from "../components/EventUpdate";
import "../components/EventUpdate.css";
import "./../components/SideBar.css";
import "./../components/SearchBar.css"
//import { Timestamp } from "firebase/firestore";

export default function AdminDashboard() {
  const [eventName, setEventName] = useState("");
  const [type, setType] = useState("");
  const [range, setRange] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("addEvent"); // Default section to display
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null); // Track which event is being edited
  const [bookings, setBookings] = useState({ today: [], yesterday: [], older: [] });
  const navigate = useNavigate();
  const [offer, setOffer] = useState({
    type: "",
    range: "",
    discount: "",
    fromDate: "",
    uptoDate: "",
    offerName: "",
    description: "",
    backgroundUrl: "",
    id: null,
  });
  const [offers, setOffers] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  //const [filteredEvents, setFilteredEvents] = useState([]);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxavefpkp/upload";
  const Event_UPLOAD_PRESET = "event_card_img";
  const Offer_UPLOAD_PRESET = "offer_bg_img"; // replace with your Cloudinary preset

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setDemoMode(false); // reset demo so they click again
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

  // Inside your component
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

      // 🔐 Check if user is admin
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();

      if (!userData || userData.role !== "admin") {
        alert("You do not have permission to add events.");
        setLoading(false);
        return;
      }

      // ☁️ Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("upload_preset", Event_UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_URL, formData);
      mediaUrl = response.data.secure_url;

      // ✅ Add event to Firestore
      await addDoc(collection(db, "events"), {
        eventName,
        type,
        range,
        description,
        price: Number(price),
        mediaUrl,
        createdAt: serverTimestamp(), // ⏰ use server timestamp!
      });

      alert("✅ Event added successfully!");

      // 🧹 Reset form
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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const fetchedBookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sorting logic
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        const sortedBookings = { today: [], yesterday: [], older: [] };
        fetchedBookings.forEach(booking => {
          const createdDate = new Date(booking.createdDate).toDateString();
          if (createdDate === today) {
            sortedBookings.today.push(booking);
          } else if (createdDate === yesterday) {
            sortedBookings.yesterday.push(booking);
          } else {
            sortedBookings.older.push(booking);
          }
        });

        setBookings(sortedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  // Function to handle button click
  const handleOpenBooking = async (bookingId) => {
    try {
      // Update "viewedByAdmin" in Firestore
      //const bookingRef = doc(db, "bookings", bookingId);
      //await updateDoc(bookingRef, { viewedByAdmin: true });

      // Navigate to userOrder.jsx with booking ID
      navigate(`/userOrder/${bookingId}`);
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };


  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "adminSettings", "offer", "data")
        );
        const offersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOffers(offersList);
      } catch (error) {
        console.error("Error fetching offers:", error);
        alert("Failed to fetch offers");
      }
    };
    fetchOffers();
  }, []);


  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", Offer_UPLOAD_PRESET); // ✅ Your unsigned preset
    // ✅ Use the correct Cloudinary API URL
    //const CLOUDINARY_API = "https://api.cloudinary.com/v1_1/dxavefpkp/image/upload"; // Replace with your actual cloud name

    try {
      const response = await axios.post(CLOUDINARY_API, formData);
      if (response.data.secure_url) {
        setOffer((prev) => ({ ...prev, backgroundUrl: response.data.secure_url }));
        alert("✅ Image uploaded successfully");
      } else {
        alert("⚠️ Upload failed — no URL returned");
        console.error(response.data);
      }
    } catch (err) {
      alert("❌ Image upload failed");
      console.error(err);
    }
  };

  const handlePublishOffer = async (e) => {
    e.preventDefault();

    if (offer.discount > 50) {
      alert("Discount must be less than or equal to 50%");
      return;
    }

    if (!offer.backgroundUrl) {
      alert("Please upload an image before publishing");
      return;
    }

    try {
      const offerToSave = {
        type: offer.type,
        range: offer.range,
        discount: offer.discount,
        fromDate: offer.fromDate,
        uptoDate: offer.uptoDate,
        offerName: offer.offerName,
        description: offer.description,
        backgroundUrl: offer.backgroundUrl,
      };

      const docRef = await addDoc(
        collection(db, "adminSettings", "offer", "data"),
        offerToSave
      );

      alert("✅ Offer published successfully!");

      setOffer({
        type: "",
        range: "",
        discount: "",
        fromDate: "",
        uptoDate: "",
        offerName: "",
        description: "",
        backgroundUrl: "",
        id: null,
      });
      setPreviewImage("");
    } catch (error) {
      console.error("❌ Failed to publish offer", error);
      alert("Failed to publish offer");
    }
  };


  const handleUpdateOffer = async () => {
    try {
      const docRef = doc(db, "adminSettings", "offer", "data", offer.id);
      await updateDoc(docRef, offer);
      alert("Offer updated");
    } catch (error) {
      console.error("Failed to update offer", error);
      alert("Failed to update offer");
    }
  };

  const handleDeleteOffer = async () => {
    try {
      const docRef = doc(db, "adminSettings", "offer", "data", offer.id);
      await deleteDoc(docRef);
      alert("Offer deleted");
      setOffer({
        type: "",
        range: "",
        discount: "",
        fromDate: "",
        uptoDate: "",
        offerName: "",
        description: "",
        backgroundUrl: "",
        id: null,
      });
      setPreviewImage("");
    } catch (error) {
      console.error("Failed to delete offer", error);
      alert("Failed to delete offer");
    }
  };
  //sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarVisible(true);  // Always show on desktop
      } else {
        setSidebarVisible(false); // Start hidden on mobile
      }
    };

    handleResize(); // Run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const toggle = () => setSidebarVisible((prev) => !prev);
    window.addEventListener("toggleSidebar", toggle);
    return () => window.removeEventListener("toggleSidebar", toggle);
  }, []);

 
  return (
    <div className="admin-main-dash">

      <div className="admin-home-container">
        {/* Sidebar: Always render it, but control visibility via class */}
        <aside
          className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'} ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>

          <ul className={`sidebar-header ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
            <li
              className="sidebar-toggle"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              {sidebarExpanded ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
                <path fillRule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
              </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708" />
                <path fillRule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708" />
              </svg>}
            </li>
          </ul>

          <ul className="sidebar-menu">
            <li className="sidebar-li" onClick={() => setIsSearchOpen(true)}>

              {/* <Search size={20} className="search-icon" /> */}
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg></span>
              {sidebarExpanded && " Search"}
            </li>
            <li className={`sidebar-li ${activeSection === "Add Events" ? "active-section" : ""}`} onClick={() => setActiveSection("addEvent")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journal-richtext" viewBox="0 0 16 16">
                <path d="M7.5 3.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m-.861 1.542 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047L11 4.75V7a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 7v-.5s1.54-1.274 1.639-1.208M5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
              </svg></span>{sidebarExpanded && "Add Event"}
            </li>
            <li className={`sidebar-li ${activeSection === "Update Events" ? "active-section" : ""}`} onClick={() => setActiveSection("updateEvent")}>

              <span className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journal-richtext" viewBox="0 0 16 16">
                  <path d="M7.5 3.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m-.861 1.542 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047L11 4.75V7a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 7v-.5s1.54-1.274 1.639-1.208M5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                  <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                  <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                </svg>
              </span>{sidebarExpanded && "Update Event"}
            </li>
            <li className={`sidebar-li ${activeSection === "Orders" ? "active-section" : ""}`} onClick={() => setActiveSection("orders")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journals" viewBox="0 0 16 16">
                <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1H1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2" />
                <path d="M1 6v-.5a.5.5 0 0 1 1 0V6h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V9h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 2.5v.5H.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H2v-.5a.5.5 0 0 0-1 0" />
              </svg></span><NotificationBell />{sidebarExpanded && "Orders"}
            </li>
            <li className={`sidebar-li ${activeSection === "Settings" ? "active-section" : ""}`} onClick={() => setActiveSection("settings")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
              </svg></span>{sidebarExpanded && "Settings"}
            </li>
            <hr />
            <li className={`sidebar-li ${activeSection === "Comments" ? "active-section" : ""}`} onClick={() => setActiveSection("comments")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-right-text" viewBox="0 0 16 16">
                <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
              </svg></span>{sidebarExpanded && "Comments"}
            </li>
            <li className={`sidebar-li ${activeSection === "FAQs" ? "active-section" : ""}`} onClick={() => setActiveSection("faqs")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
              </svg></span>{sidebarExpanded && "FAQs"}
            </li>
          </ul>
        </aside>

        <div className="admin-main-content">
          {activeSection === "addEvent" && (
            <>
              {/**stories */}
              <Stories />
              
              <div className="marquee-wrapper">
                <div className="marquee-track">
                  {offers.map((offer, index) => {
                    const randomColor = `hsla(${Math.floor(Math.random() * 360)}, 60%, 70%,0.9)`;

                    return (
                      <div
                        key={offer.id}
                        className="offer-card"
                        style={{
                          animationDelay: `${index * 2}s`,
                          backgroundImage: `linear-gradient(to right,${randomColor}, rgba(0, 0, 0, 0.4)),
                                          url(${offer.backgroundUrl || ""})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "12px",
                          padding: "20px",
                          color: "#fff",
                          marginLeft: "20px",
                          marginTop: "20px",
                          boxShadow: `0 4px 12px ${randomColor}`,
                        }}
                      >
                        <h2 className="offer-heading">{offer.offerName}</h2>
                        <p className="offer-description">{offer.description}</p>
                        <p className="blinking-offer-line">
                          🎉 Enjoy <strong>{offer.discount}% OFF</strong> on {offer.type} events
                          from <strong>{offer.fromDate}</strong> to <strong>{offer.uptoDate}</strong> — Don't miss it!
                        </p>
                      </div>
                    );
                  })}

                </div>
              </div>
              <h2 className="admin-main-content-h2">📅 Event Management</h2>
              <div className="admin-addevent-container">
                <h3 className="admin-addevent-container-h3">Add New Event</h3>
                <form className="admin-addevent-form" onSubmit={handleAddEvent}>
                  {/* Media Upload */}
                  <div className="admin-addevent-input-group">
                    <label className="admin-addevent-input-lable">Upload Image/Video</label>
                    <input
                      className="admin-addevent-input"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                    />
                  </div>

                  <div className="admin-addevent-input-group">
                    <label className="admin-addevent-input-lable">Event Name</label>
                    <input
                      className="admin-addevent-input"
                      type="text"
                      placeholder="Event Name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>

                  <div className="admin-addevent-input-group">
                    <label className="admin-addevent-input-lable">Event Type</label>
                    <select className="admin-addevent-select" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="">Select Event Type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Festival">Festival</option>
                    </select>
                  </div>

                  <div className="admin-addevent-input-group">
                    <label className="admin-addevent-input-lable">Range</label>
                    <select className="admin-addevent-select" value={range} onChange={(e) => setRange(e.target.value)}>
                      <option value="">Select Range</option>
                      <option value="Normal">Normal</option>
                      <option value="Medium">Medium</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>

                  <div className="admin-addevent-input-group">
                    <label className="admin-addevent-input-lable">Description</label>
                    <input
                      className="admin-addevent-input"
                      type="text"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="admin-addevent-input-group">
                    <label className="admin-addevent-input-lable">Price</label>
                    <input
                      className="admin-addevent-input"
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <button className="admin-addevent-btn" type="submit" disabled={loading}>
                      {loading ? "Uploading..." : "Add Event"}
                    </button>
                    <button className="admin-addevent-btn demo" onClick={handleShowDemo} type="button">
                      🎨 Show Demo
                    </button>
                  </div>
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
            </>
          )}
          {activeSection === "updateEvent" && (
            <>
              <h3>Update Events</h3>
              <div className="update-events-grid">
                {events.map((event) => (
                  <div key={event.id} className="update-event-card">
                    <img src={event.mediaUrl} alt={event.eventName} className="event-image" />
                    <div className="update-event-card-details">
                      <h2>{event.eventName}</h2>
                      <p>{event.type} | {event.range} | ₹{event.price}</p>
                      <button className="event-edit-btn" onClick={() => handleEditClick(event)}>Edit</button>
                    </div>
                  </div>
                ))}


                {isPopupOpen && selectedEvent && (
                  <EventUpdate
                    event={selectedEvent}
                    onClose={() => setIsPopupOpen(false)}
                    onUpdate={() => {
                      fetchEvents(); // <--- this refreshes events after update/delete
                      setIsPopupOpen(false);
                    }}
                  />
                )}

              </div>
              
            </>
          )}

          {activeSection === "orders" && (
            <>
              <div>
                {/* New Orders */}
                <h3 className="order-h3">🆕 New Orders</h3>
                <div className="orders-list">
                  {Object.values(bookings).flat().filter(b => !b.viewedByAdmin).map((booking) => (
                    <div key={booking.id} className="order-card">
                      <h5>{booking.firstName} {booking.lastName}</h5>
                      <p>📅 Created: {new Date(booking.createdDate).toDateString()}</p>
                      <p>📅 Event Date: {new Date(booking.eventDate).toDateString()}</p>
                      <p>🎉 Event: {booking.eventName}</p>
                      <button className="order-card-btn" onClick={() => handleOpenBooking(booking.id)}>Open</button>
                    </div>
                  ))}
                </div>

                {/* Completed Orders */}
                <h3 className="order-h3">✅ Completed Orders</h3>
                <div className="orders-list">
                  {Object.values(bookings).flat().filter(b => b.viewedByAdmin).map((booking) => (
                    <div key={booking.id} className="order-card">
                      <h5>{booking.firstName} {booking.lastName}</h5>
                      <p>📅 Created: {new Date(booking.createdDate).toDateString()}</p>
                      <p>📅 Event Date: {new Date(booking.eventDate).toDateString()}</p>
                      <p>🎉 Event: {booking.eventName}</p>
                      <button className="order-card-btn" onClick={() => handleOpenBooking(booking.id)}>Open</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === "settings" && (
            <>
              <h2>⚙️ Admin Settings</h2>
              <div className="settings-block space-y-6">
                <div className="add-offer-form">
                  <h3>Add Offer</h3>
                  <form onSubmit={handlePublishOffer}>
                    <select value={offer.type} onChange={(e) => setOffer({ ...offer, type: e.target.value })}>
                      <option value="">Select Event Type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Festival">Festival</option>
                    </select>
                    <select value={offer.range} onChange={(e) => setOffer({ ...offer, range: e.target.value })}>
                      <option value="">Select Range</option>
                      <option value="Normal">Normal</option>
                      <option value="Medium">Medium</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Discount Price (%)"
                      value={offer.discount}
                      onChange={(e) => setOffer({ ...offer, discount: e.target.value })}
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
                    <textarea
                      placeholder="Offer Description"
                      value={offer.description}
                      onChange={(e) => setOffer({ ...offer, description: e.target.value })}
                      required
                    ></textarea>

                    {/* Image upload input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      required
                    />
                    {offer.backgroundUrl && (
                      <img
                        src={offer.backgroundUrl}
                        alt="Preview"
                        style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }}
                      />
                    )}


                    <button type="submit">📢 Publish Offer</button>
                    {offer.id && (
                      <>
                        <button type="button" onClick={handleUpdateOffer}>
                          🔄 Update Offer
                        </button>
                        <button type="button" onClick={handleDeleteOffer}>
                          🗑️ Delete Offer
                        </button>
                      </>
                    )}
                  </form>

                  {/* Display offers */}
                  <div className="offer-list-wrapper">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="offer-container"
                        style={{
                          backgroundImage: `url(${offer.backgroundUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          padding: "20px",
                          borderRadius: "10px",
                          marginBottom: "20px",
                          color: "#fff",
                        }}
                      >
                        <h2 className="offer-heading">{offer.offerName}</h2>
                        <p className="offer-description">{offer.description}</p>
                        <p className="blinking-offer-line">
                          🎉 Enjoy {offer.discount}% OFF on {offer.type} events from{" "}
                          {offer.fromDate} to {offer.uptoDate} — Don't miss out!
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Search Bar */}
        <SearchBar
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          //setFilteredEvents={setFilteredEvents}
          events={events}
        />

        {/* CSS for styling */}
        <style>{`  `}</style>
      </div >
    </div>

  );
}