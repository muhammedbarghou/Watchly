import React from "react";
// import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <FooterColumn title="Company" items={["About", "Careers", "Press"]} />
        <FooterColumn title="Support" items={["Help Center", "Contact", "Terms"]} />
        <FooterColumn title="Social" items={["Twitter", "Instagram", "Facebook"]} />
        <FooterColumn title="Legal" items={["Privacy", "Terms of Service", "Cookie Preferences"]} />
      </div>
      <p className="footer-copy">© 2025 Watchly. All rights reserved.</p>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div className="footer-column">
      <h4 className="footer-title">{title}</h4>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
