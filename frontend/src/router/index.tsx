import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/Layouts/MainLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Rooms from "../pages/Rooms/Rooms";
import RoomDetail from "../pages/Rooms/RoomDetail";
import UserReservations from "../pages/Reservations/reservation";

// Admin Pages
import AdminLayout from "../pages/Admin/AdminLayout";
import RoomsAdmin from "../pages/Admin/RoomsAdmin";
import ReservationsAdmin from "../pages/Admin/ReservationAdmin";
import CreateRoomAdmin from "../pages/Admin/CreateRoomAdmin";
import ReserveRoom from "../pages/Rooms/ReserveRoom";


import GuestOnly from "../components/GuestOnly";
import UserOnly from "../components/UserOnly";
import AdminOnly from "../components/AdminOnly";
import AdminRedirect from "../components/AdminRedirect";

export const router = createBrowserRouter([
  // PUBLIC HOME
  {
    element: (
      <AdminRedirect>
        <MainLayout />
      </AdminRedirect>
    ),
    children: [
      { path: "/", element: <Home /> },

      // user-only pages
      {
        path: "/rooms",
        element: (
          <UserOnly>
            <Rooms />
          </UserOnly>
        ),
      },
      {
        path: "/reservations",
        element: (
          <UserOnly>
            <UserReservations />
          </UserOnly>
        ),
      },

      { path: "/rooms/:id",
        element: (
          <UserOnly>
            <RoomDetail />
          </UserOnly>
        ),
      },
      { path: "/rooms/:id/reserve",
        element: (
          <UserOnly>
            <ReserveRoom />
          </UserOnly>
        ),
      },
    ],
  },

  // AUTH (guest only)
  {
    path: "/login",
    element: (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestOnly>
        <Register />
      </GuestOnly>
    ),
  },

  // ADMIN ROUTES
  {
    path: "/admin",
    element: (
      <AdminOnly>
        <AdminLayout />
      </AdminOnly>
    ),
    children: [
      { path: "rooms", element: <RoomsAdmin /> },
      { path: "reservations", element: <ReservationsAdmin /> },
      { path: "rooms/create", element: <CreateRoomAdmin /> },
      { path: "rooms/:id/edit", element: <CreateRoomAdmin /> },
    ],
  },
]);