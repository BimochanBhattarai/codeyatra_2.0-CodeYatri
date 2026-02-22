Uddhar (उद्धार) | Emergency Response System

Uddhar is a high-reliability emergency coordination platform designed for the Nepalese infrastructure. It bridges the critical gap between bystanders, police, ambulance services, and hospitals through real-time geolocation, SMS-integrated dispatch, and hospital resource readiness.

Workflow

    Bystander Report: A witness reports an incident via the portal. Identity is verified through OTP.

    Police Screening: Local police receive a notification and coordinates. They verify the incident to filter out false alarms/pranks.

    Ambulance Dispatch: Upon police verification, the nearest registered ambulances in the region are notified via SMS with a direct dashboard link.

    Hospital Handover: The driver selects a destination (default or queried by specialty). The hospital receives a live dashboard with ETA, casualty count, and incident photos to prepare ER resources.

System Components

1. Public Reporting Portal

    Geolocation: Browser API integration for precise incident pinning.

    Triage Input: Categorization (Accident, Fire, Medical, etc.) and casualty count.

    Verification: Live camera capture for visual evidence and Twilio/Firebase OTP for reporter accountability.

2. Police Command Center (The Gatekeeper)

    Decision Hub: View bystander photos and location.

    Verification Logic: Verify & Dispatch or Cancel/False Alarm.

    Communication: Call Reporter through mobile number.

3. Ambulance Driver Dashboard

    Acceptance Flow: Real-time incident claiming system.

    Navigation: Integrated Google Maps API from Scene → Hospital.

    Selection: Ability to select destination hospitals for specialized cases.

4. Hospital Readiness Dashboard

    Live Arrivals: A websocket-powered "Countdown" board showing incoming patients.

    Pre-Op Intelligence: Access to bystander photos to understand the mechanism of injury before the patient arrives.

Technical Architecture

Layer | Technology
Frontend | React.js / Next.js (Mobile-responsive)
Backend | Node.js (Express) or Python (FastAPI)
Database | PostgreSQL + PostGIS (Geospatial queries)
Real-time | Socket.io (Dashboard updates)
APIs | Twilio (SMS/OTP), Google Maps (Navigation/ETA)

Registration Requirements

For Ambulances:

    Driver Details: Name, Phone, License (Photo), and Bluebook (Photo).

    Affiliation: Operating Region and Default Hospital.

    Verification: All drivers are flagged is_verified: false until admin approval.

For Hospitals:

    ER Specs: Direct ER Hotline (bypassing reception).

    Capabilities: Checkboxes for ICU, Burn Unit, Blood Bank, etc.

    Geolocation: Precise map pinning for driver navigation.

Installation & Setup

    Clone the repo:
    Bash

    git clone https://github.com/BimochanBhattarai/codeyatra_2.0-CodeYatri.git

    Install Dependencies:
    Bash

    npm install

    Environment Variables:
    Create a .env file with:

        Maps_API_KEY

        TWILIO_AUTH_TOKEN

        DATABASE_URL

    Run Development Server:
    Bash

    npm run dev

💡 The Vision

In emergencies, time is the only valuable that matters. Uddhar safeguards the value of life by ensuring that the right resources are sent to the right place, and the hospital is ready for action.