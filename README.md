
# 🐸 Chuglife
### The Vibe-Dating & Social Network for Chog Genesis on Monad

**Chuglife** is a native mobile-styled web app connecting **Chog Genesis** NFT holders on the **Monad** blockchain. It combines **XMTP**-powered decentralized messaging with trait-based vibe matchmaking, 11-tier activity ranking prestige, public and private community chat rooms, room moderation (Chog Police & auto-mod word filters), and an on-platform MON virtual economy & shop.

Built with the cosmic neon aesthetic of [Chogathon](https://chogathon.chog.xyz) (`#0e0b1a`, `#141026`, `#836ef9`, `#5ce68a`, `#f59e0b`, `#f4f1fe`).

---

## 🌟 Key Features

### 1. 🐸 11-Tier Activity-Based Prestige Ladder
Your rank reflects how active you are in the community:
- **Chat activity** in chats and community rooms pushes you up the ladder.
- **Time spent present** in the app boosts your standing too.

| Level | Rank Name | Badge Theme | Hex Code | Prestige Aura |
|:---:|:---|:---|:---:|:---|
| **1** | 🥚 Hatchling | Soft Grey | `#9CA3AF` | Translucent seed badge |
| **2** | 🌱 Sprout | Lime Green | `#84CC16` | Fresh growth pill |
| **3** | 🐸 Tadpole | Green | `#22C55E` | Emerald badge |
| **4** | ⚡ Hopper | Teal | `#14B8A6` | Neon border + soft glow |
| **5** | 🔥 Trailblazer | Cyan | `#06B6D4` | Electric cyan border + glow |
| **6** | 💎 Pathfinder | Blue | `#3B82F6` | Sapphire halo + glow |
| **7** | 👑 Vanguard | Violet | `#8B5CF6` | Cosmic pulse aura |
| **8** | 🌌 Elite | Purple | `#A855F7` | Deep amethyst aura |
| **9** | ☄️ Ascendant | Magenta | `#D946EF` | Pulsing astral flare |
| **10** | 🐉 Mythic | Orange-Gold | `#F59E0B` | Shimmering solar crown |
| **11** | ♛ Legendary | Radiant Gold | `#FFD700` | Golden royalty with live sparkle animation |

An interactive **Rank Ladder Modal** allows users to inspect their current rank, progress bar to the next tier, messages sent, hours online, and total MON points accumulated.

---

### 2. 🏘️ Chat Rooms & Chog Police Moderation
- **Public & Private Rooms**: Multi-user group chat rooms backed by XMTP MLS groups.
- **Starter Community Rooms**:
  - 🐸 *The Frog Pond* (General hangout)
  - ⚡ *Monad Speed Lounge* (Fast-paced discussions)
  - 🔥 *Chog Dating & Traits* (Trait matchups & trades)
- **Room Ownership & Admin**: The room creator is automatically designated as **👑 Admin**.
- **Chog Police Moderator Role**: Admins can appoint any room participant to **👮‍♂️ Chog Police**, empowering them to enforce room rules.
- **Automated Word Filter**: Room Admins and Chog Police can define a custom list of prohibited words. Messages containing banned words are automatically intercepted before reaching the chat.
- **Member Management**: Kick and ban disruptive users, or pardon and unban previously restricted users.
- **Room Lifecycle**: Admins can permanently archive/delete rooms they manage.

---

### 3. 🛍️ Chuglife Shop & Room Capacity
To keep the network clean and prevent spam, each user is granted **1 free room creation slot**. Additional slots and custom flair can be purchased in the **Chuglife Shop**, paid straight from your connected wallet as a native MON transfer on Monad (set `VITE_SHOP_TREASURY` to receive payments):
- **5-Room Pack**: 0.05 MON (Unlock 5 additional room creation slots).
- **8-Room Pack**: 0.09 MON (Unlock 8 additional room creation slots).
- **Turbo Vibes**: 0.02 MON (2x rank progress for 1 hour).
- **Chog Police Badge**: 0.03 MON (Exclusive moderator visual badge).
- **Neon Name Glow**: 0.03 MON (Vibrant purple avatar ring in all chat rooms).
- **Cosmic Neon Theme**: 0.05 MON (Unlock custom room backgrounds).
- **Chog Reaction Pack**: 0.03 MON (Custom animated emoji reactions).
- **Founder Wordmark**: 0.15 MON (Permanent badge next to your handle).

---

### 4. ⚡ Monad & XMTP Seamless Wallet Sign-In
- **Multi-Chain Wallet Connection**: Built with RainbowKit and Wagmi with support for **Monad Testnet (10143)** (`https://testnet-rpc.monad.xyz`), **Monad Mainnet (143)**, Ethereum Mainnet, and Sepolia.
- **Non-blocking Signature Handshake**: Streamlined XMTP client onboarding with non-blocking floating status banners, automatic reconnection, and instant retry if a signature is declined.
- **Demo Mode**: Instant zero-wallet access to explore full messaging, vibe matchmaking, rooms, ranking, and the shop catalog with mock Chogs and XMTP messages (wallet checkout needs a real wallet).

---

### 5. 📱 100x Native Mobile UX
- **Bottom Navigation Dock**: Native mobile layout featuring one-tap access to **Chugmates**, **Rooms**, **Vibe Match**, **Shop**, and the **Rank Ladder**.
- **Chogathon Design Language**: Deep dark cosmic space palette (`#0e0b1a`), card surfaces (`#161228`), frosted glass headers, and vibrant Monad purple (`#836ef9`) accents.
- **Responsive Layout**: Designed to look and feel like a native iOS/Android mobile application on both smartphones and wide desktop viewports.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Joshaw-k/MatchCast.git
cd MatchCast

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Environment Configuration (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Available variables:
- `VITE_ETHERSCAN_API_KEY`: API key for Monaco / MonadScan holder queries.
- `VITE_XMTP_ENV`: XMTP network environment (`dev` or `production`).

### Build & Testing

```bash
# Type check TypeScript
npm run typecheck

# Production build
npm run build

# Run Playwright end-to-end tests
npx playwright test
```

---

## 📄 License
MIT License. Built for **Chogathon 2026** on **Monad**. Happy Chugging! 🐸⚡
