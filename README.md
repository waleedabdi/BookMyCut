#  BookMyCut

BookMyCut is a modern salon and barbershop booking application. It allows customers to easily book appointments online without the hassle of phone calls or WhatsApp.Owners can log in to view their daily schedules in one place.

##  Project Links
*   Live Deployment:[book-my-cut-blush.vercel.app]
*   Figma Wireframe:[https://www.figma.com/proto/wpcZNFSaYHUVYCVyJdJkxH/Untitled?node-id=0-1&t=NZBxnDq8YQr96Ne8-1]
*   GitHub Repository: [https://github.com/waleedabdi/BookMyCut.git]

## Screenshots

### 1. Login & Authentication
![Login page](./image-1.png)
### 2. Booking Page & Holiday API
![alt text](image-3.png)
(Users select a service, pick a date, and see available time slots. The app fetches Kenyan Public Holidays to prevent booking on closed days).

### 3. My Bookings & Owner Dashboard
![alt text](image-1.png)
(Customers can view and cancel their bookings)

##  Key Features

* Register, log in and log out with email and password
* Sign in with Google
* Protected routes: pages for logged-in users redirect to the login page when you are signed out
* Choose from six services, each with a price and duration
* Pick a date and check which time slots are still available
* Book an appointment (the server checks your Firebase login token before saving)
* Upcoming public holidays are shown, and booking on a holiday is blocked
* Responsive layout for phones, tablets and desktops

##  Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS, React Router
*   **Backend API:** Node.js, Express.js
*   **Database & Auth:** Firebase, Firestore
*   **External API:** Nager.Date (Public Holidays)

##  How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/waleedabdi/BookMyCut.git]
   cd BookMyCut
   
## Author
[Waleed Abdi]