# Studio RD Barber

Full Stack appointment management system developed for a real barbershop, designed to simplify scheduling, appointment management and communication between customers and the barbershop.

The application manages the complete booking lifecycle, from the customer's initial appointment request to confirmation, rejection, rescheduling, cancellation and automated email notifications.

---

## 🚀 Overview

Studio RD Barber was created to solve a real business need by centralizing appointment management and reducing manual communication between customers and barbers.

The system combines appointment scheduling, business rules, database persistence and automated communication in a single application.

The project demonstrates practical experience with Full Stack development, database management, integrations and the implementation of real-world business workflows.

---

## ✨ Features

- Online appointment scheduling
- Appointment cancellation
- Appointment rescheduling
- Appointment confirmation
- Appointment rejection
- Administrative appointment management
- Customer information management
- Persistent booking data
- Automated email notifications
- Appointment reminder notifications
- Business rules for appointment availability
- PostgreSQL database integration
- SMTP email integration
- Database migrations with Prisma
- Environment-based configuration

---

## 📅 Appointment Management

Customers can create appointments by selecting the desired service, date and available time.

The barbershop can then review appointment requests and confirm or reject them.

The system also supports appointment cancellation and rescheduling while keeping both the customer and the barbershop informed throughout the process.

---

## 📧 Email Notification System

The application includes an automated email notification system designed to improve communication between customers and the barbershop.

Notifications can be triggered when:

- A new appointment is created
- A customer cancels an appointment
- An appointment is rescheduled
- The barbershop confirms an appointment
- The barbershop rejects an appointment
- An appointment reminder is sent

Email delivery is handled through SMTP integration.

This reduces the need for manual communication and keeps both sides informed about appointment changes.

---

## 🔄 Appointment Flow

```text
Customer creates appointment
          ↓
Appointment stored in database
          ↓
Barbershop receives notification
          ↓
Barbershop reviews appointment
          ↓
     ┌───────────────┐
     │               │
 Confirmed        Rejected
     │               │
     ↓               ↓
 Customer         Customer
 notified         notified
     │
     ↓
Appointment scheduled
     │
     ↓
Reminder notification
```

Customers can also cancel or reschedule existing appointments.

```text
Existing appointment
        ↓
   Customer action
        ↓
 ┌───────────────┐
 │               │
Cancel        Reschedule
 │               │
 ↓               ↓
Database       Database
updated        updated
 │               │
 ↓               ↓
Notifications are automatically sent
```

---

## 🛠️ Tech Stack

### Backend & Data

- PostgreSQL
- Prisma ORM
- Database migrations
- SMTP integration

### Development & Tools

- Git
- GitHub
- Environment Variables
- Version Control
- Database Management
- API / Service Integration

---

## 🗄️ Database

The application uses **PostgreSQL** as its relational database.

The database stores information related to:

- Customers
- Appointments
- Services
- Appointment status
- Scheduling information
- Customer contact information

Database structure and migrations are managed through **Prisma ORM**, allowing the schema to evolve consistently throughout development.

---

## 📦 Prisma

Prisma is used to manage database access and migrations.

Typical development workflow:

```bash
npx prisma generate
```

Create and apply a development migration:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## 🔐 Environment Variables

Sensitive information such as database credentials and SMTP authentication must be stored using environment variables.

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=your_database_url

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password
```

> Never commit real passwords, API keys, application passwords or production credentials to the repository.

A `.env.example` file can be used to document the required variables without exposing sensitive information.

---

## 📬 SMTP Configuration

The notification system uses SMTP to send automated emails.

The SMTP configuration requires:

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password
```

For providers such as Gmail, an application-specific password should be used instead of the account's regular password.

---

## ⚙️ Local Development

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate to the project directory:

```bash
cd YOUR_PROJECT_FOLDER
```

Install the project dependencies using the package manager configured in the repository.

Configure the environment variables:

```bash
cp .env.example .env
```

Update the `.env` file with your local database and SMTP configuration.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Then start the application using the development command configured by the project.

---

## 🧠 Business Logic

The application implements business rules related to appointment management.

Examples include:

- Creating appointments
- Managing available schedules
- Preventing invalid appointment operations
- Updating appointment status
- Confirming appointments
- Rejecting appointments
- Cancelling appointments
- Rescheduling appointments
- Persisting appointment changes
- Triggering notifications after relevant actions

The goal is to keep the scheduling workflow consistent between the database, customer interface and barbershop management process.

---

## 🔔 Notification Workflow

### New appointment

```text
Customer books
      ↓
Appointment created
      ↓
Database updated
      ↓
Barbershop receives email
```

### Appointment confirmation

```text
Barbershop confirms
        ↓
Status updated
        ↓
Customer receives confirmation
```

### Appointment rejection

```text
Barbershop rejects
        ↓
Status updated
        ↓
Customer receives notification
```

### Cancellation

```text
Customer cancels
       ↓
Appointment updated
       ↓
Barbershop receives notification
```

### Rescheduling

```text
Customer reschedules
        ↓
Date/time updated
        ↓
Database updated
        ↓
Notifications sent
```

---

## 🔒 Security

The application follows basic security practices such as:

- Keeping credentials outside the source code
- Using environment variables for sensitive configuration
- Avoiding credentials in Git commits
- Separating application configuration from business logic
- Validating application data
- Managing database access through Prisma

Further security improvements can be continuously implemented as the project evolves.

---

## 🎯 Project Purpose

Studio RD Barber was developed for a real-world business scenario.

Its purpose is to centralize and automate the barbershop's appointment workflow while improving communication with customers.

Instead of depending entirely on manual conversations to organize bookings, the system provides a structured workflow for:

```text
Booking
   ↓
Management
   ↓
Confirmation
   ↓
Communication
   ↓
Appointment
```

This project demonstrates practical Full Stack development applied to a real business need.

---

## 💡 What This Project Demonstrates

- Full Stack application development
- Real-world business requirements
- Appointment management
- Business logic implementation
- PostgreSQL integration
- Prisma ORM
- Database migrations
- Automated email communication
- SMTP integration
- Environment configuration
- Git version control
- Problem solving
- Software development for real clients

---

## 🔮 Future Improvements

Possible future improvements include:

- Improved analytics dashboard
- Advanced scheduling management
- Additional customer notifications
- Improved authentication and authorization
- Automated deployment
- Additional security improvements
- Enhanced administrative tools
- Reporting and appointment statistics

---

## 👨‍💻 Developer

**Patrick Oliveira**

Full Stack Developer focused on **Software Development and Cybersecurity**.

Main areas of interest:

- Full Stack Development
- Backend Development
- Web Applications
- APIs
- PostgreSQL
- Application Security
- Web & API Security
- Cybersecurity

---

## 📫 Contact

- LinkedIn: `YOUR_LINKEDIN_URL`
- GitHub: `YOUR_GITHUB_URL`
- Patronix: `YOUR_PATRONIX_URL`

---

## 📄 Project Status

The project is actively maintained and can continue evolving according to the operational needs of the business.

---

Developed by **Patrick Oliveira**.
