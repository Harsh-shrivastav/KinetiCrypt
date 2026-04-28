# KinetiCrypt: Digital Asset Provenance Engine


**KinetiCrypt** is a decentralized provenance registry designed to protect the intellectual property of digital creators. By combining cryptographic hashing with advanced multimodal AI (Gemini 2.5 Flash), KinetiCrypt allows creators to "mint" an immutable proof of existence and ownership for their digital assets.

---

## 🌍 The Problem & SDG Alignment

In the digital age, creative theft and the lack of verifiable ownership are major barriers for independent artists and designers. 

KinetiCrypt aligns with **UN Sustainable Development Goal 9: Industry, Innovation, and Infrastructure**. It provides a resilient, accessible infrastructure for the digital creative economy, fostering innovation by ensuring that intellectual property is protected through transparent technology.

---

## ✨ Key Features

- **🛡️ Cryptographic Fingerprinting:** Generates unique SHA-256 hashes for every uploaded asset, creating a "digital DNA" that cannot be altered.
- **👁️ AI Semantic Analysis:** Leverages **Google Gemini 2.5 Flash** to analyze the visual characteristics of the asset, providing a searchable and descriptive provenance record.
- **📜 Verifiable Certificates:** Automatically generates a premium "Certificate of Authenticity" with a unique Registry ID, timestamp, and QR code for instant verification.
- **📑 PDF Export:** High-fidelity export of provenance records for use in legal or intellectual property disputes.
- **🔍 Instant Verification:** A dedicated verification engine to check if an asset has already been registered on the KinetiCrypt ledger.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion (for premium UI/UX).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (MERN Stack).
- **AI Engine:** Google Gemini 2.5 Flash API.
- **Libraries:** jspdf, html-to-image (for PDF generation), qrcode.react.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harsh-shrivastav/KinetiCrypt.git
   cd KinetiCrypt
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   # Add your MONGO_URI and GEMINI_API_KEY
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000
   npm run dev
   ```

---

## 🧠 How it Works

1. **Upload:** User uploads an image asset and identifies themselves as the creator.
2. **Hashing:** The backend calculates a SHA-256 hash of the file buffer.
3. **AI Proofing:** Gemini 2.5 Flash analyzes the image to extract unique visual characteristics.
4. **Registration:** The hash, AI analysis, and metadata are saved to the MongoDB registry.
5. **Certification:** A permanent provenance record is generated, which can be shared via URL or exported as a PDF.

---

## 🛤️ Future Roadmap

- **Web3 Integration:** Storing hashes on a public blockchain (e.g., Polygon or Ethereum) for absolute decentralization.
- **Watermarking:** Automated invisible watermarking of assets upon registration.
- **Collaborative Minting:** Support for multi-creator assets and royalty agreements.

---

## 👨‍💻 Author

**Harsh Shrivastav**  
Built for the Google Solution Challenge 2026.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
