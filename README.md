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

Customers can also cancel or reschedule appointments, generating the corresponding notifications automatically.

🛠️ Tech Stack
Backend & Data
PostgreSQL
Prisma ORM
SMTP integration
Development
Git
GitHub
Environment variables
Database migrations
🗄️ Database

The application uses PostgreSQL for persistent data storage.

Database structure and migrations are managed through Prisma, ensuring consistent schema evolution throughout development.

🔐 Environment Variables

The project uses environment variables for sensitive configuration such as database credentials and SMTP authentication.

Example:
DATABASE_URL=your_database_url

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password

Sensitive credentials must never be committed to the repository.

🚀 Project Purpose

Studio RD Barber was developed to solve a real business need: centralizing appointment management while reducing manual communication between customers and the barbershop.

The project demonstrates the implementation of business rules, database persistence, automated communication and Full Stack application development in a real-world scenario.

👨‍💻 Developer

Developed by Patrick Oliveira.

Full Stack Developer focused on software development and Cybersecurity.
