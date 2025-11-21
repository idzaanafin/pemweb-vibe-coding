# ITSBooking

Ahmad Idza Anafin - 5027241017

## Deskripsi Singkat
ITSBooking adalah aplikasi manajemen ruangan dan reservasi yang terdiri dari backend (Node/Express + MongoDB) dan frontend (React + TypeScript + Tailwind). Aplikasi ini memungkinkan admin membuat/mengelola ruangan, dan pengguna membuat serta melihat reservasi dengan unggahan dokumen pendukung. Aplikasi ini dilengkapi dengan informasi event yang sedang berlangsung berdasarkan data reservasi.

Beberapa Organisasi mungkin membutuhkan sistem sederhana untuk mengelola daftar ruangan dan memproses permintaan reservasi. Administrator perlu kemampuan CRUD ruangan, sedangkan pengguna butuh antarmuka untuk membuat, mengubah, dan membatalkan reservasi serta melampirkan dokumen. Administrator perlu alur persetujuan/reject terhadap reservasi dengan alasan yang tercatat. dan juga pengguna bisa mempertimbangkan event yang sedang berlangsung melalui peta interaktif.

## Tech Stack & Fitur Utama
- Backend
	- Node.js, Express
	- MongoDB / Mongoose

- Frontend
	- React + TypeScript
	- Tailwind CSS	
	- Leaflet / react-leaflet for OSM map

Fitur utama:
- Autentikasi (register / login) dengan token yang disimpan di sessionStorage.
- Admin: CRUD ruangan (create, read, update, delete).
- User: Buat, edit, batalkan reservasi; upload dokumen pendukung.
- Admin: Lihat daftar reservasi, detail, preview dokumen, approve/reject dengan catatan.
- Peta interaktif menampilkan marker untuk event/ruangan (frontend `Home` page).


## Setup Instructions

Prerequisites:
- Node.js (v18+ recommended)
- npm
- MongoDB running (local or remote)

1) Backend

- Masuk ke folder backend dan install dependencies:

```bash
cd backend
npm install
```

- Siapkan file environment: buat `.env` di folder `backend` dengan minimal variable berikut:

```
MONGO_URI=mongodb://localhost:27017/your-db-name
JWT_SECRET=your_jwt_secret
PORT=8000
```

- Jalankan migration/seed (opsional, akan mereset DB dan membersihkan beberapa file upload, dan generate admin user):

```bash
npm run migrate
```

- Jalankan server:

```bash
npm run dev
# or
node src/index.js
```

Server akan tersedia di `http://localhost:8000` (default). API base URL pada frontend diatur ke `http://localhost:8000/api`.

2) Frontend

- Masuk ke folder frontend dan install dependencies:

```bash
cd frontend
npm install
```

- Jalankan development server:

```bash
npm run dev
```

- Buka browser di `http://localhost:5173` (atau URL yang ditampilkan oleh Vite).

## Example
### USER
- homepage
  <img width="1918" height="995" alt="image" src="https://github.com/user-attachments/assets/a8dd4d4e-e089-4767-bdbf-0192a4a64459" />

- rooms
  <img width="1914" height="949" alt="image" src="https://github.com/user-attachments/assets/67cbe0cc-5f1a-44ef-beb7-7094a4853d04" />

- reservation
  <img width="1072" height="654" alt="image" src="https://github.com/user-attachments/assets/c033388b-c320-4b0a-8dc7-4a126727a100" />

  <img width="1917" height="939" alt="image" src="https://github.com/user-attachments/assets/f2c4309c-2f54-4f34-9575-d83d939cb455" />

  <img width="1919" height="952" alt="image" src="https://github.com/user-attachments/assets/2737e614-3354-4af6-9e68-eb0bfd4f4406" />




### ADMIN
- rooms
  <img width="1915" height="993" alt="image" src="https://github.com/user-attachments/assets/c1ef7d8a-02f0-4a4c-8c79-ffefbcbd1848" />

  <img width="1919" height="884" alt="image" src="https://github.com/user-attachments/assets/6fddbe4f-cf79-4084-8623-00ff69683bc2" />


- reservation
  <img width="1919" height="937" alt="image" src="https://github.com/user-attachments/assets/5a34b565-e1bc-4f6f-ac0d-c5fcdd1274a9" />
