# Grain-Rate-Backend
GrainRateApp – Agriculture domain platform to manage users, products, and grain orders with role-based dashboards, order management, analytics, and communication.
# 🌾 GrainRateApp

GrainRateApp is a full-stack agriculture domain web application designed to simplify grain buying and selling.  
It provides **role-based dashboards** for Superadmin, Admin, Farmers, Retailers, Distributors, and Traders, with powerful tools to manage users, products, orders, analytics, and communication.

---

## 📌 Overview
The app bridges the gap between grain producers, distributors, retailers, and traders by enabling:
- Centralized user and product management
- Smooth order placement and approval process
- Analytics dashboard for better decision-making
- Communication between Admin and Users
- Secure authentication and profile management

---

## ✨ Features

### 🏗️ **Superadmin**
- Create and manage Admin accounts

### 👨‍💼 **Admin**
- **User Management:** Create Farmers, Retailers, Distributors, and Traders  
- **Product Management:** Add, edit, view, and manage grain products  
- **Dashboard:** View user counts, order counts, and analytics (charts/graphs)  
- **Order Management:** Accept, reject, or cancel orders with reason messages  
- **Communication:** Send messages to users  
- **User List:** View all registered users under admin  
- **Product Analysis:** Analyze grain demand and supply  
- **Profile & Security:** Edit profile, reset password, change password  

### 👩‍🌾 **Farmer & Retailer**
- Browse available grains  
- Add products to cart  
- Place orders  
- View order history in dashboard  

### 🏢 **Trader & Distributor**
- Same features as Admin **but limited** to managing:
  - Trader → can add Distributors and Retailers  
  - Distributor → can add Retailers only  

---

## 🛠️ Tech Stack
- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT (Role-based Access Control)  
- **Deployment:** Traditional (Server/VM based)

---


cd grainRateApp

