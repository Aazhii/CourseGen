const API_BASE = "http://localhost:8080";

export default function OAuthButtons() {
  return (
    <div className="oauth-container">
      <div className="oauth-divider">OR</div>

      <div className="oauth-buttons">
        {/* Google Button - Using Wikimedia Image */}
        <a
          href={`${API_BASE}/oauth2/authorization/google`}
          className="oauth-btn google"
          aria-label="Continue with Google"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
            alt="Google" 
            style={{ width: '24px', height: '24px' }} 
          />
        </a>

        {/* GitHub Button - Using Wikimedia Image */}
        <a
          href={`${API_BASE}/oauth2/authorization/github`}
          className="oauth-btn github"
          aria-label="Continue with GitHub"
        >
          {/* filter: invert(1) turns the black logo white for dark mode */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" 
            alt="GitHub" 
            style={{ width: '24px', height: '24px', filter: 'invert(1)' }} 
          />
        </a>
      </div>
    </div>
  );
}