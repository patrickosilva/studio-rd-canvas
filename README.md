# Studio RD Barber

Full Stack appointment management system developed for a real barbershop, designed to simplify scheduling, customer communication and appointment management.

The application handles the complete booking workflow, from the customer's initial appointment request to confirmation, rescheduling, cancellation and automated email notifications.

---

## ✨ Features

- Online appointment scheduling
- Appointment cancellation
- Appointment rescheduling
- Barber confirmation and rejection workflows
- Administrative appointment management
- Customer information management
- Automated email notifications
- Appointment reminder notifications
- PostgreSQL database integration
- Persistent booking data
- Business rules for appointment management

---

## 📧 Email Notification System

The application includes an automated email communication flow for both customers and the barbershop.

Notifications are triggered when:

- A new appointment is created
- An appointment is cancelled
- An appointment is rescheduled
- The barbershop confirms an appointment
- The barbershop rejects an appointment
- An appointment reminder is sent

Email delivery is handled through SMTP integration.

---

## 🔄 Appointment Flow

```text
Customer creates appointment
          ↓
Barbershop receives notification
          ↓
Appointment is reviewed
          ↓
     ┌─────────────┐
     │             │
 Confirmed      Rejected
     │             │
     ↓             ↓
Customer        Customer
notified        notified
