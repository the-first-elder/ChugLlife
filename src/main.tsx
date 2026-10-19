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
import AppShell, { ChatShell } from "./components/AppShell.tsx";
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
import NoMatch from "./views/NoMatch.tsx";

async function conversationLoader({ params }: LoaderFunctionArgs) {
  const conversation = await findConversation(params.conversationTopic ?? "");
  return { conversation };
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/explore", element: <Explore /> },
      { path: "/login", element: <LoginView /> },
      { path: "/collections", element: <Collections /> },
      { path: "/match", element: <Match /> },
      { path: "/match/:id", element: <MatchList /> },
      { path: "/rooms", element: <RoomsListView /> },
      { path: "/rooms/new", element: <CreateRoomView /> },
      { path: "/room/:topic/settings", element: <RoomSettingsView /> },
      { path: "/shop", element: <ShopView /> },
      { path: "/conversations", element: <HomeView /> },
      { path: "/new/:id", element: <NewConversationView /> },
      { path: "*", element: <NoMatch /> },
    ],
  },
  {
    element: <ChatShell />,
    children: [
      {
        path: "/c/:conversationTopic",
        element: <ConversationViewWithLoader />,
        loader: conversationLoader,
      },
    ],
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
