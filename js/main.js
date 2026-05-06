document.addEventListener('DOMContentLoaded', () => {

  // 1. Ethereal Transitions (Intersection Observer)
  const etherealElements = document.querySelectorAll('.ethereal');

  if (etherealElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const etherealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    etherealElements.forEach(el => {
      etherealObserver.observe(el);
    });
  }

  // 2. Reservation System Logic (reserve.html)
  // 2. Reservation System Logic (reserve.html)
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxQqSXgauAGwkUjeDpuVeEuC8upS9sCoaP-jlgzslNuQenDOo02UbChcigSALQ77Hrq/exec';

    const dateInput = document.getElementById('date');
    const timeInInput = document.getElementById('timeIn');
    const timeOutInput = document.getElementById('timeOut');
    const tableContainer = document.getElementById('tableSelectionContainer');
    const tableGrid = document.getElementById('tableGrid');
    const tableLoading = document.getElementById('tableLoading');
    const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');
    const submitBookingBtn = document.getElementById('submitBookingBtn');
    const selectedTableInput = document.getElementById('selectedTable');

    // Add success/error message container to the UI
    const statusMsg = document.createElement('div');
    statusMsg.className = 'alert mt-4 text-center';
    statusMsg.style.display = 'none';
    bookingForm.appendChild(statusMsg);

    let allBookings = [];

    const fetchBookings = async () => {
      try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
      }
    };

    const performAvailabilityCheck = async () => {
      const dateVal = dateInput.value;
      const timeInVal = timeInInput.value;
      const timeOutVal = timeOutInput.value;

      if (!dateVal || !timeInVal || !timeOutVal) {
        alert("Please select a date, time in, and time out first.");
        return;
      }

      tableContainer.style.display = 'block';
      tableLoading.style.display = 'inline-block';
      tableGrid.innerHTML = '';
      selectedTableInput.value = '';
      submitBookingBtn.style.display = 'none';
      statusMsg.style.display = 'none';

      allBookings = await fetchBookings();

      const newStartParts = timeInVal.split(':');
      const newStartMins = parseInt(newStartParts[0]) * 60 + parseInt(newStartParts[1]);

      const newEndParts = timeOutVal.split(':');
      const newEndMins = parseInt(newEndParts[0]) * 60 + parseInt(newEndParts[1]);

      if (newEndMins <= newStartMins) {
        alert("Time Out must be after Time In.");
        tableLoading.style.display = 'none';
        tableContainer.style.display = 'none';
        return;
      }

      const occupiedTables = new Set();

      const normalizeDate = (dStr) => {
        if (!dStr) return "";
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return dStr.toString().trim();
      };

      allBookings.forEach(booking => {
        const existingDateRaw = booking.Date || booking.date;
        const normalizedExistingDate = normalizeDate(existingDateRaw);

        if (normalizedExistingDate === dateVal) {
          const existingTimeInStr = booking["Time In"] || booking.timeIn || booking.time_in || "";
          const existingTimeOutStr = booking["Time Out"] || booking.timeOut || booking.time_out || "";

          if (existingTimeInStr && existingTimeOutStr) {
            // Parses both HH:MM and Google Sheet's ISO Time Strings safely
            const extractMins = (tStr) => {
              let cleanTime = tStr.toString().trim();
              if (cleanTime.includes('T')) {
                const d = new Date(cleanTime);
                return d.getHours() * 60 + d.getMinutes();
              } else {
                let parts = cleanTime.split(':');
                if (parts.length < 2) return 0;
                let h = parseInt(parts[0], 10);
                let m = parseInt(parts[1], 10);
                return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
              }
            };

            const existingStartMins = extractMins(existingTimeInStr);
            const existingEndMins = extractMins(existingTimeOutStr);

            // STRICT Overlap Rule: newStart < existingEnd AND newEnd > existingStart
            if (newStartMins < existingEndMins && newEndMins > existingStartMins) {
              const tableNo = parseInt(booking["Table No"] || booking.tableNo || booking.table_no, 10);
              if (!isNaN(tableNo)) occupiedTables.add(tableNo);
            }
          }
        }
      });

      let availableCount = 0;
      for (let i = 1; i <= 10; i++) {
        // ONLY DISPLAY AVAILABLE TABLES
        if (!occupiedTables.has(i)) {
          availableCount++;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'table-btn';
          btn.textContent = `Table ${i}`;

          btn.addEventListener('click', () => {
            document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTableInput.value = i;
            submitBookingBtn.style.display = 'block';
          });

          tableGrid.appendChild(btn);
        }
      }

      if (availableCount === 0) {
        tableGrid.innerHTML = '<p class="text-light">No tables available for this time slot. Please select a different time.</p>';
      }

      tableLoading.style.display = 'none';
      checkAvailabilityBtn.style.display = 'none';
    };

    if (checkAvailabilityBtn) {
      checkAvailabilityBtn.addEventListener('click', performAvailabilityCheck);
    }

    const resetAvailability = () => {
      if (tableContainer) tableContainer.style.display = 'none';
      if (submitBookingBtn) submitBookingBtn.style.display = 'none';
      if (checkAvailabilityBtn) checkAvailabilityBtn.style.display = 'block';
      if (selectedTableInput) selectedTableInput.value = '';
    };

    if (dateInput) dateInput.addEventListener('change', resetAvailability);
    if (timeInInput) timeInInput.addEventListener('change', resetAvailability);
    if (timeOutInput) timeOutInput.addEventListener('change', resetAvailability);

    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const phone = document.getElementById('contact').value;
      const selectedDate = document.getElementById('date').value;
      const selectedTimeIn = document.getElementById('timeIn').value;
      const selectedTimeOut = document.getElementById('timeOut').value;
      const selectedTable = selectedTableInput.value;

      if (!selectedTable) {
        alert("Please select an available table.");
        return;
      }

      submitBookingBtn.textContent = 'Processing...';
      submitBookingBtn.disabled = true;
      statusMsg.style.display = 'none';

      try {
        // Send data to Google Sheets (Server-side validation FIRST)
        const response = await fetch(GOOGLE_SHEET_API_URL, {
          method: "POST",
          body: JSON.stringify({
            date: selectedDate,
            timeIn: selectedTimeIn,
            timeOut: selectedTimeOut,
            tableNo: selectedTable,
            customerName: name,
            contactNo: phone
          })
        });

        // STRICT Server Authority: Must read actual JSON response from backend
        let result = await response.json();

        if (result.status === "error") {
          // Table is already booked (server-side validation failed)
          statusMsg.className = 'alert alert-danger mt-4 text-center';
          statusMsg.innerHTML = `<strong>Error:</strong> ${result.message || "Selected table is not available for this time slot."}`;
          statusMsg.style.display = 'block';

          // Re-fetch available tables automatically
          await performAvailabilityCheck();
        } else if (result.status === "success") {
          // Backend confirmed save -> Trigger WhatsApp
          const message = `Reservation Request - The Grand Monarque\n\nName: ${name}\nContact: ${phone}\nDate: ${selectedDate}\nTime: ${selectedTimeIn} - ${selectedTimeOut}\nTable: ${selectedTable}`;
          const whatsappURL = `https://wa.me/94773894604?text=${encodeURIComponent(message)}`;
          window.open(whatsappURL, "_blank");

          // Update UI immediately (remove selected table, reset form)
          document.querySelectorAll('.table-btn.selected').forEach(btn => btn.remove());
          bookingForm.reset();
          resetAvailability();

          statusMsg.className = 'alert alert-success mt-4 text-center';
          statusMsg.style.backgroundColor = 'rgba(25, 135, 84, 0.2)';
          statusMsg.style.color = '#fff';
          statusMsg.style.border = '1px solid #198754';
          statusMsg.innerHTML = '<h5 class="mb-2 text-gold">Reservation Confirmed!</h5><p class="mb-0">Your table has been successfully booked.</p>';
          statusMsg.style.display = 'block';
          setTimeout(() => { statusMsg.style.display = 'none'; }, 10000); // Auto-hide after 10s
        } else {
          throw new Error("Invalid response from server");
        }

      } catch (err) {
        console.error("Error saving booking:", err);
        statusMsg.className = 'alert alert-danger mt-4 text-center';
        statusMsg.innerHTML = "There was a network error communicating with the booking system. Please try again.";
        statusMsg.style.display = 'block';
      } finally {
        submitBookingBtn.textContent = 'Confirm & Book via WhatsApp';
        submitBookingBtn.disabled = false;
      }
    });
  }

  // 3. Simple Password Gate for Dashboard (dashboard.html)
  const dashboardGate = document.getElementById('dashboardGate');
  const dashboardContent = document.getElementById('dashboardContent');
  const passwordInput = document.getElementById('dashboardPassword');
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('loginError');

  if (dashboardGate && loginBtn) {
    loginBtn.addEventListener('click', () => {
      const pwd = passwordInput.value;
      // Simple hardcoded password for demonstration
      if (pwd === 'monarque2026') {
        dashboardGate.style.display = 'none';
        dashboardContent.style.display = 'block';
      } else {
        errorMsg.style.display = 'block';
      }
    });

    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  }

  // 4. Infinite Carousel Marquee Logic
  const carouselMarquee = document.getElementById('carouselMarquee');
  if (carouselMarquee) {
    // Duplicate the content to create a seamless loop
    const carouselContent = carouselMarquee.innerHTML;
    carouselMarquee.innerHTML += carouselContent;
  }

  // 5. Menu Gallery Fit-to-Screen Modal Logic
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const antigravityImgs = document.querySelectorAll('.antigravity-float');
  
  if (modal && modalImg) {
    antigravityImgs.forEach(img => {
      img.addEventListener('click', function() {
        modal.style.display = "flex";
        modalImg.src = this.src;
      });
    });

    // Close on click anywhere
    modal.addEventListener('click', function() {
      modal.style.display = "none";
    });
  }

});
