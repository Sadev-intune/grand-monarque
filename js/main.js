document.addEventListener('DOMContentLoaded', () => {

  // Antigravity Scroll Animation System
  const targetSelectors = ['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'];
  const antigravityElements = [];

  targetSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Skip if already has reveal class, is inside nav/footer/carousel, or is empty div
      if (!el.classList.contains('reveal-left') && !el.classList.contains('reveal-right') && !el.classList.contains('reveal-center') &&
          !el.closest('nav') && !el.closest('footer') && !el.closest('#carouselMarquee') &&
          (selector !== 'div' || el.textContent.trim() !== '')) {
        antigravityElements.push(el);
      }
    });
  });

  // Assign directional classes based on position
  antigravityElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const elCenterX = rect.left + rect.width / 2;
    const threshold = 100; // pixels from center to consider centered

    if (Math.abs(elCenterX - centerX) < threshold) {
      el.classList.add('reveal-center');
    } else if (elCenterX < centerX) {
      el.classList.add('reveal-left');
    } else {
      el.classList.add('reveal-right');
    }
  });

  // Intersection Observer for reveal
  let staggerIndex = 0;
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const antigravityObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger the reveal
        setTimeout(() => {
          entry.target.classList.add('visible');
          // Add floating after transition
          entry.target.addEventListener('transitionend', () => {
            entry.target.classList.add('floating');
          }, { once: true });
        }, staggerIndex * 100);
        staggerIndex++;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  antigravityElements.forEach(el => {
    antigravityObserver.observe(el);
  });

  // 2. Scroll-to-Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-left, .reveal-right');

  if (revealElements.length > 0) {
    const revealObserverOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, revealObserverOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // 3. Reservation System Logic (reserve.html)
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

    // ── BOOKING FORM VALIDATION ─────────────────────────────────────────────────
  // Replace the existing bookingForm submit listener in main.js with this block

  const bookingShowError = (inputEl, message) => {
    bookingClearError(inputEl);
    inputEl.style.borderColor = '#dc3545';
    inputEl.style.boxShadow = '0 0 0 2px rgba(220,53,69,0.25)';
    const err = document.createElement('div');
    err.className = 'booking-validation-error';
    err.style.cssText = [
      'color:#dc3545',
      'font-size:13px',
      'margin-top:6px',
      'padding:7px 12px',
      'background:rgba(220,53,69,0.12)',
      'border:1px solid rgba(220,53,69,0.4)',
      'border-radius:6px',
      'display:flex',
      'align-items:center',
      'gap:6px'
    ].join(';');
    err.innerHTML = `<span style="font-size:15px">⚠</span> ${message}`;
    inputEl.parentNode.appendChild(err);
  };

  const bookingClearError = (inputEl) => {
    inputEl.style.borderColor = '';
    inputEl.style.boxShadow = '';
    const existing = inputEl.parentNode.querySelector('.booking-validation-error');
    if (existing) existing.remove();
  };

  const bookingClearAll = () => {
    document.querySelectorAll('.booking-validation-error').forEach(e => e.remove());
    ['name','contact','date','guests','timeIn','timeOut'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.borderColor = ''; el.style.boxShadow = ''; }
    });
  };

  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/[\s\-().+]/g, '');
    return /^\d{7,15}$/.test(cleaned); // 7–15 digits, any country
  };

  const toMins = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  if (bookingForm) {
    // Clear individual field error on user input
    ['name','contact','date','guests','timeIn','timeOut'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => bookingClearError(el));
        el.addEventListener('change', () => bookingClearError(el));
      }
    });

    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      bookingClearAll();

      const nameEl    = document.getElementById('name');
      const contactEl = document.getElementById('contact');
      const dateEl    = document.getElementById('date');
      const guestsEl  = document.getElementById('guests');
      const timeInEl  = document.getElementById('timeIn');
      const timeOutEl = document.getElementById('timeOut');

      let valid = true;

      // ── Full Name ──────────────────────────────────────────────────────────
      if (!nameEl.value.trim()) {
        bookingShowError(nameEl, 'Full name is required.');
        valid = false;
      } else if (nameEl.value.trim().length < 2) {
        bookingShowError(nameEl, 'Please enter a valid full name.');
        valid = false;
      }

      // ── Contact Number ─────────────────────────────────────────────────────
      if (!contactEl.value.trim()) {
        bookingShowError(contactEl, 'Contact number is required.');
        valid = false;
      } else if (!isValidPhone(contactEl.value.trim())) {
        bookingShowError(contactEl, 'Enter a valid phone number (e.g. 0430 210 115 or +61 3 1234 5678).');
        valid = false;
      }

      // ── Date ───────────────────────────────────────────────────────────────
      if (!dateEl.value) {
        bookingShowError(dateEl, 'Please select a date.');
        valid = false;
      } else {
        const chosen = new Date(dateEl.value);
        const today  = new Date();
        today.setHours(0, 0, 0, 0);
        if (chosen < today) {
          bookingShowError(dateEl, 'Date cannot be in the past.');
          valid = false;
        }
      }

      // ── Guests ─────────────────────────────────────────────────────────────
      if (!guestsEl.value) {
        bookingShowError(guestsEl, 'Please select the number of guests.');
        valid = false;
      }

      // ── Time In ────────────────────────────────────────────────────────────
      if (!timeInEl.value) {
        bookingShowError(timeInEl, 'Please select a check-in time.');
        valid = false;
      }

      // ── Time Out ───────────────────────────────────────────────────────────
      if (!timeOutEl.value) {
        bookingShowError(timeOutEl, 'Please select a check-out time.');
        valid = false;
      }

      // ── Time logic: Time Out must be AFTER Time In ─────────────────────────
      if (timeInEl.value && timeOutEl.value) {
        const inMins  = toMins(timeInEl.value);
        const outMins = toMins(timeOutEl.value);
        if (outMins <= inMins) {
          bookingShowError(timeOutEl, 'Check-out time must be later than check-in time.');
          valid = false;
        } else if (outMins - inMins < 30) {
          bookingShowError(timeOutEl, 'Minimum booking duration is 30 minutes.');
          valid = false;
        }
      }

      // ── Scroll to first error ───────────────────────────────────────────────
      if (!valid) {
        const firstErr = document.querySelector('.booking-validation-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // ── ALL VALID — proceed with existing Google Sheets + WhatsApp logic ───
      const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxQqSXgauAGwkUjeDpuVeEuC8upS9sCoaP-jlgzslNuQenDOo02UbChcigSALQ77Hrq/exec';

      const submitBtn = document.getElementById('submitBookingBtn');
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      // Show/hide status message
      let statusMsg = bookingForm.querySelector('.booking-status-msg');
      if (!statusMsg) {
        statusMsg = document.createElement('div');
        statusMsg.className = 'booking-status-msg alert mt-4 text-center';
        statusMsg.style.display = 'none';
        bookingForm.appendChild(statusMsg);
      }
      statusMsg.style.display = 'none';

      try {
        const response = await fetch(GOOGLE_SHEET_API_URL, {
          method: 'POST',
          body: JSON.stringify({
            date:         dateEl.value,
            timeIn:       timeInEl.value,
            timeOut:      timeOutEl.value,
            tableNo:      document.getElementById('selectedTable')?.value || '',
            customerName: nameEl.value.trim(),
            contactNo:    contactEl.value.trim(),
            guests:       guestsEl.value
          })
        });

        const result = await response.json();

        if (result.status === 'error') {
          statusMsg.className = 'booking-status-msg alert mt-4 text-center';
          statusMsg.style.cssText = 'display:block;background:rgba(220,53,69,0.15);color:#fff;border:1px solid #dc3545;border-radius:8px;padding:14px;';
          statusMsg.innerHTML = `<strong>⚠ Error:</strong> ${result.message || 'Selected table is not available. Please choose another.'}`;

        } else if (result.status === 'success') {
          const msg =
            `Reservation Request — The Grand Monarque\n\n` +
            `Name: ${nameEl.value.trim()}\n` +
            `Contact: ${contactEl.value.trim()}\n` +
            `Guests: ${guestsEl.value}\n` +
            `Date: ${dateEl.value}\n` +
            `Time: ${timeInEl.value} – ${timeOutEl.value}\n` +
            `Table: ${document.getElementById('selectedTable')?.value || 'TBC'}`;

          window.open(`https://wa.me/61430210115?text=${encodeURIComponent(msg)}`, '_blank');

          bookingForm.reset();
          statusMsg.style.cssText = 'display:block;background:rgba(25,135,84,0.15);color:#fff;border:1px solid #198754;border-radius:8px;padding:14px;';
          statusMsg.innerHTML = '<h5 style="color:#c5a059;margin-bottom:6px">Reservation Confirmed!</h5><p style="margin:0">Your table has been successfully booked.</p>';
          setTimeout(() => { statusMsg.style.display = 'none'; }, 10000);

        } else {
          throw new Error('Invalid server response');
        }

      } catch (err) {
        console.error('Booking error:', err);
        statusMsg.style.cssText = 'display:block;background:rgba(220,53,69,0.15);color:#fff;border:1px solid #dc3545;border-radius:8px;padding:14px;';
        statusMsg.innerHTML = '⚠ Network error. Please try again or contact us directly.';
        statusMsg.style.display = 'block';

      } finally {
        submitBtn.textContent = 'Confirm & Book via WhatsApp';
        submitBtn.disabled = false;
      }
    });
  }
  }

  // 2b. Menu Order Builder (menu.html)
  const orderItemsContainer = document.getElementById('orderItemsContainer');
  const addOrderItemBtn = document.getElementById('addOrderItemBtn');
  const clearOrderBtn = document.getElementById('clearOrderBtn');
  const orderTotalEl = document.getElementById('orderTotal');
  const submitOrderBtn = document.getElementById('submitOrderBtn');
  const customerNameInput = document.getElementById('customerName');
  const customerPhoneInput = document.getElementById('customerPhone');
  const customerLocationInput = document.getElementById('customerLocation');

  const menuItems = [
    { name: 'Grilled Sourdough', price: 15.99 },
    { name: 'Egg & Bacon Roll', price: 15.99 },
    { name: 'Breakfast Burrito', price: 16.99 },
    { name: 'Eggs Benedict', price: 17.99 },
    { name: 'Big Breakfast', price: 29.99 },
    { name: 'Sandwich', price: 11.99 },
    { name: 'String Hoppers', price: 19.99 },
    { name: 'Roast Bread', price: 19.99 },
    { name: 'Coconut Roti', price: 5.99 },
    { name: 'Samosas (3 PCS)', price: 8.49 },
    { name: 'Onion Rings (8 PCS)', price: 12.99 },
    { name: 'Spring Rolls (4 PCS)', price: 14.99 },
    { name: 'Coco Prawns (5 PCS)', price: 11.99 },
    { name: 'Regal Calamari (4 PCS)', price: 11.99 },
    { name: 'Monarque Sharing Platter', price: 24.99 },
    { name: 'Grand Buffalo Wings (5 PCS)', price: 8.99 },
    { name: 'Arancini Di Monarque (5 PCS)', price: 9.99 },
    { name: 'Prawn & Ginger Dumplings (4 PCS)', price: 24.99 },
    { name: 'French Fries', price: 8.49 },
    { name: 'Mash Bombs (5 PCS)', price: 8.49 },
    { name: 'Chicken Nuggets (6 PCS)', price: 11.99 },
    { name: 'Vegetable Only Rice & Curry', price: 14.99 },
    { name: 'Chicken Rice & Curry', price: 15.99 },
    { name: 'Beef Rice & Curry', price: 18.99 },
    { name: 'Pork Rice & Curry', price: 17.99 },
    { name: 'Firehawk Burger + Fries', price: 19.99 },
    { name: 'Avo Wrap + Fries', price: 21.99 },
    { name: 'Club Sandwich', price: 21.99 },
    { name: 'Caesar Salad', price: 17.99 },
    { name: 'Salmon Niçoise Salad', price: 22.99 },
    { name: 'Garden Salad', price: 13.99 },
    { name: 'Fish & Chips', price: 18.99 },
    { name: 'Smokeshow Burger + Fries', price: 23.99 },
    { name: 'Vegetable Fried Rice', price: 13.99 },
    { name: 'Egg Fried Rice', price: 14.99 },
    { name: 'Sausage Fried Rice', price: 16.99 },
    { name: 'Chicken Fried Rice', price: 17.99 },
    { name: 'Deviled Chicken Fried Rice', price: 18.99 },
    { name: 'Seafood Fried Rice', price: 21.99 },
    { name: 'Prawn Fried Rice', price: 20.99 },
    { name: 'Nasi Goreng Chicken', price: 20.99 },
    { name: 'Nasi Goreng Seafood', price: 23.99 },
    { name: 'Meat Lovers’ Fried Rice', price: 28.99 },
    { name: 'Pork Fried Rice', price: 19.99 },
    { name: 'Grand Monarque Special Fried Rice', price: 34.99 },
    { name: 'Vegetable Kottu (Medium)', price: 15.99 },
    { name: 'Vegetable Kottu (Large)', price: 18.99 },
    { name: 'Egg Kottu (Medium)', price: 16.99 },
    { name: 'Egg Kottu (Large)', price: 19.99 },
    { name: 'Roast Chicken Kottu (Medium)', price: 18.99 },
    { name: 'Roast Chicken Kottu (Large)', price: 21.99 },
    { name: 'Curry Chicken Kottu (Medium)', price: 18.99 },
    { name: 'Curry Chicken Kottu (Large)', price: 21.99 },
    { name: 'Pork Kottu (Medium)', price: 19.99 },
    { name: 'Pork Kottu (Large)', price: 22.99 },
    { name: 'Seafood Kottu (Medium)', price: 24.99 },
    { name: 'Seafood Kottu (Large)', price: 27.99 },
    { name: 'Nasi Goreng', price: 21.99 },
    { name: 'Mongolian Rice', price: 24.99 },
    { name: 'Singapore Noodles', price: 24.99 },
    { name: 'Spaghetti & Meatballs', price: 20.99 },
    { name: 'Mixed Grill Feast', price: 119.99 },
    { name: 'Chicken Parmigiana + Fries', price: 23.99 },
    { name: 'Garlic Grilled Prawns', price: 35.99 },
    { name: 'Samurai Tempura Prawns', price: 32.99 },
    { name: 'Ocean King Fish Feast', price: 35.99 },
    { name: 'Seafood Grill Feast', price: 134.99 },
    { name: 'Hot Butter Cuttlefish', price: 27.99 },
    { name: 'Hot Butter Mushroom', price: 21.99 },
    { name: 'Fried Chili Chicken', price: 23.99 },
    { name: 'Deviled Chicken', price: 22.99 },
    { name: 'Deviled Pork', price: 22.99 },
    { name: 'Devilled Fish', price: 22.99 },
    { name: 'Zesty Anchovy Fry', price: 19.99 },
    { name: 'Kochchi Sausage Bite', price: 24.99 },
    { name: 'Watalappan', price: 7.49 },
    { name: 'Crème Caramel', price: 6.49 },
    { name: 'Cheesecake', price: 9.99 },
    { name: 'Hot Brownie', price: 7.99 },
    { name: 'Ice Cream (Chocolate | Vanilla)', price: 4.99 }
  ];

  const priceMap = new Map(menuItems.map(item => [item.name, item.price]));

  const formatCurrency = (value) => value.toFixed(2);

  const updateOrderTotal = () => {
    const rows = orderItemsContainer.querySelectorAll('.order-item-row');
    const total = Array.from(rows).reduce((sum, row) => {
      const price = parseFloat(row.querySelector('.order-item-price').value) || 0;
      const qty = parseInt(row.querySelector('.order-item-qty').value, 10) || 0;
      return sum + price * qty;
    }, 0);
    orderTotalEl.textContent = formatCurrency(total);
  };

  const createOrderRow = () => {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-3 order-item-row';

    const itemCol = document.createElement('div');
    itemCol.className = 'col-md-5';
    const itemLabel = document.createElement('label');
    itemLabel.className = 'form-label';
    itemLabel.textContent = 'Food Item';
    const itemSelect = document.createElement('select');
    itemSelect.className = 'form-select order-item-select';
    itemSelect.innerHTML = '<option value="">Select a food item</option>';
    menuItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = `${item.name}`;
      itemSelect.appendChild(option);
    });
    itemCol.append(itemLabel, itemSelect);

    const priceCol = document.createElement('div');
    priceCol.className = 'col-md-3';
    const priceLabel = document.createElement('label');
    priceLabel.className = 'form-label';
    priceLabel.textContent = 'Price per One';
    const priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.className = 'form-control order-item-price';
    priceInput.value = formatCurrency(0);
    priceInput.readOnly = true;
    priceCol.append(priceLabel, priceInput);

    const qtyCol = document.createElement('div');
    qtyCol.className = 'col-md-2';
    const qtyLabel = document.createElement('label');
    qtyLabel.className = 'form-label';
    qtyLabel.textContent = 'Quantity';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'form-control order-item-qty';
    qtyInput.min = '1';
    qtyInput.value = '1';
    qtyCol.append(qtyLabel, qtyInput);

    const removeCol = document.createElement('div');
    removeCol.className = 'col-md-2';
    const removeLabel = document.createElement('label');
    removeLabel.className = 'form-label text-transparent';
    removeLabel.textContent = 'Remove';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-light w-100 remove-order-item';
    removeBtn.textContent = 'Remove';
    removeCol.append(removeLabel, removeBtn);

    const updateRow = () => {
      const unitPrice = priceMap.get(itemSelect.value) || 0;
      priceInput.value = formatCurrency(unitPrice);
      if (!qtyInput.value || parseInt(qtyInput.value, 10) < 1) {
        qtyInput.value = '1';
      }
      updateOrderTotal();
    };

    itemSelect.addEventListener('change', updateRow);
    qtyInput.addEventListener('input', () => {
      if (!qtyInput.value || parseInt(qtyInput.value, 10) < 1) {
        qtyInput.value = '1';
      }
      updateOrderTotal();
    });

    removeBtn.addEventListener('click', () => {
      if (orderItemsContainer.children.length > 1) {
        row.remove();
      } else {
        itemSelect.value = '';
        priceInput.value = formatCurrency(0);
        qtyInput.value = '1';
      }
      updateOrderTotal();
    });

    row.append(itemCol, priceCol, qtyCol, removeCol);
    return row;
  };

  const resetOrder = () => {
    orderItemsContainer.innerHTML = '';
    orderItemsContainer.appendChild(createOrderRow());
    orderTotalEl.textContent = formatCurrency(0);
    if (customerNameInput) customerNameInput.value = '';
    if (customerPhoneInput) customerPhoneInput.value = '';
    if (customerLocationInput) customerLocationInput.value = '';
  };

  const buildOrderMessage = () => {
    const rows = Array.from(orderItemsContainer.querySelectorAll('.order-item-row'));
    const selectedItems = rows
      .map(row => {
        const itemName = row.querySelector('.order-item-select').value;
        const itemPrice = parseFloat(row.querySelector('.order-item-price').value) || 0;
        const qty = parseInt(row.querySelector('.order-item-qty').value, 10) || 0;
        if (!itemName || qty < 1) return null;
        return `${itemName} x ${qty} = ${formatCurrency(itemPrice * qty)}`;
      })
      .filter(Boolean);

    if (selectedItems.length === 0) {
      return null;
    }

    const total = orderTotalEl.textContent;
    const customerName = customerNameInput ? customerNameInput.value.trim() : '';
    const customerPhone = customerPhoneInput ? customerPhoneInput.value.trim() : '';
    const customerLocation = customerLocationInput ? customerLocationInput.value.trim() : '';

    let message = 'Order Request - The Grand Monarque\n\n';
    if (customerName) message += `Name: ${customerName}\n`;
    if (customerPhone) message += `Contact: ${customerPhone}\n`;
    if (customerLocation) message += `Location: ${customerLocation}\n`;
    message += `\nItems:\n${selectedItems.join('\n')}\n\nTotal: ${total}`;
    return message;
  };

  if (orderItemsContainer) {
    orderItemsContainer.appendChild(createOrderRow());
  }

  if (addOrderItemBtn) {
    addOrderItemBtn.addEventListener('click', () => {
      orderItemsContainer.appendChild(createOrderRow());
      orderItemsContainer.lastElementChild.querySelector('.order-item-select').focus();
    });
  }

  if (clearOrderBtn) {
    clearOrderBtn.addEventListener('click', resetOrder);
  }

  // ── VALIDATION HELPERS ──────────────────────────────────────────────────────
  const showError = (inputEl, message) => {
    clearError(inputEl);
    inputEl.style.borderColor = '#dc3545';
    const err = document.createElement('div');
    err.className = 'order-validation-error';
    err.style.cssText = 'color:#dc3545;font-size:13px;margin-top:5px;padding:6px 10px;background:rgba(220,53,69,0.12);border:1px solid rgba(220,53,69,0.4);border-radius:6px;';
    err.textContent = message;
    inputEl.parentNode.appendChild(err);
  };

  const clearError = (inputEl) => {
    inputEl.style.borderColor = '';
    const existing = inputEl.parentNode.querySelector('.order-validation-error');
    if (existing) existing.remove();
  };

  const clearAllErrors = () => {
    document.querySelectorAll('.order-validation-error').forEach(e => e.remove());
    [customerNameInput, customerPhoneInput, document.getElementById('tableNo')].forEach(el => {
      if (el) el.style.borderColor = '';
    });
  };

  const isValidAustralianPhone = (phone) => {
    // Accepts: 04XX XXX XXX, +614XX XXX XXX, 614XXXXXXXX — strips spaces/dashes
    const cleaned = phone.replace(/[\s\-().]/g, '');
    return /^(\+?61)?0?4\d{8}$/.test(cleaned) ||   // Australian mobile
           /^(\+?61)?[2378]\d{8}$/.test(cleaned) || // Australian landline
           /^\+?\d{7,15}$/.test(cleaned);            // Any international fallback
  };

  // ── SUBMIT WITH VALIDATION ──────────────────────────────────────────────────
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener('click', () => {
      clearAllErrors();
      let valid = true;

      // 1. Check at least one food item is selected
      const rows = Array.from(orderItemsContainer.querySelectorAll('.order-item-row'));
      const hasItems = rows.some(row => {
        const sel = row.querySelector('.order-item-select').value;
        const qty = parseInt(row.querySelector('.order-item-qty').value, 10);
        return sel && qty >= 1;
      });

      if (!hasItems) {
        // Show error banner above the items container
        let itemsErr = document.getElementById('orderItemsError');
        if (!itemsErr) {
          itemsErr = document.createElement('div');
          itemsErr.id = 'orderItemsError';
          itemsErr.style.cssText = 'color:#dc3545;font-size:13px;margin-bottom:10px;padding:8px 12px;background:rgba(220,53,69,0.12);border:1px solid rgba(220,53,69,0.4);border-radius:6px;';
          orderItemsContainer.parentNode.insertBefore(itemsErr, orderItemsContainer);
        }
        itemsErr.textContent = '⚠ Please select at least one food item before ordering.';
        itemsErr.style.display = 'block';
        valid = false;
      } else {
        const itemsErr = document.getElementById('orderItemsError');
        if (itemsErr) itemsErr.style.display = 'none';
      }

      // 2. Check customer name
      if (customerNameInput) {
        const name = customerNameInput.value.trim();
        if (!name) {
          showError(customerNameInput, '⚠ Customer name is required.');
          valid = false;
        } else if (name.length < 2) {
          showError(customerNameInput, '⚠ Please enter a valid full name.');
          valid = false;
        } else {
          clearError(customerNameInput);
        }
      }

      // 3. Check table is selected
      const tableNoEl = document.getElementById('tableNo');
      if (tableNoEl && !tableNoEl.value) {
        showError(tableNoEl, '⚠ Please select a table number.');
        valid = false;
      } else if (tableNoEl) {
        clearError(tableNoEl);
      }

      // 3. Check contact number
      if (customerPhoneInput) {
        const phone = customerPhoneInput.value.trim();
        if (!phone) {
          showError(customerPhoneInput, '⚠ Contact number is required.');
          valid = false;
        } else if (!isValidAustralianPhone(phone)) {
          showError(customerPhoneInput, '⚠ Phone number doesn\'t look right. Enter a valid Australian mobile (e.g. 0430 210 115) or international number.');
          valid = false;
        } else {
          clearError(customerPhoneInput);
        }
      }

      if (!valid) {
        // Scroll to first error smoothly
        const firstErr = document.querySelector('.order-validation-error, #orderItemsError');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // ── All valid — build and send WhatsApp message ─────────────────────────
      const rawMessage = buildOrderMessage();
      if (!rawMessage) return;

      const tableNo = tableNoEl ? tableNoEl.value : '';
      const customerName = customerNameInput ? customerNameInput.value.trim() : '';
      const customerPhone = customerPhoneInput ? customerPhoneInput.value.trim() : '';

      const rows2 = Array.from(orderItemsContainer.querySelectorAll('.order-item-row'));
      const selectedItems = rows2
        .map(row => {
          const itemName = row.querySelector('.order-item-select').value;
          const itemPrice = parseFloat(row.querySelector('.order-item-price').value) || 0;
          const qty = parseInt(row.querySelector('.order-item-qty').value, 10) || 0;
          if (!itemName || qty < 1) return null;
          return `${itemName} x ${qty} = $${(itemPrice * qty).toFixed(2)}`;
        })
        .filter(Boolean);

      const total = orderTotalEl.textContent;

      let message = '🍽 *Order Request — The Grand Monarque*\n\n';
      if (customerName) message += `👤 Name: ${customerName}\n`;
      message += `📞 Contact: ${customerPhone}\n`;
      if (tableNo) message += `🪑 Table: ${tableNo}\n`;
      message += `\n*Items:*\n${selectedItems.join('\n')}\n\n*Total: $${total}*`;

      const whatsappURL = `https://wa.me/61430210115?text=${encodeURIComponent(message)}`;
      window.open(whatsappURL, '_blank');
    });
  }

  // 2c. Interactive Melbourne Map for location selection
  const orderMapContainer = document.getElementById('orderMap');
  if (orderMapContainer && window.L) {
    const defaultCenter = [-37.8136, 144.9631];
    const map = L.map(orderMapContainer).setView(defaultCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker(defaultCenter, { draggable: true }).addTo(map);
    marker.bindPopup('Drag the marker or click the map to choose a location.').openPopup();

    const updateLocationFromCoords = async (latlng) => {
      if (!customerLocationInput) return;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.display_name) {
          customerLocationInput.value = data.display_name;
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    };

    map.on('click', function (event) {
      marker.setLatLng(event.latlng);
      map.setView(event.latlng, 15);
      updateLocationFromCoords(event.latlng);
    });

    marker.on('dragend', function () {
      const position = marker.getLatLng();
      map.setView(position, 15);
      updateLocationFromCoords(position);
    });

    if (window.L.Control && window.L.Control.Geocoder) {
      const geocoder = L.Control.Geocoder.nominatim();
      const geocoderControl = L.Control.geocoder({
        geocoder,
        defaultMarkGeocode: false,
        placeholder: 'Search Melbourne address'
      }).addTo(map);

      geocoderControl.on('markgeocode', function (e) {
        const center = e.geocode.center;
        marker.setLatLng(center);
        map.setView(center, 15);
        if (customerLocationInput) {
          customerLocationInput.value = e.geocode.html || e.geocode.name || '';
        }
      });
    }
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
    const originalHTML = carouselMarquee.innerHTML;
    carouselMarquee.innerHTML = originalHTML.repeat(4);

    // Wait for all images to fully load first
    window.addEventListener('load', () => {
      const oneSetWidth = carouselMarquee.scrollWidth / 4;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
      @keyframes scrollMarquee {
        0%   { transform: translateX(0px); }
        100% { transform: translateX(-${oneSetWidth}px); }
      }
    `;
      document.head.appendChild(styleSheet);
    });
  }
  // 5. Menu Gallery Fit-to-Screen Modal Logic
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const antigravityImgs = document.querySelectorAll('.antigravity-float');

  if (modal && modalImg) {
    antigravityImgs.forEach(img => {
      img.addEventListener('click', function () {
        modal.style.display = "flex";
        modalImg.src = this.src;
      });
    });

    // Close on click anywhere
    modal.addEventListener('click', function () {
      modal.style.display = "none";
    });
  }

});
