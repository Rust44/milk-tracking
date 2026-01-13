// Milk Delivery Tracker - Main JavaScript File

// Constants and Configuration
const CONFIG = {
    DEFAULT_MILK_PRICE: 60,
    STORAGE_KEY: 'ram_milk_delivery_data',
    CUSTOMERS_KEY: 'ram_milk_customers',
    SETTINGS_KEY: 'ram_milk_settings'
};

// Global State
let deliveryData = {};
let customers = [];
let settings = {};
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let selectedDate = null;
let editingDate = null;
let editingCustomerId = null;

// DOM Elements
const dom = {
    // Navigation
    sidebar: document.querySelector('.sidebar'),
    navLinks: document.querySelectorAll('.nav-link'),
    pages: document.querySelectorAll('.page'),
    menuToggle: document.querySelector('.menu-toggle'),
    
    // Header
    pageTitle: document.getElementById('page-title'),
    currentDate: document.getElementById('current-date'),
    
    // Dashboard
    todayMilk: document.getElementById('today-milk'),
    todayIncome: document.getElementById('today-income'),
    monthMilk: document.getElementById('month-milk'),
    monthIncome: document.getElementById('month-income'),
    recentDeliveriesBody: document.getElementById('recent-deliveries-body'),
    
    // Calendar
    currentMonthYear: document.getElementById('current-month-year'),
    calendarDays: document.getElementById('calendar-days'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    todayCalendarBtn: document.getElementById('today-calendar'),
    
    // Customers
    customersGrid: document.getElementById('customers-grid'),
    addCustomerBtn: document.getElementById('add-customer-btn'),
    addFirstCustomerBtn: document.getElementById('add-first-customer'),
    
    // Reports
    reportMonth: document.getElementById('report-month'),
    reportYear: document.getElementById('report-year'),
    reportTotalMilk: document.getElementById('report-total-milk'),
    reportTotalIncome: document.getElementById('report-total-income'),
    reportDays: document.getElementById('report-days'),
    reportAverage: document.getElementById('report-average'),
    reportTableBody: document.getElementById('report-table-body'),
    
    // Settings
    defaultMilkPrice: document.getElementById('default-milk-price'),
    storageStatus: document.getElementById('storage-status'),
    totalCustomers: document.getElementById('total-customers'),
    totalEntries: document.getElementById('total-entries'),
    lastBackup: document.getElementById('last-backup'),
    
    // Modals
    deliveryModal: document.getElementById('delivery-modal'),
    customerModal: document.getElementById('customer-modal'),
    confirmationModal: document.getElementById('confirmation-modal'),
    modalTitle: document.getElementById('modal-title'),
    customerModalTitle: document.getElementById('customer-modal-title'),
    deliveryDate: document.getElementById('delivery-date'),
    deliveryNotes: document.getElementById('delivery-notes'),
    deliveryCustomersContainer: document.getElementById('delivery-customers-container'),
    formTotalMilk: document.getElementById('form-total-milk'),
    formTotalIncome: document.getElementById('form-total-income'),
    deliveryForm: document.getElementById('delivery-form'),
    
    // Customer Form
    customerForm: document.getElementById('customer-form'),
    customerId: document.getElementById('customer-id'),
    customerName: document.getElementById('customer-name'),
    customerAddress: document.getElementById('customer-address'),
    customerPhone: document.getElementById('customer-phone'),
    customerMilkPrice: document.getElementById('customer-milk-price'),
    customerDeliveryTime: document.getElementById('customer-delivery-time'),
    customerDefaultLiters: document.getElementById('customer-default-liters'),
    customerStatus: document.getElementById('customer-status'),
    customerSaveBtn: document.getElementById('customer-save-btn'),
    customerDeleteBtn: document.getElementById('customer-delete-btn'),
    
    // Confirmation
    confirmMessage: document.getElementById('confirm-message'),
    confirmActionBtn: document.getElementById('confirm-action'),
    
    // Buttons
    addDeliveryBtn: document.getElementById('add-delivery-btn'),
    quickAddDelivery: document.getElementById('quick-add-delivery'),
    viewTodayBtn: document.getElementById('view-today'),
    viewMonthBtn: document.getElementById('view-month'),
    saveSettingsBtn: document.getElementById('save-settings'),
    exportDataBtn: document.getElementById('export-data'),
    importDataBtn: document.getElementById('import-data'),
    clearDataBtn: document.getElementById('clear-data'),
    importFile: document.getElementById('import-file'),
    generateReportBtn: document.getElementById('generate-report'),
    printReportBtn: document.getElementById('print-report'),
    
    // Notification
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notification-text')
};

// Initialize the application
function init() {
    loadData();
    loadCustomers();
    loadSettings();
    setupEventListeners();
    updateCurrentDate();
    updateDashboard();
    renderCalendar();
    renderCustomers();
    setupReports();
    showPage('dashboard');
}

// Load delivery data from localStorage
function loadData() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (data) {
        try {
            deliveryData = JSON.parse(data);
        } catch (e) {
            console.error('Error parsing delivery data:', e);
            deliveryData = {};
        }
    } else {
        deliveryData = {};
    }
}

// Load customers from localStorage
function loadCustomers() {
    const savedCustomers = localStorage.getItem(CONFIG.CUSTOMERS_KEY);
    if (savedCustomers) {
        try {
            customers = JSON.parse(savedCustomers);
        } catch (e) {
            console.error('Error parsing customers:', e);
            customers = [];
        }
    } else {
        customers = [];
    }
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem(CONFIG.SETTINGS_KEY);
    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
            dom.defaultMilkPrice.value = settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
        } catch (e) {
            console.error('Error parsing settings:', e);
            settings = {};
        }
    } else {
        settings = {
            defaultMilkPrice: CONFIG.DEFAULT_MILK_PRICE
        };
    }
}

// Save delivery data to localStorage
function saveData() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(deliveryData));
    updateStorageInfo();
}

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem(CONFIG.CUSTOMERS_KEY, JSON.stringify(customers));
    updateStorageInfo();
}

// Save settings to localStorage
function saveSettings() {
    settings.defaultMilkPrice = parseFloat(dom.defaultMilkPrice.value) || CONFIG.DEFAULT_MILK_PRICE;
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
    showNotification('Settings saved successfully!');
}

// Update storage information
function updateStorageInfo() {
    const totalEntries = Object.keys(deliveryData).length;
    const totalDataSize = JSON.stringify(deliveryData).length;
    const totalCustomersSize = JSON.stringify(customers).length;
    const totalSize = totalDataSize + totalCustomersSize;
    
    dom.totalEntries.textContent = totalEntries;
    dom.totalCustomers.textContent = customers.length;
    dom.storageStatus.textContent = totalSize > 1024 ? 
        `${(totalSize / 1024).toFixed(2)} KB` : 
        `${totalSize} bytes`;
    
    const lastBackup = localStorage.getItem('last_backup');
    if (lastBackup) {
        const date = new Date(lastBackup);
        dom.lastBackup.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } else {
        dom.lastBackup.textContent = 'Never';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.href.includes('bill.html')) return;
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
            
            // Update active state
            dom.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Menu toggle for mobile
    dom.menuToggle.addEventListener('click', () => {
        dom.sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!dom.sidebar.contains(e.target) && !dom.menuToggle.contains(e.target)) {
                dom.sidebar.classList.remove('active');
            }
        }
    });
    
    // Add delivery buttons
    dom.addDeliveryBtn.addEventListener('click', openAddDeliveryModal);
    dom.quickAddDelivery.addEventListener('click', openAddDeliveryModal);
    
    // Add customer buttons
    dom.addCustomerBtn.addEventListener('click', openAddCustomerModal);
    dom.addFirstCustomerBtn.addEventListener('click', openAddCustomerModal);
    
    // Calendar navigation
    dom.prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    dom.nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    dom.todayCalendarBtn.addEventListener('click', () => {
        currentDate = new Date();
        currentYear = currentDate.getFullYear();
        currentMonth = currentDate.getMonth();
        renderCalendar();
    });
    
    // Delivery form
    dom.deliveryForm.addEventListener('submit', saveDelivery);
    
    // Customer form
    dom.customerForm.addEventListener('submit', saveCustomer);
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeDeliveryModal);
    });
    
    document.querySelectorAll('.close-customer-modal').forEach(btn => {
        btn.addEventListener('click', closeCustomerModal);
    });
    
    document.querySelectorAll('.close-confirm').forEach(btn => {
        btn.addEventListener('click', closeConfirmationModal);
    });
    
    // Close modals when clicking outside
    dom.deliveryModal.addEventListener('click', (e) => {
        if (e.target === dom.deliveryModal) {
            closeDeliveryModal();
        }
    });
    
    dom.customerModal.addEventListener('click', (e) => {
        if (e.target === dom.customerModal) {
            closeCustomerModal();
        }
    });
    
    dom.confirmationModal.addEventListener('click', (e) => {
        if (e.target === dom.confirmationModal) {
            closeConfirmationModal();
        }
    });
    
    // Delete customer button
    dom.customerDeleteBtn.addEventListener('click', confirmDeleteCustomer);
    
    // Settings
    dom.saveSettingsBtn.addEventListener('click', saveSettings);
    dom.exportDataBtn.addEventListener('click', exportData);
    dom.importDataBtn.addEventListener('click', () => dom.importFile.click());
    dom.clearDataBtn.addEventListener('click', confirmClearData);
    dom.importFile.addEventListener('change', importData);
    
    // Reports
    dom.generateReportBtn.addEventListener('click', generateReport);
    dom.printReportBtn.addEventListener('click', printReport);
    
    // Dashboard buttons
    dom.viewTodayBtn.addEventListener('click', () => {
        showPage('calendar');
        currentDate = new Date();
        currentYear = currentDate.getFullYear();
        currentMonth = currentDate.getMonth();
        renderCalendar();
    });
    
    dom.viewMonthBtn.addEventListener('click', () => {
        showPage('reports');
        generateReport();
    });
}

// Show a specific page
function showPage(pageName) {
    // Hide all pages
    dom.pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
        dom.pageTitle.textContent = getPageTitle(pageName);
        
        // Update page-specific content
        switch(pageName) {
            case 'dashboard':
                updateDashboard();
                updateRecentDeliveries();
                break;
            case 'calendar':
                renderCalendar();
                break;
            case 'customers':
                renderCustomers();
                break;
            case 'reports':
                generateReport();
                break;
            case 'settings':
                updateStorageInfo();
                break;
        }
    }
}

// Get page title
function getPageTitle(pageName) {
    const titles = {
        dashboard: 'Dashboard',
        calendar: 'Delivery Calendar',
        customers: 'Customers',
        reports: 'Reports',
        settings: 'Settings'
    };
    return titles[pageName] || 'Dashboard';
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dom.currentDate.textContent = now.toLocaleDateString('en-IN', options);
}

// Generate customer ID
function generateCustomerId() {
    return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get active customers
function getActiveCustomers() {
    return customers.filter(customer => customer.status !== 'Inactive');
}

// Get customer by ID
function getCustomerById(id) {
    return customers.find(c => c.id === id);
}

// Update dashboard statistics
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayData = deliveryData[today] || {};
    
    // Calculate today's totals
    let todayTotalMilk = 0;
    let todayTotalIncome = 0;
    
    Object.entries(todayData).forEach(([customerId, liters]) => {
        if (customerId !== 'notes') {
            const customer = getCustomerById(customerId);
            if (customer && customer.status !== 'Inactive') {
                const milk = parseFloat(liters) || 0;
                const price = parseFloat(customer.milkPrice) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
                todayTotalMilk += milk;
                todayTotalIncome += milk * price;
            }
        }
    });
    
    dom.todayMilk.textContent = `${todayTotalMilk.toFixed(1)} L`;
    dom.todayIncome.textContent = `₹${todayTotalIncome.toFixed(0)}`;
    
    // Calculate monthly totals
    const currentYearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    let monthTotalMilk = 0;
    let monthTotalIncome = 0;
    
    Object.entries(deliveryData).forEach(([date, data]) => {
        if (date.startsWith(currentYearMonth)) {
            Object.entries(data).forEach(([customerId, liters]) => {
                if (customerId !== 'notes') {
                    const customer = getCustomerById(customerId);
                    if (customer && customer.status !== 'Inactive') {
                        const milk = parseFloat(liters) || 0;
                        const price = parseFloat(customer.milkPrice) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
                        monthTotalMilk += milk;
                        monthTotalIncome += milk * price;
                    }
                }
            });
        }
    });
    
    dom.monthMilk.textContent = `${monthTotalMilk.toFixed(1)} L`;
    dom.monthIncome.textContent = `₹${monthTotalIncome.toFixed(0)}`;
}

// Update recent deliveries table
function updateRecentDeliveries() {
    const tbody = dom.recentDeliveriesBody;
    tbody.innerHTML = '';
    
    // Get sorted dates (most recent first)
    const sortedDates = Object.keys(deliveryData).sort((a, b) => b.localeCompare(a)).slice(0, 10);
    
    if (sortedDates.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #64748b;">
                    <i class="fas fa-inbox" style="font-size: 40px; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
                    <p>No deliveries recorded yet</p>
                    <button class="btn-primary" style="margin-top: 15px; padding: 8px 16px;" onclick="openAddDeliveryModal()">
                        Add Your First Delivery
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    sortedDates.forEach(date => {
        const data = deliveryData[date];
        
        // Calculate totals for this day
        let dayTotalMilk = 0;
        let dayTotalIncome = 0;
        let customerCount = 0;
        
        Object.entries(data).forEach(([customerId, liters]) => {
            if (customerId !== 'notes') {
                const customer = getCustomerById(customerId);
                if (customer && customer.status !== 'Inactive') {
                    const milk = parseFloat(liters) || 0;
                    const price = parseFloat(customer.milkPrice) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
                    dayTotalMilk += milk;
                    dayTotalIncome += milk * price;
                    customerCount++;
                }
            }
        });
        
        // Format date
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><strong>${dayTotalMilk.toFixed(1)} L</strong></td>
            <td><strong>₹${dayTotalIncome.toFixed(0)}</strong></td>
            <td>${customerCount} customers</td>
        `;
        
        // Add click event to edit
        row.addEventListener('click', () => {
            editingDate = date;
            openEditDeliveryModal(date);
        });
        row.style.cursor = 'pointer';
        
        tbody.appendChild(row);
    });
}

// Render customers list
function renderCustomers() {
    const grid = dom.customersGrid;
    const activeCustomers = getActiveCustomers();
    
    if (activeCustomers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" id="empty-customers-state" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fas fa-users" style="font-size: 60px; color: #cbd5e1; margin-bottom: 20px;"></i>
                <h3>No Customers Added</h3>
                <p>Add your first customer to start tracking deliveries</p>
                <button class="btn-primary" id="add-first-customer">
                    <i class="fas fa-plus"></i> Add Customer
                </button>
            </div>
        `;
        
        // Re-attach event listener
        document.getElementById('add-first-customer').addEventListener('click', openAddCustomerModal);
        return;
    }
    
    grid.innerHTML = '';
    
    activeCustomers.forEach(customer => {
        // Calculate this month's total for this customer
        const currentYearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        let monthlyMilk = 0;
        
        Object.entries(deliveryData).forEach(([date, data]) => {
            if (date.startsWith(currentYearMonth) && data[customer.id]) {
                monthlyMilk += parseFloat(data[customer.id]) || 0;
            }
        });
        
        const monthlyIncome = monthlyMilk * (parseFloat(customer.milkPrice) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE);
        
        const customerCard = document.createElement('div');
        customerCard.className = 'customer-card';
        customerCard.innerHTML = `
            <div class="customer-header">
                <div class="customer-icon" style="background: linear-gradient(135deg, #8a2387 0%, #f27121 100%);">
                    <i class="fas fa-user"></i>
                </div>
                <div style="flex: 1;">
                    <h3>${customer.name}</h3>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">
                        ${customer.phone || 'No phone'}
                    </p>
                </div>
                <span class="delivery-time">
                    <i class="fas ${customer.deliveryTime === 'Morning' ? 'fa-sun' : customer.deliveryTime === 'Evening' ? 'fa-moon' : 'fa-clock'}"></i>
                    ${customer.deliveryTime}
                </span>
            </div>
            <div class="customer-details">
                <div class="detail">
                    <span class="label">Rate:</span>
                    <span class="value">₹${customer.milkPrice}/L</span>
                </div>
                <div class="detail">
                    <span class="label">Default:</span>
                    <span class="value">${customer.defaultLiters} L</span>
                </div>
                <div class="detail">
                    <span class="label">This Month:</span>
                    <span class="value">${monthlyMilk.toFixed(1)} L</span>
                </div>
                <div class="detail">
                    <span class="label">Monthly Due:</span>
                    <span class="value">₹${monthlyIncome.toFixed(0)}</span>
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn-small" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-small" onclick="generateBillForCustomer('${customer.id}')">
                    <i class="fas fa-file-invoice"></i> Bill
                </button>
            </div>
        `;
        
        grid.appendChild(customerCard);
    });
}

// Render calendar
function renderCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    dom.currentMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    // Clear calendar
    dom.calendarDays.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        dom.calendarDays.appendChild(emptyDay);
    }
    
    // Create cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Check if this is today
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Format date string
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Create day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // Add delivery information if available
        if (deliveryData[dateString]) {
            const data = deliveryData[dateString];
            let dayTotalMilk = 0;
            
            // Calculate total for the day
            Object.entries(data).forEach(([customerId, liters]) => {
                if (customerId !== 'notes') {
                    const customer = getCustomerById(customerId);
                    if (customer && customer.status !== 'Inactive') {
                        dayTotalMilk += parseFloat(liters) || 0;
                    }
                }
            });
            
            // Add total for the day
            if (dayTotalMilk > 0) {
                const totalEl = document.createElement('div');
                totalEl.className = 'day-total';
                totalEl.textContent = `${dayTotalMilk}L`;
                dayElement.appendChild(totalEl);
            }
        }
        
        // Add click event
        dayElement.addEventListener('click', () => {
            selectedDate = dateString;
            if (deliveryData[dateString]) {
                openEditDeliveryModal(dateString);
            } else {
                openAddDeliveryModal(dateString);
            }
        });
        
        dom.calendarDays.appendChild(dayElement);
    }
}

// Set up reports dropdowns
function setupReports() {
    // Populate year dropdown (current year and previous 5 years)
    const currentYear = new Date().getFullYear();
    dom.reportYear.innerHTML = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        dom.reportYear.appendChild(option);
    }
    
    // Populate month dropdown
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    dom.reportMonth.innerHTML = '';
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        if (index === new Date().getMonth()) option.selected = true;
        dom.reportMonth.appendChild(option);
    });
}

// Generate report
function generateReport() {
    const selectedYear = parseInt(dom.reportYear.value);
    const selectedMonth = parseInt(dom.reportMonth.value);
    const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    let totalMilk = 0;
    let totalIncome = 0;
    let deliveryDays = 0;
    const activeCustomers = getActiveCustomers();
    
    // Filter data for selected month
    const monthData = {};
    Object.entries(deliveryData).forEach(([date, data]) => {
        if (date.startsWith(yearMonth)) {
            monthData[date] = data;
            
            let dayTotalMilk = 0;
            let dayTotalIncome = 0;
            
            Object.entries(data).forEach(([customerId, liters]) => {
                if (customerId !== 'notes') {
                    const customer = getCustomerById(customerId);
                    if (customer && customer.status !== 'Inactive') {
                        const milk = parseFloat(liters) || 0;
                        const price = parseFloat(customer.milkPrice) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
                        dayTotalMilk += milk;
                        dayTotalIncome += milk * price;
                    }
                }
            });
            
            if (dayTotalMilk > 0) {
                totalMilk += dayTotalMilk;
                totalIncome += dayTotalIncome;
                deliveryDays++;
            }
        }
    });
    
    // Update summary
    dom.reportTotalMilk.textContent = `${totalMilk.toFixed(1)} L`;
    dom.reportTotalIncome.textContent = `₹${totalIncome.toFixed(0)}`;
    dom.reportDays.textContent = deliveryDays;
    dom.reportAverage.textContent = deliveryDays > 0 ? `${(totalMilk / deliveryDays).toFixed(1)} L` : '0 L';
    
    // Update table
    const tbody = dom.reportTableBody;
    const thead = document.querySelector('.report-table thead tr');
    
    // Update table header with customer names
    thead.innerHTML = '<th>Date</th>';
    activeCustomers.forEach(customer => {
        thead.innerHTML += `<th>${customer.name}</th>`;
    });
    thead.innerHTML += '<th>Total Milk</th><th>Income</th>';
    
    tbody.innerHTML = '';
    
    // Sort dates
    const sortedDates = Object.keys(monthData).sort();
    
    if (sortedDates.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${activeCustomers.length + 3}" style="text-align: center; padding: 40px; color: #64748b;">
                    No deliveries for ${dom.reportMonth.options[dom.reportMonth.selectedIndex].text} ${selectedYear}
                </td>
            </tr>
        `;
        return;
    }
    
    sortedDates.forEach(date => {
        const data = monthData[date];
        const row = document.createElement('tr');
        
        // Format date
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });
        
        let rowHTML = `<td>${formattedDate}</td>`;
        
        let dayTotalMilk = 0;
        let dayTotalIncome = 0;
        
        // Add customer data
        activeCustomers.forEach(customer => {
            const liters = parseFloat(data[customer.id]) || 0;
            const price = parseFloat(customer.milkPrice) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
            rowHTML += `<td>${liters > 0 ? `${liters} L` : '-'}</td>`;
            
            dayTotalMilk += liters;
            dayTotalIncome += liters * price;
        });
        
        rowHTML += `<td><strong>${dayTotalMilk.toFixed(1)} L</strong></td>`;
        rowHTML += `<td><strong>₹${dayTotalIncome.toFixed(0)}</strong></td>`;
        
        row.innerHTML = rowHTML;
        tbody.appendChild(row);
    });
}

// Print report
function printReport() {
    const printWindow = window.open('', '_blank');
    const selectedMonth = dom.reportMonth.options[dom.reportMonth.selectedIndex].text;
    const selectedYear = dom.reportYear.value;
    
    const printContent = `
        <html>
        <head>
            <title>Milk Delivery Report - ${selectedMonth} ${selectedYear}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; text-align: center; }
                .summary { display: flex; justify-content: space-between; margin: 30px 0; }
                .summary-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; flex: 1; margin: 0 10px; }
                .summary-value { font-size: 24px; font-weight: bold; color: #4361ee; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #4361ee; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                tr:hover { background: #f5f5f5; }
                .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <h1>Milk Delivery Report</h1>
            <p style="text-align: center;">${selectedMonth} ${selectedYear}</p>
            
            <div class="summary">
                <div class="summary-box">
                    <div>Total Milk</div>
                    <div class="summary-value">${dom.reportTotalMilk.textContent}</div>
                </div>
                <div class="summary-box">
                    <div>Total Income</div>
                    <div class="summary-value">${dom.reportTotalIncome.textContent}</div>
                </div>
                <div class="summary-box">
                    <div>Delivery Days</div>
                    <div class="summary-value">${dom.reportDays.textContent}</div>
                </div>
            </div>
            
            <table>
                ${document.querySelector('.report-table').outerHTML}
            </table>
            
            <div class="footer">
                <p>Generated on ${new Date().toLocaleDateString()} by Ram's Milk Delivery Tracker</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Open add delivery modal
function openAddDeliveryModal(date = null) {
    if (customers.length === 0) {
        showNotification('Please add customers first!', 'warning');
        showPage('customers');
        return;
    }
    
    editingDate = null;
    dom.modalTitle.textContent = 'Add Delivery';
    
    // Set default date to today or provided date
    const today = new Date().toISOString().split('T')[0];
    dom.deliveryDate.value = date || today;
    dom.deliveryNotes.value = '';
    
    // Render customer inputs
    renderDeliveryCustomerInputs();
    calculateFormTotals();
    
    // Add input event listeners for calculation
    const inputs = dom.deliveryCustomersContainer.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calculateFormTotals);
    });
    
    dom.deliveryModal.style.display = 'flex';
}

// Render customer inputs for delivery modal
function renderDeliveryCustomerInputs() {
    const container = dom.deliveryCustomersContainer;
    const activeCustomers = getActiveCustomers();
    
    container.innerHTML = '';
    
    if (activeCustomers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #64748b;">
                <i class="fas fa-users" style="font-size: 40px; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
                <p>No active customers found. Please add customers first.</p>
                <button class="btn-primary" style="margin-top: 15px;" onclick="closeDeliveryModal(); showPage('customers');">
                    <i class="fas fa-plus"></i> Add Customers
                </button>
            </div>
        `;
        return;
    }
    
    activeCustomers.forEach(customer => {
        const customerInput = document.createElement('div');
        customerInput.className = 'form-group';
        customerInput.innerHTML = `
            <label for="customer-${customer.id}">
                ${customer.name} 
                <span style="color: #64748b; font-size: 14px;">
                    (₹${customer.milkPrice}/L, ${customer.deliveryTime})
                </span>
            </label>
            <div class="input-with-unit">
                <input type="number" 
                       step="0.1" 
                       min="0" 
                       id="customer-${customer.id}" 
                       class="customer-delivery-input"
                       data-customer-id="${customer.id}"
                       data-price="${customer.milkPrice}"
                       value="${customer.defaultLiters || 0}"
                       placeholder="Enter liters">
                <span class="unit">L</span>
            </div>
        `;
        container.appendChild(customerInput);
    });
}

// Open edit delivery modal
function openEditDeliveryModal(date) {
    if (customers.length === 0) {
        showNotification('Please add customers first!', 'warning');
        showPage('customers');
        return;
    }
    
    editingDate = date;
    dom.modalTitle.textContent = 'Edit Delivery';
    
    // Set date
    dom.deliveryDate.value = date;
    
    // Render customer inputs with existing data
    renderDeliveryCustomerInputs();
    
    // Load existing data
    const data = deliveryData[date] || {};
    dom.deliveryNotes.value = data.notes || '';
    
    // Set customer values
    Object.entries(data).forEach(([customerId, liters]) => {
        if (customerId !== 'notes') {
            const input = document.getElementById(`customer-${customerId}`);
            if (input) {
                input.value = liters;
            }
        }
    });
    
    calculateFormTotals();
    
    // Add input event listeners for calculation
    const inputs = dom.deliveryCustomersContainer.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calculateFormTotals);
    });
    
    dom.deliveryModal.style.display = 'flex';
}

// Calculate form totals for delivery
function calculateFormTotals() {
    let totalMilk = 0;
    let totalIncome = 0;
    
    const inputs = dom.deliveryCustomersContainer.querySelectorAll('.customer-delivery-input');
    inputs.forEach(input => {
        const liters = parseFloat(input.value) || 0;
        const price = parseFloat(input.getAttribute('data-price')) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
        
        totalMilk += liters;
        totalIncome += liters * price;
    });
    
    dom.formTotalMilk.textContent = `${totalMilk.toFixed(1)} L`;
    dom.formTotalIncome.textContent = `₹${totalIncome.toFixed(0)}`;
}

// Save delivery
function saveDelivery(e) {
    e.preventDefault();
    
    const date = dom.deliveryDate.value;
    const notes = dom.deliveryNotes.value.trim();
    
    // Collect customer data
    const deliveryDataForDate = {
        notes: notes
    };
    
    const inputs = dom.deliveryCustomersContainer.querySelectorAll('.customer-delivery-input');
    inputs.forEach(input => {
        const customerId = input.getAttribute('data-customer-id');
        const liters = parseFloat(input.value) || 0;
        
        if (liters > 0) {
            deliveryDataForDate[customerId] = liters;
        }
    });
    
    // Save data
    deliveryData[date] = deliveryDataForDate;
    
    saveData();
    closeDeliveryModal();
    
    // Update UI
    updateDashboard();
    updateRecentDeliveries();
    renderCustomers();
    renderCalendar();
    
    showNotification(editingDate ? 'Delivery updated!' : 'Delivery saved!');
    editingDate = null;
}

// Close delivery modal
function closeDeliveryModal() {
    dom.deliveryModal.style.display = 'none';
    editingDate = null;
}

// Open add customer modal
function openAddCustomerModal() {
    editingCustomerId = null;
    dom.customerModalTitle.textContent = 'Add Customer';
    dom.customerDeleteBtn.style.display = 'none';
    
    // Reset form
    dom.customerForm.reset();
    dom.customerId.value = '';
    dom.customerMilkPrice.value = settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
    dom.customerStatus.value = 'Active';
    
    dom.customerModal.style.display = 'flex';
}

// Open edit customer modal
function editCustomer(customerId) {
    const customer = getCustomerById(customerId);
    if (!customer) return;
    
    editingCustomerId = customerId;
    dom.customerModalTitle.textContent = 'Edit Customer';
    dom.customerDeleteBtn.style.display = 'block';
    
    // Fill form with customer data
    dom.customerId.value = customer.id;
    dom.customerName.value = customer.name;
    dom.customerAddress.value = customer.address || '';
    dom.customerPhone.value = customer.phone || '';
    dom.customerMilkPrice.value = customer.milkPrice;
    dom.customerDeliveryTime.value = customer.deliveryTime || 'Morning';
    dom.customerDefaultLiters.value = customer.defaultLiters || 1;
    dom.customerStatus.value = customer.status || 'Active';
    
    dom.customerModal.style.display = 'flex';
}

// Save customer
function saveCustomer(e) {
    e.preventDefault();
    
    const customerData = {
        id: dom.customerId.value || generateCustomerId(),
        name: dom.customerName.value.trim(),
        address: dom.customerAddress.value.trim(),
        phone: dom.customerPhone.value.trim(),
        milkPrice: parseFloat(dom.customerMilkPrice.value) || settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE,
        deliveryTime: dom.customerDeliveryTime.value,
        defaultLiters: parseFloat(dom.customerDefaultLiters.value) || 1,
        status: dom.customerStatus.value,
        createdAt: new Date().toISOString()
    };
    
    if (!customerData.name) {
        showNotification('Customer name is required!', 'error');
        return;
    }
    
    // Check if editing or adding new
    if (editingCustomerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.id === editingCustomerId);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...customerData };
        }
    } else {
        // Add new customer
        customers.push(customerData);
    }
    
    saveCustomers();
    closeCustomerModal();
    
    // Update UI
    renderCustomers();
    updateDashboard();
    updateRecentDeliveries();
    
    showNotification(editingCustomerId ? 'Customer updated!' : 'Customer added!');
    editingCustomerId = null;
}

// Confirm delete customer
function confirmDeleteCustomer() {
    showConfirmation(
        'Delete Customer',
        'Are you sure you want to delete this customer? All delivery data for this customer will also be removed.',
        deleteCustomer
    );
}

// Delete customer
function deleteCustomer() {
    if (!editingCustomerId) return;
    
    // Remove customer from customers array
    customers = customers.filter(c => c.id !== editingCustomerId);
    
    // Remove customer data from delivery records
    Object.keys(deliveryData).forEach(date => {
        if (deliveryData[date][editingCustomerId]) {
            delete deliveryData[date][editingCustomerId];
            
            // If no more data for this date, remove the entire date entry
            if (Object.keys(deliveryData[date]).length === 1 && deliveryData[date].notes === undefined) {
                delete deliveryData[date];
            }
        }
    });
    
    saveCustomers();
    saveData();
    closeCustomerModal();
    
    // Update UI
    renderCustomers();
    updateDashboard();
    updateRecentDeliveries();
    renderCalendar();
    
    showNotification('Customer deleted successfully!');
    editingCustomerId = null;
}

// Close customer modal
function closeCustomerModal() {
    dom.customerModal.style.display = 'none';
    editingCustomerId = null;
}

// Generate bill for specific customer (redirect to bill page)
function generateBillForCustomer(customerId) {
    localStorage.setItem('selected_customer_for_bill', customerId);
    window.location.href = 'bill.html';
}

// Export data
function exportData() {
    const exportObj = {
        deliveryData,
        customers,
        settings,
        exportDate: new Date().toISOString(),
        version: '2.0'
    };
    
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ram-milk-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Save backup date
    localStorage.setItem('last_backup', new Date().toISOString());
    updateStorageInfo();
    
    showNotification('Data exported successfully!');
}

// Import data
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (importedData.deliveryData && importedData.customers) {
                // Ask for confirmation
                showConfirmation(
                    'Import Data',
                    'This will replace ALL existing data (customers and deliveries). Are you sure?',
                    () => {
                        deliveryData = importedData.deliveryData || {};
                        customers = importedData.customers || [];
                        if (importedData.settings) {
                            settings = importedData.settings;
                            dom.defaultMilkPrice.value = settings.defaultMilkPrice || CONFIG.DEFAULT_MILK_PRICE;
                            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
                        }
                        saveData();
                        saveCustomers();
                        updateStorageInfo();
                        showNotification('Data imported successfully!');
                        
                        // Refresh UI
                        updateDashboard();
                        updateRecentDeliveries();
                        renderCustomers();
                        renderCalendar();
                    }
                );
            } else {
                showNotification('Invalid data file!', 'error');
            }
        } catch (error) {
            showNotification('Error importing data!', 'error');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
}

// Confirm clear data
function confirmClearData() {
    showConfirmation(
        'Clear All Data',
        'This will permanently delete ALL data (customers and deliveries). This action cannot be undone. Are you sure?',
        clearAllData
    );
}

// Clear all data
function clearAllData() {
    deliveryData = {};
    customers = [];
    
    saveData();
    saveCustomers();
    
    // Reset to default settings
    settings = {
        defaultMilkPrice: CONFIG.DEFAULT_MILK_PRICE
    };
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
    loadSettings();
    
    // Update UI
    updateDashboard();
    updateRecentDeliveries();
    renderCustomers();
    renderCalendar();
    updateStorageInfo();
    
    showNotification('All data cleared successfully!');
}

// Show confirmation modal
function showConfirmation(title, message, callback) {
    dom.confirmMessage.textContent = message;
    document.querySelector('#confirmation-modal .modal-header h3').textContent = title;
    
    dom.confirmActionBtn.onclick = () => {
        callback();
        closeConfirmationModal();
    };
    
    dom.confirmationModal.style.display = 'flex';
}

// Close confirmation modal
function closeConfirmationModal() {
    dom.confirmationModal.style.display = 'none';
}

// Show notification
function showNotification(message, type = 'success') {
    dom.notificationText.textContent = message;
    
    // Set color based on type
    if (type === 'error') {
        dom.notification.style.background = 'var(--danger-color)';
    } else if (type === 'warning') {
        dom.notification.style.background = 'var(--warning-color)';
    } else {
        dom.notification.style.background = 'var(--success-color)';
    }
    
    dom.notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        dom.notification.style.display = 'none';
    }, 3000);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make functions available globally for inline event handlers
window.openAddDeliveryModal = openAddDeliveryModal;
window.openAddCustomerModal = openAddCustomerModal;
window.editCustomer = editCustomer;
window.generateBillForCustomer = generateBillForCustomer;