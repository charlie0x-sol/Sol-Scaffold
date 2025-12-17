"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const wallet_adapter_react_ui_1 = require("@solana/wallet-adapter-react-ui");
const react_1 = require("react");
const AppBar = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-4 bg-gray-800 text-white", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Solana Staking" }), (0, jsx_runtime_1.jsx)(wallet_adapter_react_ui_1.WalletMultiButton, {})] }));
};
exports.AppBar = AppBar;
//# sourceMappingURL=AppBar.js.map