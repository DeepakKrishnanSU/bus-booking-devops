const express = require("express");
const router = express.Router();
const BusBooking = require("../models/busBookingModel");
const BusSchedule = require("../models/busScheduleModel");

// ✅ Create a new booking and update seat count
router.post("/book", async (req, res) => {
  try {
    const {
      ticketNumber,
      userEmail,
      busId,
      busName,
      from,
      to,
      date,
      time,
      seatNumber,
      seatCount,
      price,
    } = req.body;

    // Validate required fields
    if (!ticketNumber || !userEmail || !busId || !busName || !from || !to || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔍 Find the bus by ID
    const bus = await BusSchedule.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // ❌ Check if any seats are left
    if (bus.seats <= 0) {
      return res.status(400).json({ message: "No seats available for this bus" });
    }
    
    // ✅ Create the booking
    const newBooking = new BusBooking({
      ticketNumber,
      userEmail,
      busId,
      busName,
      from,
      to,
      date,
      time,
      seatNumber,
      price,
    });

    await newBooking.save();

    const count = seatCount || 1;
    bus.seats -= count;
    await bus.save();

    res.status(201).json({
      message: "✅ Booking successful",
      booking: newBooking,
      seatsLeft: bus.seats, // return updated seat count
    });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all bookings for a user
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await BusBooking.find({ userEmail: email });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for this user" });
    }

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚫 Cancel booking (better approach)
router.put("/cancel/:ticketNumber", async (req, res) => {
  try {
    const booking = await BusBooking.findOne({
      ticketNumber: req.params.ticketNumber,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔒 Prevent double cancel
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    // ✅ Calculate seats booked
    const seatCount = booking.seatNumber
      ? booking.seatNumber.split(",").length
      : 1;

    // ✅ Update booking status
    booking.status = "Cancelled";
    await booking.save();

    // ✅ Restore seats
    const bus = await BusSchedule.findById(booking.busId);
    if (bus) {
      bus.seats += seatCount;
      await bus.save();
    }

    res.status(200).json({
      message: "✅ Booking cancelled",
      restoredSeats: seatCount,
    });

  } catch (err) {
    console.error("❌ Cancel error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all bookings (for admin)
router.get("/all", async (req, res) => {
  try {
    const bookings = await BusBooking.find();
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
});

// ✅ Delete a booking (optional, admin or cleanup)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await BusBooking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get bus status by ticket number
router.get("/status/:ticketNumber", async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    // Step 1: Find booking by ticket number
    const booking = await BusBooking.findOne({ ticketNumber });
    if (!booking)
      return res.status(404).json({ message: "Ticket not found" });

    // Step 2: Find the bus schedule based on bus name
    const schedule = await BusSchedule.findOne({ busName: booking.busName });
    if (!schedule)
      return res.status(404).json({ message: "Bus schedule not found" });

    // Step 3: Extract start, stops, and end
    const { busName, busStartLocation, busEndLocation, stops } = schedule;

    // Step 4: Return everything
    res.json({
      busName,
      busStartLocation,
      busEndLocation,
      stops, // intermediate stops only
    });
  } catch (error) {
    console.error("Error fetching bus status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all booked seat numbers for a given bus and date (read-only, safe)
router.get("/booked-seats/:busId/:date", async (req, res) => {
  try {
    const { busId, date } = req.params;

    // Fetch all bookings for that bus on that date
    const bookings = await BusBooking.find({
      busId,
      date,
      status: "Booked",
    });

    // Extract only the seat numbers
    const bookedSeats = bookings.map((b) => b.seatNumber);

    res.status(200).json(bookedSeats);
  } catch (error) {
    console.error("❌ Error fetching booked seats:", error);
    res.status(500).json({ message: "Server error while fetching booked seats" });
  }
});

module.exports = router;