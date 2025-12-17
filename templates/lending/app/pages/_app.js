"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const WalletContextProvider_1 = require("../contexts/WalletContextProvider");
require("../styles/globals.css");
function MyApp({ Component, pageProps }) {
    return ((0, jsx_runtime_1.jsx)(WalletContextProvider_1.WalletContextProvider, { children: (0, jsx_runtime_1.jsx)(Component, { ...pageProps }) }));
}
exports.default = MyApp;
//# sourceMappingURL=_app.js.map