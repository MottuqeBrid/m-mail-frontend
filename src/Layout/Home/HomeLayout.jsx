import { Outlet } from "react-router";
import Navbar from "../../Components/Navbar/Navbar";

const HomeLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default HomeLayout;
