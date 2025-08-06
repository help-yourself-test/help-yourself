import React from "react";
import Carousel from "../../components/Carousel";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Your App</h1>
          <p className="hero-description">
            Build amazing applications with modern web technologies. Start your
            journey with us today!
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>

          {/* Desktop: Grid layout */}
          <div className="features-grid desktop-only">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Performance</h3>
              <p>Built with modern technologies for optimal performance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>
                Industry-standard security practices to keep your data safe.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Works perfectly on all devices and screen sizes.</p>
            </div>
          </div>

          {/* Universal Carousel - Works on all screen sizes */}
          <div className="features-carousel-container">
            <Carousel
              slidesToShow={3}
              slidesToScroll={1}
              autoPlay={true}
              autoPlayInterval={4000}
              showDots={true}
              showArrows={true}
              infinite={true}
              className="features-carousel external-arrows wide-carousel"
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  },
                },
              ]}
            >
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Fast Performance</h3>
                <p>Built with modern technologies for optimal performance.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>
                  Industry-standard security practices to keep your data safe.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Responsive</h3>
                <p>Works perfectly on all devices and screen sizes.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>Easy to Use</h3>
                <p>
                  Intuitive interface designed for the best user experience.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3>Global Reach</h3>
                <p>
                  Connect with opportunities worldwide and expand your horizons.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3>Top Quality</h3>
                <p>Premium features and excellent support for all users.</p>
              </div>
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
