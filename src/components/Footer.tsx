import React from "react";
export function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="logo" href="index.html#home">
          Prabin Poudel<span>.</span>
        </a>
        <p>Computer Engineering Student · Bharatpur, Nepal</p>
      </div>
      <div className="footer-links">
        <a
          className=""
          href="https://github.com/Prabin-Poudel-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a
          className=""
          href="https://www.linkedin.com/in/prabin-poudel-556180329"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a
          className=""
          href="https://instagram.com/pra_.veen._005"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href="mailto:contact@poudelprabin.com.np">Email</a>
      </div>
      <p className="copyright">
        © <span data-year>2026</span> Prabin Poudel
      </p>
    </footer>
  );
}
