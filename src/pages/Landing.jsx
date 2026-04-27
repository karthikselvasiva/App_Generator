import { Link } from 'react-router-dom';
import {
  Zap, Smartphone, Globe, Palette, Download, Shield, Bell,
  WifiOff, ArrowRight, Check, ChevronRight, Layers,
  Code2, Rocket, Play, ImagePlus
} from 'lucide-react';
import PhoneMockup from '../components/PhoneMockup';
import './Landing.css';

const features = [
  { icon: <Globe size={24} />, title: 'Any Website', desc: 'Convert any responsive website into a native Android app with full WebView support.' },
  { icon: <Palette size={24} />, title: 'Custom Splash Screen', desc: 'Design beautiful welcome screens with custom colors, logos, and animations.' },
  { icon: <Download size={24} />, title: 'APK Download', desc: 'Generate and download your APK file instantly, ready for Play Store upload.' },
  { icon: <ImagePlus size={24} />, title: 'Custom App Icon', desc: 'Upload your own app icon and see it applied across all Android screen densities.' },
  { icon: <Shield size={24} />, title: 'Play Store Ready', desc: 'Generated apps meet all Google Play Store requirements and guidelines.' },
  { icon: <Bell size={24} />, title: 'Push Notifications', desc: 'Pre-configured push notification support via Firebase Cloud Messaging.' },
  { icon: <WifiOff size={24} />, title: 'Offline Support', desc: 'Built-in offline handling with custom error pages when no connection.' },
];

const steps = [
  { num: '01', title: 'Enter Your URL', desc: 'Paste your website URL and we validate it automatically.', icon: <Globe size={32} /> },
  { num: '02', title: 'Customize Your App', desc: 'Set app name, icon, colors, splash screen, and more.', icon: <Palette size={32} /> },
  { num: '03', title: 'Download & Publish', desc: 'Get your Android project, build it, and upload to Play Store.', icon: <Rocket size={32} /> },
];



const stats = [
  { value: '50K+', label: 'Apps Created' },
  { value: '120+', label: 'Countries' },
  { value: '4.9★', label: 'User Rating' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Zap size={14} /> <span>Website to App in Minutes</span>
            </div>
            <h1>
              Convert Your <span className="gradient-text">Website</span> Into a
              <span className="gradient-text"> Pro Android App</span>
            </h1>
            <p className="hero-desc">
              Transform any website into a Play Store-ready Android application with custom splash screens,
              push notifications, and a premium native feel. No coding required.
            </p>
            <div className="hero-actions">
              <Link to="/converter" className="btn btn-primary btn-large">
                <Zap size={18} /> Start Converting
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-large">
                <Play size={18} /> See How It Works
              </a>
            </div>
            <div className="hero-stats">
              {stats.map(s => (
                <div key={s.label} className="hero-stat">
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <PhoneMockup>
              <div className="hero-phone-content">
                <div className="hero-phone-header">
                  <div className="hero-phone-dots"><span/><span/><span/></div>
                  <div className="hero-phone-url">yourwebsite.com</div>
                </div>
                <div className="hero-phone-body">
                  <div className="hero-phone-logo">
                    <Smartphone size={28} />
                  </div>
                  <div className="hero-phone-text">Your App</div>
                  <div className="hero-phone-bars">
                    <div className="bar"/><div className="bar"/><div className="bar short"/>
                  </div>
                </div>
              </div>
            </PhoneMockup>
            <div className="hero-float-card card-1">
              <Check size={16} className="float-icon green" />
              <span>Play Store Ready</span>
            </div>
            <div className="hero-float-card card-2">
              <Download size={16} className="float-icon blue" />
              <span>APK Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag"><Layers size={14} /> Features</span>
            <h2>Everything You Need to <span className="gradient-text">Build Your App</span></h2>
            <p>Powerful features that turn your website into a professional Android application.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag"><Code2 size={14} /> Process</span>
            <h2>How It <span className="gradient-text">Works</span></h2>
            <p>Three simple steps to convert your website into a professional app.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon-wrapper">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <ChevronRight className="step-arrow" size={24} />}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg" />
            <h2>Ready to Convert Your Website?</h2>
            <p>Join thousands of developers who trust AppCraft Pro to build their mobile apps.</p>
            <Link to="/converter" className="btn btn-primary btn-large">
              <Zap size={18} /> Start Building Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="navbar-brand">
              <div className="brand-icon"><Smartphone size={18} /><Zap size={10} className="brand-zap"/></div>
              <span className="brand-text">App<span className="gradient-text">Craft</span> Pro</span>
            </div>
            <p>Transform your website into a professional Android app in minutes.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link to="/converter">Converter</Link>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Documentation</a>
              <a href="#">FAQ</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 AppCraft Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
