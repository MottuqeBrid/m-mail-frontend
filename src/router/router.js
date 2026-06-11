import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layout/Home/HomeLayout";
import HomePage from "../Page/HomePage/HomePage";
import MailPage from "../Page/MailPage/MailPage";
import BlogPage from "../Page/BlogPage/BlogPage";
import LoginPage from "../Page/LoginPage/LoginPage";
import AdminPage from "../Page/AdminPage/AdminPage";
import SignupPage from "../Page/SignupPage/SignupPage";
import NotFoundPage from "../Page/NotFoundPage/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { path: "/", Component: HomePage },
      { path: "/mail", Component: MailPage },
      { path: "/blog", Component: BlogPage },
      { path: "/login", Component: LoginPage },
      { path: "/signup", Component: SignupPage },
      { path: "/admin", Component: AdminPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

export default router;
