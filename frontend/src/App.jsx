import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./Redux/Auth/Action";
import AppShell from "./components/layout/AppShell";
import BrandMark from "./components/custome/BrandMark";
import Home from "./pages/Home/Home";
import Portfolio from "./pages/Portfilio/Portfolio";
import Auth from "./pages/Auth/Auth";
import StockDetails from "./pages/StockDetails/StockDetails";
import Profile from "./pages/Profile/Profile";
import Notfound from "./pages/Notfound/Notfound";
import Wallet from "./pages/Wallet/Wallet";
import Watchlist from "./pages/Watchlist/Watchlist";
import TwoFactorAuth from "./pages/Auth/TwoFactorAuth";
import ResetPasswordForm from "./pages/Auth/ResetPassword";
import PasswordUpdateSuccess from "./pages/Auth/PasswordUpdateSuccess";
import LoginWithGoogle from "./pages/Auth/LoginWithGoogle.";
import Withdrawal from "./pages/Wallet/Withdrawal";
import PaymentDetails from "./pages/Wallet/PaymentDetails";
import WithdrawalAdmin from "./Admin/Withdrawal/WithdrawalAdmin";
import Activity from "./pages/Activity/Activity";
import SearchCoin from "./pages/Search/Search";

function App() {
  const user = useSelector((store) => store.auth.user);
  const dispatch = useDispatch();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    dispatch(getUser()).finally(() => setSessionChecked(true));
  }, [dispatch]);

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <BrandMark className="h-12 animate-soft-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route element={<Auth />} path="/" />
        <Route element={<Auth />} path="/signup" />
        <Route element={<Auth />} path="/signin" />
        <Route element={<Auth />} path="/forgot-password" />
        <Route element={<LoginWithGoogle />} path="/login-with-google" />
        <Route element={<ResetPasswordForm />} path="/reset-password/:session" />
        <Route
          element={<PasswordUpdateSuccess />}
          path="/password-update-successfully"
        />
        <Route element={<TwoFactorAuth />} path="/two-factor-auth/:session" />
        <Route element={<Notfound />} path="*" />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<Home />} path="/" />
        <Route element={<Portfolio />} path="/portfolio" />
        <Route element={<Activity />} path="/activity" />
        <Route element={<Wallet />} path="/wallet" />
        <Route element={<Withdrawal />} path="/withdrawal" />
        <Route element={<PaymentDetails />} path="/payment-details" />
        <Route element={<Wallet />} path="/wallet/:order_id" />
        <Route element={<StockDetails />} path="/market/:id" />
        <Route element={<Watchlist />} path="/watchlist" />
        <Route element={<Profile />} path="/profile" />
        <Route element={<SearchCoin />} path="/search" />
        {user.role === "ROLE_ADMIN" && (
          <Route element={<WithdrawalAdmin />} path="/admin/withdrawal" />
        )}
        <Route element={<Notfound />} path="*" />
      </Route>
    </Routes>
  );
}

export default App;
