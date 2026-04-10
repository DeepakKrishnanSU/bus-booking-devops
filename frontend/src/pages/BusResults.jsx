import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./BusResults.css";
const VITE_API_URL = import.meta.env.VITE_API_URL;

function BusResults() {
  const location = useLocation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [sortBy, setSortBy] = useState("time");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedBusId, setExpandedBusId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [visibleStopsBusId, setVisibleStopsBusId] = useState(null);
  const [filterOption, setFilterOption] = useState("");
  const [filterType, setFilterType] = useState("");
  const [ticketNumber, setTicketNumber] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [seatLayouts, setSeatLayouts] = useState({});


const calculateArrivalTime = (departureTime, duration) => {
  if (!departureTime || !duration) return "";

  const [depHours, depMinutes] = departureTime.split(":").map(Number);
  let totalMinutes = depHours * 60 + depMinutes;

  let durHours = 0;
  let durMinutes = 0;

  // ✅ If new format (HH:MM)
  if (duration.includes(":")) {
    [durHours, durMinutes] = duration.split(":").map(Number);
  } 
  // ✅ If old format (5h 30min)
  else {
    const hourMatch = duration.match(/(\d+)\s*h/);
    const minMatch = duration.match(/(\d+)\s*min/);

    durHours = hourMatch ? parseInt(hourMatch[1]) : 0;
    durMinutes = minMatch ? parseInt(minMatch[1]) : 0;
  }

  totalMinutes += durHours * 60 + durMinutes;

  const arrivalHours = Math.floor(totalMinutes / 60) % 24;
  const arrivalMinutes = totalMinutes % 60;

  return `${arrivalHours.toString().padStart(2, "0")}:${arrivalMinutes
    .toString()
    .padStart(2, "0")}`;
};

const formatTo12Hour = (time) => {
  if (!time) return "";

  let [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const formatDuration = (duration) => {
  if (!duration) return "";

  let h = 0;
  let m = 0;

  // ✅ New format (HH:MM)
  if (duration.includes(":")) {
    [h, m] = duration.split(":").map(Number);
  }
  // ✅ Old format (5h 30min)
  else {
    const hourMatch = duration.match(/(\d+)\s*h/);
    const minMatch = duration.match(/(\d+)\s*min/);

    h = hourMatch ? parseInt(hourMatch[1]) : 0;
    m = minMatch ? parseInt(minMatch[1]) : 0;
  }

  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;

  return `${h}h ${m}min`;
};

const toggleStops = (busId) => {
  if (visibleStopsBusId === busId) setVisibleStopsBusId(null);
  else setVisibleStopsBusId(busId);
};

// ✅ Fetch booked seats for a specific bus and date
const fetchBookedSeats = async (busId, date) => {
  try {
    const res = await axios.get(`${VITE_API_URL}/api/bookings/booked-seats/${busId}/${date}`);
    return res.data; // Array of booked seat numbers
  } catch (err) {
    console.error("Error fetching booked seats:", err);
    return [];
  }
};

const toggleSeats = async (busId) => {
  if (expandedBusId === busId) {
    // Collapse the layout and reset selected seats
    setExpandedBusId(null);
    setSelectedSeats([]);
  } else {
    try {
      // 🔹 Fetch booked seats from backend
      const bookedSeats = await fetchBookedSeats(busId, date);

      // 🔹 Generate seat layout
      const layout = generateSeatsLayout(busId);

      // 🔹 Mark booked seats as sold (greyed out)
      const updatedLayout = layout.map((row) =>
        row.map((seat) =>
          seat && bookedSeats.includes(seat.id.toString())
            ? { ...seat, status: "sold" }
            : seat
        )
      );

      // 🔹 Save this layout in state
      setSeatLayouts((prev) => ({ ...prev, [busId]: updatedLayout }));

      // Expand this bus and clear selection
      setExpandedBusId(busId);
      setSelectedSeats([]);
    } catch (err) {
      console.error("Error loading booked seats:", err);
    }
  }
};

const generateSeatsLayout = (busId) => {
  // If we already have a layout stored, just return it
  if (seatLayouts[busId]) return seatLayouts[busId];

  // ✅ Create layout once, don't set state immediately here
  const layout = [];
  let seatNumber = 1;

  for (let row = 1; row <= 5; row++) {
    const rowSeats = [];

    if (row !== 3) {
      for (let col = 1; col <= 12; col++) {
        rowSeats.push({
          id: seatNumber,
          status: "available",
        });
        seatNumber++;
      }
    } else {
      for (let col = 1; col <= 12; col++) {
        if (col === 12) {
          rowSeats.push({
            id: seatNumber,
            status: "available",
          });
          seatNumber++;
        } else {
          rowSeats.push(null);
        }
      }
    }

    layout.push(rowSeats);
  }

  return layout;
};

const handleSeatClick = (busId, seat) => {
  // Prevent booking already sold seats
  if (seat.status === "sold") return;

  setSelectedSeats((prev) => {
    let updated;

    if (prev.includes(seat.id)) {
      // Deselect seat
      updated = prev.filter((s) => s !== seat.id);
    } else {
      // Select seat
      updated = [...prev, seat.id];
    }

    // 🔹 Update seat color (selected / available)
    setSeatLayouts((prevLayouts) => {
      const updatedLayout = prevLayouts[busId].map((row) =>
        row.map((s) =>
          s
            ? s.id === seat.id
              ? {
                  ...s,
                  status: prev.includes(seat.id)
                    ? "available"
                    : "selected",
                }
              : s
            : s
        )
      );
      return { ...prevLayouts, [busId]: updatedLayout };
    });

    return updated;
  });
};

const generateTicketNumber = () => {
  const part1 = Math.floor(100000 + Math.random() * 900000);
  const part2 = Math.floor(100000 + Math.random() * 900000);
  return `${part1}-${part2}`;
};

const handleBook = async (bus) => {

  if (selectedSeats.length === 0) {
    alert("Please select at least one seat");
    return;
  }
  
  const ticket = generateTicketNumber();
  setTicketNumber(ticket);
  setShowPopup(true);

  const seatNumbers = selectedSeats;
  const seatNumbersString = selectedSeats.join(", ");
  const seatCount = selectedSeats.length;

  try {
    const res = await axios.post(`${VITE_API_URL}/api/bookings/book`, {
      ticketNumber: ticket,
      userEmail,
      busId: bus._id,
      busName: bus.busName || "Unknown Bus",
      from: bus.busStartLocation,
      to: bus.busEndLocation,
      date,
      time: bus.departureTime,
      seatNumber: seatNumbersString,
      seatCount: seatCount,
      seatNumbers: seatNumbers,
      price: bus.busPrice,
    });

    console.log("✅ Booking successful:", res.data);
    setBookingDetails(res.data.booking);

    // ✅ Update bus seats in UI after booking
    setBuses((prevBuses) =>
      prevBuses.map((b) =>
        b._id === bus._id ? { ...b, seats: res.data.seatsLeft } : b
      )
    );

    // ✅ Mark selected seats as sold
    setSeatLayouts((prevLayouts) => {
      const updatedLayout = prevLayouts[bus._id].map((row) =>
        row.map((seat) =>
          seat && selectedSeats.includes(seat.id)
            ? { ...seat, status: "sold" }
            : seat
        )
      );
      return { ...prevLayouts, [bus._id]: updatedLayout };
    });

    // ✅ Clear after booking
    setSelectedSeats([]);
    setExpandedBusId(null);
  } catch (err) {
    console.error("❌ Booking failed:", err);
  }
};

  // ✅ Fetch routes list (for dropdown options)
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get(`${VITE_API_URL}/api/routes`);
        setRoutes(res.data);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, []);

  // ✅ Load buses and search info from Home.jsx
useEffect(() => {
  if (location.state) {
    const { from = "", to = "", date = "", email = "" } = location.state;
    setFrom(from);
    setTo(to);
    setDate(date);
    setUserEmail(email);

    // ✅ Fetch latest data from DB instead of using stale data
    const fetchUpdatedBuses = async () => {
      try {
        const res = await axios.get(`${VITE_API_URL}/api/bus-schedule/search`, {
          params: { from, to, date },
        });
        setBuses(res.data);
      } catch (err) {
        console.error("Error fetching updated bus data:", err);
      }
    };

    fetchUpdatedBuses();
  }
}, [location.state]);

  // ✅ Extract unique From / To lists
  const uniqueFrom = [...new Set(routes.map((r) => r.from))];
  const uniqueTo = [...new Set(routes.map((r) => r.to))];

  // ✅ Modify Search Handler
  const handleModify = async (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${VITE_API_URL}/api/bus-schedule/search`, {
        params: { from, to, date },
      });
      setBuses(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setBuses([]);
        setError("No buses found. Modify your search.");
      } else {
        setError("Error fetching buses. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];


  const filteredBuses = buses.filter((bus) => {
  if (!filterType) return true;

  const type = bus.busType?.toLowerCase().replace(/\s+/g, "");

  if (filterType === "ac") return type === "ac";
  if (filterType === "non-ac") return type === "non-ac";
  if (filterType === "sleeper") return type.includes("sleeper");
  if (filterType === "seater") return type.includes("seater");

  return true;
});
  // ✅ Sorting logic
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    if (sortBy === "price") return a.busPrice - b.busPrice;
    if (sortBy === "duration") return (a.timeDuration || "").localeCompare(b.timeDuration || "");
    return (a.departureTime || "").localeCompare(b.departureTime || "");
  });

  return (
    <div className="bus-results-page">
      {userEmail && (
  <p style={{ textAlign: "center", marginBottom: "10px", color: "darkblue"}}>
    Logged in as: <strong>{userEmail}</strong>
  </p>
)}
      {/* 🔹 Modify Search Bar */}
      <div className="search-bar">
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="">From</option>
          {uniqueFrom.map((city, idx) => (
            <option key={idx} value={city}>{city}</option>
          ))}
        </select>

        <select value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">To</option>
          {uniqueTo.map((city, idx) => (
            <option key={idx} value={city}>{city}</option>
          ))}
        </select>

        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={handleModify}
          disabled={!from || !to || !date || loading}
          className="modify-btn"
        >
          {loading ? "Loading..." : "Modify"}
        </button>
      </div>

      {/* 🔹 Filters & Sorting */}
      <div className="filter-sort-row">
        <div className="filters">
          <p>Filter Options:</p>
  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
    <option value="">All</option>
    <option value="ac">AC</option>
    <option value="non-ac">Non-AC</option>
    <option value="sleeper">Sleeper</option>
    <option value="seater">Seater</option>
  </select>
</div>
        <div className="sort-by">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="time">Earliest Departure</option>
            <option value="duration">Shortest Duration</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>
      </div>
      
      {/* 🔹 Bus Cards */}
      <div className="bus-list">
        {error && <p className="error-msg">{error}</p>}
        {!error && buses.length === 0 && !loading && (
          <p className="no-bus-msg">No buses found. Modify your search.</p>
        )}

        {sortedBuses
  .filter((bus) => {
    if (filterOption === "ac") return bus.busType?.toLowerCase().includes("ac");
    if (filterOption === "non-ac") return !bus.busType?.toLowerCase().includes("non-ac");
    if (filterOption === "sleeper") return bus.busType?.toLowerCase().includes("sleeper");
    if (filterOption === "seater") return bus.busType?.toLowerCase().includes("seater");
    return true;
  })
  .map((bus) => (
          <div key={bus._id} className="bus-card">
  {/* --- Left (Departure) --- */}
  <div className="bus-left">
    <p>Departure Details</p>
    <h4>{formatTo12Hour(bus.departureTime) || "—"}, {bus.busDate || ""}</h4>
    <p>Staring Destination: {bus.busStartLocation || ""}</p>
    <button
  className="stops-btn"
  onClick={() => toggleStops(bus._id)}
>
  {visibleStopsBusId === bus._id ? "Hide Stops" : "View Stops"}
</button>

{/* Show stops list when button is active */}
{visibleStopsBusId === bus._id && (
  <div className="stops-popup">
    <p className="stops-route">
      {[
        bus.busStartLocation,
        ...(bus.stops || []),
        bus.busEndLocation,
      ].join(" → ")}
    </p>
  </div>
)}
  </div>

  {/* --- Right Center (Arrival) --- */}
  <div className="bus-right-center">
    <h3>Travel Details</h3>
    
    <p>Ending Destination: {bus.busEndLocation || ""}</p>
    
    <p>
      Destination Arrival Time:{" "}
      {formatTo12Hour(
        calculateArrivalTime(bus.departureTime, bus.timeDuration)
      )} (
      {formatDuration(bus.timeDuration)})
    </p>
    
    <p>Bus Type: {bus.busType || ""} Class</p>
  </div>

  {/* --- Right (Price + Action) --- */}
  <div className="bus-right">
    <img
      src={
        bus.imageUrl ||
        "https://media.assettype.com/tnm%2Fimport%2Fsites%2Fdefault%2Ffiles%2FKSRTC_Facebook_3062021_1200_0.jpg?w=1200"
      }
      alt="Bus"
    />
    <p className="price">₹{bus.busPrice || "—"}</p>

    <p className="seats">
      {bus.seats > 0 ? `${bus.seats} seats left` : "Sold Out"}
    </p>

    <button
      className="choose-btn"
      onClick={() => toggleSeats(bus._id)}
    >
      {expandedBusId === bus._id ? "Hide Seats" : "Choose Seats"}
    </button>

{/* ✅ Show Seat Layout only when expanded */}
{expandedBusId === bus._id && (
  <div className="seat-layout">
    <div className="custom-seat-grid">
      {seatLayouts[bus._id]?.map((row, rowIndex) => (
  <div key={rowIndex} className="seat-row">
    {row.map((seat, colIndex) =>
      seat ? (
        <div
          key={seat.id}
          className={`seat ${seat.status} ${
            selectedSeats.includes(seat.id) ? "selected" : ""
          }`}
          onClick={() => handleSeatClick(bus._id, seat)}
        >
          {seat.id}
        </div>
      ) : (
        <div key={colIndex} className="seat empty"></div>
      )
    )}
  </div>
))}
    </div>

    {/* ✅ Book Button only after seat selection */}
    {selectedSeats.length > 0 && (
      <div className="book-btn-container">
        <button className="book-btn" onClick={() => handleBook(bus)}>
          Book Now ({selectedSeats.length} Seat
          {selectedSeats.length > 1 ? "s" : ""})
        </button>
      </div>
    )}
  </div>
)}
            </div>
          </div>
        ))}
      </div>
      {showPopup && (
  <div className="popup-overlay">
    <div className="popup">
      <h2>🎟️ Booking Confirmed!</h2>
      <p>Your ticket number is:</p>
      <h3>{ticketNumber}</h3>
      <button onClick={() => setShowPopup(false)}>OK</button>
    </div>
  </div>
)}
    </div>
  );
}

export default BusResults;