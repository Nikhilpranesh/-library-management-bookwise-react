import React from "react";
import Banner from "./Banner";
import "../../Assets/css/home.css";
import Lists from "./Lists";
import AllMember from "./AllMember";
import DummyData from "./DummyData";
import Footer from "../../Components/Footer";
import Recommendations from "./Recommendations";

const HomePage = ({ user }) => {
  return (
    <div className="home-top" style={{ paddingTop: "4.5rem" }}>
      {user.userType == "user" ? (
        <>
          <div className="home-inner-top">
            <div className="modern-card fade-in">
              <Banner user={user} />
              <Recommendations username={user.username} />
              <DummyData />
              <Lists user={user} />
            </div>
          </div>
          <Footer />
        </>
      ) : (
        <>
          <div className="home-inner-top">
            <div className="modern-card fade-in">
              <Banner user={user} />
              <DummyData />
              <AllMember user={user} />
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default HomePage;
