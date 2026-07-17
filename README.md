 # EasyInvoice 🧾✨

EasyInvoice is a modern, high-performance, and feature-rich invoice management and generation web application. Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**, it provides an intuitive interface for professionals to create, preview, manage, and download professional invoices in PDF format.

The project features a **dual-database design**: it runs immediately out-of-the-box in a fully-functional **Local Mock DB mode** using browser local storage, or can be easily connected to **Firebase** for cloud authentication and real-time Firestore database synchronization.

---

## 🌟 Key Features

- ⚡ **Instant PDF Generation:** Customize, preview, and generate clean PDF invoices using client-side rendering with `html2canvas` and `jspdf`.
- 📁 **3 Professional Templates:** Toggle instantly between **Modern**, **Classic**, and **Corporate** layout styles.
- 🔄 **Dual Operations Mode:**
  - **Local/Mock Mode (Default):** Runs completely offline using `sessionStorage` for mock authentication and `localStorage` to save invoice history, client directories, and company profiles. No setup required!
  - **Firebase Cloud Sync:** Log in with Google or Email/Password, and synchronize your data in real-time with **Firestore**.
- 📊 **Analytics Dashboard:** Monitor total revenue, pending balances, and overdue invoices with clean visual cards.
- 👥 **Customer Directory:** Save and search client details (address, phone, email) to quickly autofill new invoices.
- ⚙️ **Smart Numbering & Calculations:** Auto-increments invoice numbers (e.g. `INV-2026-0001`) and computes subtotals, tax rates, individual item discounts, and currency symbols (`$`, `€`, `₹`).
- 🌓 **Dark & Light Mode:** Toggle themes seamlessly with built-in Tailwind support.
- 🛡️ **Protected Routing:** Secure dashboards and editor panels, complete with a self-healing user profile generator on auth state changes.

---

## 🛠️ Tech Stack

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) (v8)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with native OKLCH support
- **Icons:** [Lucide React](https://lucide.dev/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/)
- **PDF Generation:** [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html) & [html2canvas](https://html2canvas.hertzen.com/)
- **Database & Auth:** [Firebase v12](https://firebase.google.com/) (Auth, Firestore, Storage)

---

## 📂 Project Directory Structure

```text
invoice-generator/
├── public/                 # Static assets
├── scripts/
│   └── patch-html2canvas.js # Custom OKLCH color crash patch for Tailwind CSS v4
├── src/
│   ├── assets/             # Images and global icons
│   ├── components/
│   │   ├── auth/           # Protected routes and authentication components
│   │   ├── generator/      # Invoice form, item table, preview panel & templates
│   │   │   └── templates/  # Classic, Corporate, and Modern PDF layouts
│   │   ├── history/        # Invoice listing and status manager
│   │   ├── layout/         # Application shell and navbar
│   │   └── ui/             # Reusable design system tokens (buttons, cards, modals, toast)
│   ├── config/
│   │   └── firebase.ts     # Firebase initialization and configuration checks
│   ├── context/            # Global state (Auth, Customer, Invoice, Theme, Toast)
│   ├── hooks/              # Custom React hooks (e.g. form state, history hooks)
│   ├── pages/              # Main routes (Home, Login, Signup, Dashboard, Generator)
│   ├── types/              # Strong TypeScript models & interfaces
│   ├── utils/              # Math calculations & formatter helpers
│   ├── App.tsx             # Main routing configuration
│   └── main.tsx            # App entry point
├── firestore.rules         # Security rules for Cloud Firestore
├── firebase.json           # Firebase CLI configurations
└── package.json            # Scripts and dependencies
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### 🔧 Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Vislavathsunil/EasyInvoice.git
   cd EasyInvoice
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   > [!NOTE]  
   > During `postinstall`, a custom script `scripts/patch-html2canvas.js` automatically runs. It patches the `html2canvas` library in `node_modules` to prevent crashes when rendering Tailwind CSS v4's native `oklch()` color values (redirecting them to a transparent fallback).

3. **Run the App Locally (Mock Mode):**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser. The application will start in **Local Mock DB mode** automatically. You can sign up, log in, manage invoices, and download PDFs offline.

---

## ☁️ Connecting Firebase (Optional)

To enable real-time cloud sync, persistent authentication sessions, and server-side data preservation:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password & Google Provider).
3. Enable **Firestore Database** in test or production mode.
4. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
5. Populate `.env.local` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
6. Restart the development server (`npm run dev`). EasyInvoice will automatically detect the variables and swap out the local mock databases for full Cloud synchronization.

---

## 🛡️ Firebase Security Rules

To enforce secure multi-tenant access control where users can only read/write their own invoices, configure the following rules in your Firestore panel or deploy them using Firebase CLI:

**`firestore.rules`:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/invoices/{invoiceId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/customers/{customerId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ⚙️ Build and Production Deployment

To bundle the application for production hosting (Vercel, Netlify, Firebase Hosting, GitHub Pages, etc.):

```bash
# Build the TypeScript compilation and bundle using Vite
npm run build

# Preview the built application locally
npm run preview
```

The production output will be generated inside the `dist/` directory.

---

## 🐛 Troubleshooting

### PDF Generation Color Crash (OKLCH issue)
Tailwind CSS v4 introduces native `oklch()` color values in CSS files. `html2canvas` does not natively support parsing OKLCH color strings, which causes a JavaScript error and prevents PDF generation.

* **Our Solution:** A custom postinstall patch (`scripts/patch-html2canvas.js`) runs automatically when you run `npm install`. It intercepts the color function parser in the `html2canvas` build in your `node_modules` and resolves unsupported colors gracefully to transparent values. If you experience PDF generation bugs, check that your `node_modules/html2canvas` has been successfully patched by running `npm install` again.

---

## 🤝 Contributing

Contributions are highly welcomed! Please feel free to open issues or submit pull requests.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## Author

**Vislavath Sunil**  
Full Stack & AI Engineer

- **GitHub**: [@Vislavathsunil](https://github.com/Vislavathsunil)
- **Portfolio**: [vislavathsunil](https://vislavathsunil.vercel.app/)
- **Email**: vsunilpower42@gmail.com

 Made with ❤️ by Vislavath Sunil
