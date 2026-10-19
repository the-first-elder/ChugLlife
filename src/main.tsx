import "./polyfills";
import "./index.css";
import "@animxyz/core";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  LoaderFunctionArgs,
  RouterProvider,
} from "react-router-dom";
import { findConversation } from "./model/conversations";
import ConversationViewWithLoader from "./views/ConversationViewWithLoader.tsx";
import NewConversationView from "./views/NewConversationView.tsx";
import WalletContext from "./contexts/WalletContext.tsx";
import ClientProvider from "./contexts/ClientContext.tsx";
import Header from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import Landing from "./pages/Landing/Landing";
import Explore from "./pages/Explore/Explore";
import Match from "./pages/Match/Match.tsx";
import RoomsListView from "./pages/Rooms/RoomsListView.tsx";
import CreateRoomView from "./pages/Rooms/CreateRoomView.tsx";
import RoomSettingsView from "./pages/Rooms/RoomSettingsView.tsx";
import ShopView from "./pages/Shop/ShopView.tsx";
import MatchList from "./pages/Match/MatchList.tsx";
import { NextUIProvider } from "@nextui-org/system";
import HomeView from "./views/HomeView.tsx";
import LoginView from "./views/LoginView.tsx";
import Collections from "./pages/Collections/Collections.tsx";

async function conversationLoader({ params }: LoaderFunctionArgs) {
  const conversation = await findConversation(params.conversationTopic ?? "");
  return { conversation };
}

import BottomNav from "./components/BottomNav.tsx";
import NoMatch from "./views/NoMatch.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Landing />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/explore",
    element: (
      <>
        <Header />
        <Explore />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <LoginView />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/collections",
    element: (
      <>
        <Header />
        <Collections />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/match",
    element: (
      <>
        <Header />
        <Match />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/match/:id",
    element: (
      <>
        <Header />
        <MatchList />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/rooms",
    element: (
      <>
        <Header />
        <RoomsListView />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/rooms/new",
    element: (
      <>
        <Header />
        <CreateRoomView />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/room/:topic/settings",
    element: (
      <>
        <Header />
        <RoomSettingsView />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/shop",
    element: (
      <>
        <Header />
        <ShopView />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/conversations",
    element: (
      <>
        <Header />
        <HomeView />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "/c/:conversationTopic",
    element: (
      <>
        <Header />
        <ConversationViewWithLoader />
      </>
    ),
    loader: conversationLoader,
  },
  {
    path: "/new/:id",
    element: (
      <>
        <Header />
        <NewConversationView />
        <Footer />
        <BottomNav />
      </>
    ),
  },
  {
    path: "*",
    element: (
      <>
        <Header />
        <NoMatch />
        <Footer />
        <BottomNav />
      </>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WalletContext>
      <ClientProvider>
        <NextUIProvider>
          <RouterProvider router={router} />
        </NextUIProvider>
      </ClientProvider>
    </WalletContext>
  </React.StrictMode>
);
