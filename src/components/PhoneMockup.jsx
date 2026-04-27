import './PhoneMockup.css';

export default function PhoneMockup({ children, scale = 1 }) {
  return (
    <div className="phone-mockup-wrapper" style={{ transform: `scale(${scale})` }}>
      <div className="phone-mockup">
        <div className="phone-notch">
          <div className="phone-camera" />
        </div>
        <div className="phone-screen">
          {children}
        </div>
        <div className="phone-home-bar" />
      </div>
    </div>
  );
}
