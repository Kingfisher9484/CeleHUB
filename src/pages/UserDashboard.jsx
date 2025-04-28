import React, { useEffect, useState } from "react";
import { db } from "../../Firebase/Firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import SearchBar from "../components/SearchBar";
import EventBookingPopup from "../components/EventBookingPopup";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Added onAuthStateChanged
import "./FAQs.css";
import "./UserDashboard2.css";
import "./../components/SideBar.css";
import "./../components/SearchBar.css"
import LoadingCard from '../components/LoadingCard';
import ShowStar from '../EventPopup/showStar'; // Adjust path based on location
import { color } from "framer-motion";
// In your AdminPage.jsx or wherever you want to use it
import Comment from "../components/Comment"; // adjust the path
import Stories from "../components/Stories";
import "./my-bookings(userdash).css";
import MyBookings from "../components/my_bookings";

{/* Other sections here */ }
const UserDashboard = ({ currentUser, comments }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("Events");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Firebase Auth User ID

  const [userId, setUserId] = useState(null); // Track user ID state

  const auth = getAuth();
  //const userId = auth.currentUser ? auth.currentUser.uid : null;

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);


  // Update filtered events when filter changes
  useEffect(() => {
    if (filter === "All") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.type === filter));
    }
  }, [filter, events]);

  const eventTypes = ["All", "Wedding", "Engagement", "Birthday", "Anniversary", "Festival"];
  //const filteredEvents = filter === "All" ? events : events.filter(event => event.type === filter);
 
  //event share via availble apps
  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.eventName,
        text: `Check out this event: ${event.eventName}`,
        url: window.location.origin + `/event/${event.id}`,
      })
      .then(() => console.log("Shared successfully!"))
      .catch((error) => console.error("Error sharing", error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };
  
  //display offer

  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "adminSettings", "offer", "data")
        );
        const offerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOffers(offerList);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, []);
  //FAQs
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "Q)How do I create an account?", answer: "Ans:- To create an account, go to the sign-up page and fill in your details." },
    { question: "Q)How can I reset my password?", answer: "Ans:- Click on 'Forgot Password' on the login page and follow the steps." },
    { question: "Q)What is CeleHub?", answer: "Ans:- CeleHub is a platform connecting fans with celebrities through exclusive content." },
    { question: "Q)How do I contact support?", answer: "Ans:- You can contact support via email at support@celehub.com." },
    { question: "Q)Is CeleHub free to use?", answer: "Ans:- CeleHub offers both free and premium membership plans." }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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

  /*  const [sidebarVisible, setSidebarVisible] = useState(false);
    
      useEffect(() => {
        const toggle = () => setSidebarVisible((prev) => !prev);
        window.addEventListener("toggleSidebar", toggle);
    
        return () => window.removeEventListener("toggleSidebar", toggle);
      }, []);
      <div className="admin-home-container">
        {/* Sidebar *
        {sidebarVisible && (
          <div className="mobile-sidebar">
            {/* Your Sidebar Component *
            <aside className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
              <div className={`sidebar-header ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
                <button
      */
  return (
    <div className="user-home-container">
      <aside
        className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'} ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>

        <ul className={`sidebar-header ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
          <li
            className="sidebar-toggle"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            {sidebarExpanded ?
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
                <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
              </svg>
              :
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708" />
                <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708" />
              </svg>}
          </li>

        </ul>

        <ul className="sidebar-menu">
          <li className="sidebar-li" onClick={() => setIsSearchOpen(true)}>

            {/* <Search size={20} className="search-icon" /> */}
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg></span>
            {sidebarExpanded && " Search"}
          </li>
          <li className={`sidebar-li ${activeSection === "Events" ? "active-section" : ""}`} onClick={() => setActiveSection("Events")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-grid-1x2" viewBox="0 0 16 16">
              <path d="M6 1H1v14h5zm9 0h-5v5h5zm0 9v5h-5v-5zM0 1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm9 0a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zm1 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z" />
            </svg></span>{sidebarExpanded && "Events"}
          </li>
          <li className={`sidebar-li ${activeSection === "Bookings" ? "active-section" : ""}`} onClick={() => setActiveSection("Bookings")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-ui-checks-grid" viewBox="0 0 16 16">
              <path d="M2 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1m9-9h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m0 9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zm0-10a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM2 9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2zm7 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM0 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.354.854a.5.5 0 1 0-.708-.708L3 3.793l-.646-.647a.5.5 0 1 0-.708.708l1 1a.5.5 0 0 0 .708 0z" />
            </svg></span>{sidebarExpanded && "Bookings"}
          </li>
          <li className={`sidebar-li ${activeSection === "Settings" ? "active-section" : ""}`} onClick={() => setActiveSection("settings")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
            </svg></span>{sidebarExpanded && "Settings"}
          </li>
          <li className={`sidebar-li ${activeSection === "Comments" ? "active-section" : ""}`} onClick={() => setActiveSection("comments")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-chat-right-text" viewBox="0 0 16 16">
              <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
              <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
            </svg></span>{sidebarExpanded && "Comments"}
          </li>
          <li className={`sidebar-li ${activeSection === "FAQs" ? "active-section" : ""}`} onClick={() => setActiveSection("faqs")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
            </svg></span>{sidebarExpanded && "FAQs"}
          </li>
        </ul>
      </aside>
      <div className="user-main-dash">

        <div className="user-main-content">
          {activeSection === "Events" && (
            <>
              {/**stories */}
              <Stories />
              {/*offer section */}
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
              <h3 lassName="text-center mb-4">Upcoming Events</h3>

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

              {/* Events Grid */}
              <div className="user-events-grid">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="modern-event-card"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsPopupOpen(true);
                      }}
                    >
                      <div className="modern-event-img">
                        <img
                          src={event.mediaUrl || "/placeholder.jpg"}
                          alt={event.eventName}
                          className="event-image"
                        />
                      </div>
                      <div className="modern-event-details">
                        <h3>{event.eventName}</h3>

                        <ShowStar eventId={event.id} />

                        <p className="event-price">₹{event.price}</p>
                        <button
                          className="share-via-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering card click
                            handleShare(event);
                          }}
                          aria-label="Share Event"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM10.964 4.686l-5.226 2.61a1.5 1.5 0 1 0 .15 2.917l5.136 2.435a1.5 1.5 0 1 0 .357-.933L6.486 9.29a1.5 1.5 0 0 0-.086-.58l5.276-2.633a1.5 1.5 0 1 0-.712-.823zM2.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                          </svg>
                        </button>

                        <span className="view-more-text">View More...</span>
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

              </div>
              {/* Event Booking Popup */}
              {selectedEvent && (
                <EventBookingPopup
                  event={selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                />
              )}
              {isPopupOpen && (
                <EventBookingPopup
                  event={selectedEvent}
                  onClose={() => setIsPopupOpen(false)}
                />
              )}

            </>
          )}
          {/*User bookings*/}
          {activeSection === "Bookings" && (
            <>
              <h2 className="heading">📋 My Bookings</h2>
              <MyBookings />
            </>
          )}
          {/*User setting*/}
          {activeSection === "settings" && (
            <>
              <h2>⚙️ Settings</h2>
              <div className="settings-block">
                <p>Settings options go here</p>
              </div>
            </>
          )}
          {/*User Comments*/}
          {activeSection === "comments" && (
            <>
              <Comment
                activeSection={activeSection}
                currentUser={currentUser}
                comments={comments}
              />
            </>
          )}
          {/*User FAQs*/}
          {activeSection === "faqs" && (
            <div className="container my-4">
              <h2 className="text-center mb-4">Frequently Asked Questions</h2>
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div className="accordion-item" key={index}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${openIndex === index ? "" : "collapsed"}`}
                        type="button"
                        onClick={() => toggleFAQ(index)}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      className={`accordion-collapse collapse ${openIndex === index ? "show" : ""}`}
                    >
                      <div className="accordion-body">{faq.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setFilteredEvents={setFilteredEvents}
        events={events}
      />


    </div>
  );
};
export default UserDashboard;

























/*import React, { useEffect, useState } from "react";
import { db } from "../../Firebase/Firebase";
import { collection, getDocs } from "firebase/firestore";
import SearchBar from "../components/SearchBar"; // Import the SearchBar component
import { Search, User, Settings } from "lucide-react";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate




export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("Events"); // Default section to display
  const [searchOpen, setSearchOpen] = useState(false); // Toggle for search bar
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate(); // Hook for navigation

  // Function to fetch events
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const eventTypes = ["All", "Wedding", "Engagement", "Birthday", "Anniversary", "Festival"];

  const filteredEvents = filter === "All" ? events : events.filter(event => event.type === filter);

  return (
    <div className="user-home-container">
      {/* Sidebar *}
      <aside className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
        <div className={`sidebar-header ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            {sidebarExpanded ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
              <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708" />
              <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708" />
            </svg>}
          </button>
          <button className="search-toggle" onClick={() => setSearchOpen(true)}>
            <Search size={20} />
            {/*<User size={24} />
            <Settings size={24} />*}
          </button>
        </div>

        <ul className="user-sidebar-menu">
          <li className="user-sidebar-li" onClick={() => setActiveSection("Events")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grid-1x2" viewBox="0 0 16 16">
              <path d="M6 1H1v14h5zm9 0h-5v5h5zm0 9v5h-5v-5zM0 1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm9 0a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zm1 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z" />
            </svg></span>{sidebarExpanded && "Events"}
          </li>
          <li className="user-sidebar-li" onClick={() => setActiveSection("Bookings")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ui-checks-grid" viewBox="0 0 16 16">
              <path d="M2 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1m9-9h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m0 9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zm0-10a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM2 9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2zm7 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM0 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.354.854a.5.5 0 1 0-.708-.708L3 3.793l-.646-.647a.5.5 0 1 0-.708.708l1 1a.5.5 0 0 0 .708 0z" />
            </svg></span>{sidebarExpanded && "Bookings"}
          </li>
          <li className="user-sidebar-li" onClick={() => setActiveSection("settings")}>
            <span className="sidebar-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
            </svg></span>{sidebarExpanded && "Settings"}
          </li>
        </ul>
      </aside>

      <div className="user-main-content">
        {activeSection === "Events" && (
          <>
            <h3 className="user-main-content-h3">Upcoming Events</h3>
            {/* Filters *}
            <section className="user-filter-section">
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
            </section>
            <hr className="event-top-hr" />
            {/* Display Events *}
            <div className="user-events-grid">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div key={event.id} className="user-event-card">
                    <div className="user-event-card-img"></div>
                    <h3>{event.eventName}</h3>
                    {/* <p>
                      <strong>Type:</strong> {event.type}
                    </p>
                    <p>
                      <strong>Range:</strong> {event.range}
                    </p>*}
                    <p>
                      <strong>Price:</strong> ₹{event.price}
                    </p>
                    {/* <p className="description">{event.description}</p>*}
                    <button className="user-event-button" onClick={() => navigate(`/book-event/${event.id}`)}>
                      Book Now
                    </button>
                  </div>
                ))
              ) : (
                <p className="loading">No events found..!</p>
              )}
            </div>
          </>
        )}

        {activeSection === "Bookings" && (
          <>
            <h2>📋 My Bookings</h2>
            <div className="Bookings-list">
              <div className="Booking-card">
                <h4>Event Name</h4>
                <p>Booking details...</p>
              </div>
            </div>
          </>
        )}

        {activeSection === "settings" && (
          <>
            <h2>⚙️ Settings</h2>
            <div className="settings-block">
              <p>Settings options go here</p>
            </div>
          </>
        )}
      </div>
      {/* Floating Search Bar *}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
*/
/*
 //const [eventName, setEventName] = useState("");
  //const [type, setType] = useState("");
  //const [range, setRange] = useState("");
  //const [description, setDescription] = useState("");
  //const [price, setPrice] = useState("");
  const [events, setEvents] = useState([]);
  //const [loading, setLoading] = useState(false);



import React, { useEffect, useState } from "react";
import { db } from "./../../Firebase/Firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventCollection = collection(db, "events");
      const eventSnapshot = await getDocs(eventCollection);
      setEvents(eventSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchEvents();
  }, []);

  const bookEvent = async (event) => {
    await addDoc(collection(db, "bookings"), event);
    setBookedEvents([...bookedEvents, event]);
    alert("✅ Event Booked!");
  };

  return (
    <div className="user-container">
      <h2>Available Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.name} - ₹{event.price}
            <button onClick={() => bookEvent(event)}>Book Now</button>
          </li>
        ))}
      </ul>

      <h3>Your Bookings</h3>
      <ul>
        {bookedEvents.map((event, index) => (
          <li key={index}>{event.name} - ₹{event.price}</li>
        ))}
      </ul>
    </div>
  );
}



<>
<h2>📅 Event Management</h2>

            <div className="form-container">
              <h3>Add New Event</h3>
              <form onSubmit={handleEvents}>
                <div className="input-group">
                  <label>Event Name</label>
                  <input
                    type="text"
                    placeholder="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Event Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="">Select Event Type</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Range</label>
                  <select value={range} onChange={(e) => setRange(e.target.value)} required>
                    <option value="">Select Range</option>
                    <option value="Local">Local</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <button className="add-event-btn" type="submit" disabled={loading}>
                  {loading ? "Uploading..." : "Add Event"}
                </button>
              </form>
            </div>
</>
*/