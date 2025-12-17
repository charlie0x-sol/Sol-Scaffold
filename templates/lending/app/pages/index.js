"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const wallet_adapter_react_ui_1 = require("@solana/wallet-adapter-react-ui");
const next_1 = require("next");
const AppBar_1 = require("../components/AppBar");
const Home = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(AppBar_1.AppBar, {}), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center h-screen", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-4xl font-bold", children: "Solana Lending dApp" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsx)(wallet_adapter_react_ui_1.WalletMultiButton, {}) })] }) })] }));
};
exports.default = Home;
//# sourceMappingURL=index.js.map