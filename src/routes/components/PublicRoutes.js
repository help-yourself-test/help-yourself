import React from "react";
import { Route } from "react-router-dom";
import { Home, Jobs, JobDetails } from "../../pages";
import { ROUTES } from "../routeConfig";

// Static page components
const AboutPage = () => (
  <div className="content-wrapper">
    <h1>About Us</h1>
    <p>Learn more about our company and mission.</p>
  </div>
);

const ServicesPage = () => (
  <div className="content-wrapper">
    <h1>Our Services</h1>
    <p>Discover the services we offer to help you succeed.</p>
  </div>
);

const ContactPage = () => (
  <div className="content-wrapper">
    <h1>Contact Us</h1>
    <p>Get in touch with our team for support or inquiries.</p>
  </div>
);

// Public route definitions
export const publicRoutes = [
  <Route key="home" path={ROUTES.HOME} element={<Home />} />,
  <Route key="about" path={ROUTES.ABOUT} element={<AboutPage />} />,
  <Route key="services" path={ROUTES.SERVICES} element={<ServicesPage />} />,
  <Route key="contact" path={ROUTES.CONTACT} element={<ContactPage />} />,
  <Route key="jobs" path={ROUTES.JOBS} element={<Jobs />} />,
  <Route key="job-details" path={ROUTES.JOB_DETAILS} element={<JobDetails />} />,
];

export { AboutPage, ServicesPage, ContactPage };
