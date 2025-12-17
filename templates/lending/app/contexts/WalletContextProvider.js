"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletContextProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const wallet_adapter_react_ui_1 = require("@solana/wallet-adapter-react-ui");
const wallet_adapter_wallets_1 = require("@solana/wallet-adapter-wallets");
const react_1 = require("react");
import('@solana/wallet-adapter-react-ui/styles.css');
const WalletContextProvider = ({ children }) => {
    const endpoint = (0, react_1.useMemo)(() => 'http://127.0.0.1:8899', []);
    const wallets = (0, react_1.useMemo)(() => [
        new wallet_adapter_wallets_1.PhantomWalletAdapter(),
    ], []);
    return ((0, jsx_runtime_1.jsx)(wallet_adapter_react_1.ConnectionProvider, { endpoint: endpoint, children: (0, jsx_runtime_1.jsx)(wallet_adapter_react_1.WalletProvider, { wallets: wallets, autoConnect: true, children: (0, jsx_runtime_1.jsx)(wallet_adapter_react_ui_1.WalletModalProvider, { children: children }) }) }));
};
exports.WalletContextProvider = WalletContextProvider;
//# sourceMappingURL=WalletContextProvider.js.map