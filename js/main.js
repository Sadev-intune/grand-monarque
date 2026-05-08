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
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    const dateInput = document.getElementById('date');
    const timeInInput = document.getElementById('timeIn');
    const timeOutInput = document.getElementById('timeOut');
    const submitBookingBtn = document.getElementById('submitBookingBtn');

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('contact').value.trim();
      const selectedDate = dateInput.value;
      const selectedTimeIn = timeInInput.value;
      const selectedTimeOut = timeOutInput.value;
      const guests = document.getElementById('guests').value;

      if (!name || !phone || !selectedDate || !selectedTimeIn || !selectedTimeOut || !guests) {
        alert('Please complete all reservation fields.');
        return;
      }

      submitBookingBtn.textContent = 'Opening WhatsApp...';
      submitBookingBtn.disabled = true;

      const message = `Reservation Request - The Grand Monarque\n\nName: ${name}\nContact: ${phone}\nDate: ${selectedDate}\nTime: ${selectedTimeIn} - ${selectedTimeOut}\nGuests: ${guests}`;
      const whatsappURL = `https://wa.me/94773894604?text=${encodeURIComponent(message)}`;
      window.open(whatsappURL, '_blank');
      bookingForm.reset();
      submitBookingBtn.textContent = 'Confirm & Book via WhatsApp';
      submitBookingBtn.disabled = false;
    });
  }

  // 2b. Menu Order Builder (menu.html)
  const orderItemsContainer = document.getElementById('orderItemsContainer');
  const addOrderItemBtn = document.getElementById('addOrderItemBtn');
  const clearOrderBtn = document.getElementById('clearOrderBtn');
  const orderTotalEl = document.getElementById('orderTotal');
  const submitOrderBtn = document.getElementById('submitOrderBtn');
  const customerNameInput = document.getElementById('customerName');
  const customerPhoneInput = document.getElementById('customerPhone');
  const tableNoInput = document.getElementById('tableNo');

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
    qtyInput.value = '';
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
      updateOrderTotal();
    });
    qtyInput.addEventListener('blur', () => {
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
        qtyInput.value = '';
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
    if (tableNoInput) tableNoInput.value = '';
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
    const tableNo = tableNoInput ? tableNoInput.value.trim() : '';

    let message = 'Order Request - The Grand Monarque\n\n';
    if (customerName) message += `Name: ${customerName}\n`;
    if (customerPhone) message += `Contact: ${customerPhone}\n`;
    if (tableNo) message += `Table No: ${tableNo}\n`;
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

  if (submitOrderBtn) {
    submitOrderBtn.addEventListener('click', () => {
      const rawMessage = buildOrderMessage();
      if (!rawMessage) {
        alert('Please select at least one food item with quantity before ordering.');
        return;
      }
      const whatsappURL = `https://wa.me/94773894604?text=${encodeURIComponent(rawMessage)}`;
      window.open(whatsappURL, '_blank');
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
