import React, { useState, useEffect } from "react";
import "../Assets/css/landing.css";

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Create floating particles
    const particleCount = 50;
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 6 + 3,
        delay: Math.random() * 2
      });
    }
    setParticles(newParticles);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="land-top">
      {/* Particle Background */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      <div className="land-inner-top">
        <div className="land-banner-image">
          {isLoading && (
            <div className="loaders book">
              <figure className="page"></figure>
              <figure className="page"></figure>
              <figure className="page"></figure>
            </div>
          )}
          <img
            className={`vert-move ${isLoading ? "hidden" : ""}`}
            src="https://raw.githubusercontent.com/AnuragRoshan/images/553c833e30f5c0a7b803ff548835b9e935cefc79/undraw_reading_time_re_phf7.svg"
            alt="reading-girl"
            onLoad={handleImageLoad}
          />
        </div>
        <div className="land-banner-slogan">
          <div className="land-banner-slogan-inner">
            <div className="land-logo">bookWise</div>
            <div className="land-motto">Discover, Learn, Grow</div>
            <div className="land-button">
              <a className="landing-button-hover" href="/explore">
                <span>Explore Library</span>
              </a>
              <a className="admin-link" href="/admin/login">
                <span>🔐 Admin Panel</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
