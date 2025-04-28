import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react"; // Using lucide-react for a modern icon
import { db } from "../../Firebase/Firebase"; // Import Firebase instance
import { collection, getDocs } from "firebase/firestore";
import "./SearchBar.css";
const SearchBar = ({ isOpen, onClose, setFilteredEvents, events }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);

  // Close search bar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }

    const allEvents = await fetchEvents();
    const filtered = allEvents.filter(event =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.range.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.price.toString().includes(searchTerm)
    );

    setFilteredEvents(filtered);
  };

  return (
    <div className={`search-overlay ${isOpen ? "open" : ""}`}>
      <div className="search-box" ref={searchRef}>
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchBar;

/*
import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ isOpen, onClose, events, setFilteredEvents }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, eventType, minPrice, maxPrice]);

  // Function to filter events
  const handleSearch = () => {
    let filtered = events.filter((event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (eventType !== "All") {
      filtered = filtered.filter((event) => event.type.toLowerCase() === eventType.toLowerCase());
    }

    const min = minPrice ? parseInt(minPrice) : null;
    const max = maxPrice ? parseInt(maxPrice) : null;

    if (min !== null && max !== null && min > max) return;

    if (min !== null) {
      filtered = filtered.filter((event) => event.price >= min);
    }

    if (max !== null) {
      filtered = filtered.filter((event) => event.price <= max);
    }

    setFilteredEvents(filtered);
  };

  return (
    <div className={`search-overlay ${isOpen ? "open" : ""}`}>
      <div className="search-box" ref={searchRef}>
        <Search size={20} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select className="search-filter" value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Wedding">Wedding</option>
          <option value="Engagement">Engagement</option>
          <option value="Birthday">Birthday</option>
          <option value="Anniversary">Anniversary</option>
          <option value="Festival">Festival</option>
        </select>

        <input
          type="number"
          className="search-input"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
        />
        <input
          type="number"
          className="search-input"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
        />

        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchBar;
 */
/*import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react"; // Using lucide-react for a modern icon

const SearchBar = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);

  // Close search bar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className={`search-overlay ${isOpen ? "open" : ""}`}>
      <div className="search-box" ref={searchRef}>
        <Search size={20} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchBar;
*/