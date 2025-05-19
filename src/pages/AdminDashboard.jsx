import React, { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/Firebase";
import { collection, getDocs, } from "firebase/firestore";
import SearchBar from "../components/SearchBar"; // Import the SearchBar component
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import NotificationBell from "../EventPopup/NotificationBell"; // Import notification component
import Stories from "../components/Stories";
import axios from "axios";
import EventUpdate from "../components/AdminComponent/EventUpdate";
import "../components/AdminComponent/EventUpdate.css";
import "./../components/SideBar.css";
import "./../components/SearchBar.css"
import AddEvent from "../components/AdminComponent/AddEvent";
import AdminOrders from "../components/AdminComponent/AdminOrders";
import RegisteredUsers from "../components/AdminComponent/RegisteredUsers";
import UserSetting from '../components/UserSetting';
import AdminPayment from '../components/AdminComponent/AdminPayment';
import CommentSection from '../components/CommentSection';
import OfferUpdate from "../components/AdminComponent/OfferUpdate";
import UpdatePasskey from "../components/UpdatePasskey";
import AdminFAQs from "../components/AdminComponent/AdminFAQs";
export default function AdminDashboard() {

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("addEvent"); // Default section to display
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [filteredEvents, setFilteredEvents] = useState([]);

  const navigate = useNavigate();



  //const [filteredEvents, setFilteredEvents] = useState([]);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxavefpkp/upload";
  const Event_UPLOAD_PRESET = "event_card_img";
  const Offer_UPLOAD_PRESET = "offer_bg_img"; // replace with your Cloudinary preset
  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const eventList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
      setFilteredEvents(eventList); // <-- fix here
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
  // Update filtered events when filter changes
  useEffect(() => {
    if (filter === "All") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === filter));
    }
  }, [filter, events]);

  const eventTypes = ["All", "Wedding", "Engagement", "Birthday", "Anniversary", "Festival", "Party"];
  //const filteredEvents = filter === "All" ? events : events.filter(event => event.type === filter);
  const [offers, setOffers] = useState([]);
  // 📥 Fetch all offers
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
        alert("❌ Failed to fetch offers");
      }
    };
    fetchOffers();
  }, []);

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
            <li className={`sidebar-li ${activeSection === "addEvent" ? "active-section" : ""}`} onClick={() => setActiveSection("addEvent")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journal-plus" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5" />
                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
              </svg></span>{sidebarExpanded && "Add Event"}
            </li>
            <li className={`sidebar-li ${activeSection === "updateEvent" ? "active-section" : ""}`} onClick={() => setActiveSection("updateEvent")}>

              <span className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journal-richtext" viewBox="0 0 16 16">
                  <path d="M7.5 3.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m-.861 1.542 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047L11 4.75V7a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 7v-.5s1.54-1.274 1.639-1.208M5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                  <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                  <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                </svg>
              </span>{sidebarExpanded && "Update Event"}
            </li>
            <li className={`sidebar-li ${activeSection === "orders" ? "active-section" : ""}`} onClick={() => setActiveSection("orders")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-journals" viewBox="0 0 16 16">
                <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1H1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2" />
                <path d="M1 6v-.5a.5.5 0 0 1 1 0V6h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V9h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 2.5v.5H.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H2v-.5a.5.5 0 0 0-1 0" />
              </svg></span><NotificationBell />{sidebarExpanded && "Orders"}
            </li>
            <li className={`sidebar-li ${activeSection === "users" ? "active-section" : ""}`} onClick={() => setActiveSection("users")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
              </svg></span>{sidebarExpanded && "Users"}
            </li>
            <li className={`sidebar-li ${activeSection === "settings" ? "active-section" : ""}`} onClick={() => setActiveSection("settings")}>
              <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a.873.873 0 0 1 1.255-.52z" />
              </svg></span>{sidebarExpanded && "Settings"}
            </li>
            <hr />
            <li className={`sidebar-li ${activeSection === "comments" ? "active-section" : ""}`} onClick={() => setActiveSection("comments")}>
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
        <div className="user-main-dash">

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

                <h2 className="admin-main-content-h">📅 Event Management</h2>
                <AddEvent fetchEvents={fetchEvents} />
                <OfferUpdate />
              </>
            )}
            {activeSection === "updateEvent" && (
              <>
                <h3>Update Events</h3>
                {/* Filter Buttons */}
                <div className="user-filter-section">
                  <div className="user-event-filters">
                    {eventTypes.map((type) => (
                      <button
                        key={type}
                        className={`user-filter-button ${filter === type ? "active" : ""}`}
                        onClick={() => setFilter(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="update-events-grid">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div key={event.id} className="update-event-card">
                        <img src={event.mediaUrl} alt={event.eventName} className="event-image" />
                        <div className="update-event-card-details">
                          <h2>{event.eventName}</h2>
                          <p>{event.type} | {event.range} | ₹{event.price}</p>
                          <button className="event-edit-btn" onClick={() => handleEditClick(event)}>Edit</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <LoadingCard />
                      <LoadingCard />
                      <LoadingCard />
                      <p>No events found..!</p>
                    </>
                  )}


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
                <AdminOrders />
              </>
            )}
            {activeSection === "users" && (
              <>
                <RegisteredUsers />
              </>
            )}
            {activeSection === "comments" && (
              <>
                <CommentSection />
              </>
            )}
            {activeSection === "settings" && (
              <>
                <div className="settings-block space-y-6">
                  <UserSetting />
                  <UpdatePasskey />
                  <AdminPayment />
                </div>
              </>
            )}
            {/*User FAQs*/}
            {activeSection === "faqs" && (
              <AdminFAQs />
            )}
          </div>
        </div>
        {/* Search Bar */}
        <SearchBar
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          events={events}
          setFilteredEvents={setFilteredEvents} // <-- Add this line
        />

        {/* CSS for styling */}
        <style>{`  `}</style>
      </div >
    </div>

  );
}