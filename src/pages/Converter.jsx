import { useState, useCallback, useRef } from 'react';
import {
  Globe, ArrowRight, ArrowLeft, Smartphone, Palette, Type,
  RotateCcw, Zap, Download, Check, Loader, Eye, Image,
  ToggleLeft, ToggleRight, Clock, ChevronDown, Upload,
  ImagePlus, X, FileArchive
} from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import PhoneMockup from '../components/PhoneMockup';
import { generateApkProject, downloadProject } from '../utils/apkGenerator';
import './Converter.css';

const defaultConfig = {
  websiteUrl: '',
  appName: '',
  packageName: 'com.app.myapp',
  versionName: '1.0.0',
  versionCode: 1,
  primaryColor: '#667eea',
  secondaryColor: '#5a67d8',
  accentColor: '#36d6e7',
  orientation: 'portrait',
  splashEnabled: true,
  splashBgColor: '#667eea',
  splashDuration: 3,
  splashFadeIn: true,
  welcomeText: '',
  welcomeFontSize: 24,
  appIcon: null,
  appIconPreview: null,
};

export default function Converter() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState(defaultConfig);
  const [urlValid, setUrlValid] = useState(null);
  const [building, setBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildComplete, setBuildComplete] = useState(false);
  const [projectBlob, setProjectBlob] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const iconInputRef = useRef(null);

  const update = useCallback((key, val) => {
    setConfig(c => {
      const next = { ...c, [key]: val };
      if (key === 'appName') {
        const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        next.packageName = `com.app.${clean || 'myapp'}`;
        if (!c.welcomeText || c.welcomeText === `Welcome to ${c.appName}` || !c.welcomeText.trim()) {
          next.welcomeText = `Welcome to ${val}`;
        }
      }
      return next;
    });
  }, []);

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setConfig(c => ({
        ...c,
        appIcon: base64,
        appIconPreview: ev.target.result,
        appIconName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = () => {
    setConfig(c => ({ ...c, appIcon: null, appIconPreview: null, appIconName: null }));
    if (iconInputRef.current) iconInputRef.current.value = '';
  };

  const validateUrl = () => {
    try {
      const u = new URL(config.websiteUrl);
      setUrlValid(u.protocol === 'http:' || u.protocol === 'https:');
    } catch { setUrlValid(false); }
  };

  const canNext = () => {
    if (step === 1) return urlValid === true && config.websiteUrl.trim();
    if (step === 2) return config.appName.trim() && config.packageName.trim();
    return true;
  };

  const startBuild = async () => {
    setBuilding(true);
    setBuildComplete(false);
    setBuildProgress(0);
    try {
      const blob = await generateApkProject(config, (status, progress) => {
        setBuildStatus(status);
        setBuildProgress(progress);
      });
      setProjectBlob(blob);
      setBuildComplete(true);
    } catch (e) {
      setBuildStatus('Build failed: ' + e.message);
    }
    setBuilding(false);
  };

  const handleDownloadZip = () => {
    if (projectBlob) downloadProject(projectBlob, config.appName, 'zip');
  };

  // APK cannot be generated in-browser — users must build via Android Studio
  // Only the project ZIP download is available

  const next = () => {
    if (step === 4 && !buildComplete) { startBuild(); return; }
    if (step < 4) setStep(s => s + 1);
  };
  const prev = () => { if (step > 1) setStep(s => s - 1); };

  return (
    <div className="converter-page">
      <div className="converter-bg">
        <div className="converter-orb orb-1" />
        <div className="converter-orb orb-2" />
      </div>
      <div className="container converter-container">
        <div className="converter-header">
          <h1>Convert Your <span className="gradient-text">Website</span> to App</h1>
          <p>Follow the steps below to generate your Android project</p>
        </div>

        <StepIndicator currentStep={step} />

        <div className="converter-body">
          {/* Step 1 — URL */}
          {step === 1 && (
            <div className="step-content animate-step">
              <div className="step-main">
                <div className="step-panel glass-card">
                  <div className="panel-header">
                    <Globe size={20} className="panel-icon" />
                    <h2>Enter Website URL</h2>
                  </div>
                  <p className="panel-desc">Enter the full URL of the website you want to convert into an Android app.</p>
                  <div className="input-group">
                    <label className="input-label">Website URL</label>
                    <div className="url-input-row">
                      <input
                        className={`input-field url-input ${urlValid === true ? 'valid' : urlValid === false ? 'invalid' : ''}`}
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={config.websiteUrl}
                        onChange={e => { update('websiteUrl', e.target.value); setUrlValid(null); }}
                        onBlur={validateUrl}
                      />
                      <button className="btn btn-secondary validate-btn" onClick={validateUrl}>
                        <Eye size={16} /> Validate
                      </button>
                    </div>
                    {urlValid === true && <span className="url-status valid"><Check size={14} /> URL is valid and ready</span>}
                    {urlValid === false && <span className="url-status invalid">Please enter a valid URL starting with https://</span>}
                  </div>

                  {urlValid && config.websiteUrl && (
                    <div className="preview-toggle">
                      <button className="btn btn-secondary" onClick={() => setShowPreview(!showPreview)}>
                        <Eye size={16} /> {showPreview ? 'Hide' : 'Show'} Preview
                      </button>
                    </div>
                  )}

                  {showPreview && urlValid && (
                    <div className="url-preview">
                      <iframe src={config.websiteUrl} title="Website Preview" sandbox="allow-scripts allow-same-origin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — App Settings + Icon Upload */}
          {step === 2 && (
            <div className="step-content animate-step">
              <div className="step-main">
                <div className="step-panel glass-card">
                  <div className="panel-header">
                    <Smartphone size={20} className="panel-icon" />
                    <h2>App Configuration</h2>
                  </div>
                  <p className="panel-desc">Configure your app's identity, icon, and appearance.</p>

                  <div className="form-grid">
                    <div className="input-group">
                      <label className="input-label">App Name *</label>
                      <input className="input-field" placeholder="My Awesome App"
                        value={config.appName} onChange={e => update('appName', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Package Name</label>
                      <input className="input-field mono" placeholder="com.app.myapp"
                        value={config.packageName} onChange={e => update('packageName', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Version Name</label>
                      <input className="input-field" placeholder="1.0.0"
                        value={config.versionName} onChange={e => update('versionName', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Version Code</label>
                      <input className="input-field" type="number" min="1"
                        value={config.versionCode} onChange={e => update('versionCode', parseInt(e.target.value) || 1)} />
                    </div>
                  </div>

                  {/* Custom Icon Upload */}
                  <div className="icon-section">
                    <h3><ImagePlus size={16} /> App Icon</h3>
                    <p className="icon-hint">Upload a square image (512×512px recommended). PNG or JPG.</p>
                    <div className="icon-upload-area">
                      {config.appIconPreview ? (
                        <div className="icon-preview-wrap">
                          <img src={config.appIconPreview} alt="App Icon" className="icon-preview-img" />
                          <div className="icon-preview-info">
                            <span className="icon-filename">{config.appIconName}</span>
                            <button className="icon-remove-btn" onClick={removeIcon}>
                              <X size={14} /> Remove
                            </button>
                          </div>
                          <div className="icon-density-preview">
                            <span className="density-label">Preview at different sizes:</span>
                            <div className="density-icons">
                              <img src={config.appIconPreview} alt="" style={{ width: 24, height: 24, borderRadius: 4 }} />
                              <img src={config.appIconPreview} alt="" style={{ width: 36, height: 36, borderRadius: 6 }} />
                              <img src={config.appIconPreview} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} />
                              <img src={config.appIconPreview} alt="" style={{ width: 64, height: 64, borderRadius: 10 }} />
                              <img src={config.appIconPreview} alt="" style={{ width: 80, height: 80, borderRadius: 12 }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="icon-dropzone" onClick={() => iconInputRef.current?.click()}>
                          <Upload size={32} className="dropzone-icon" />
                          <span className="dropzone-text">Click to upload app icon</span>
                          <span className="dropzone-hint">PNG, JPG — 512×512px recommended</span>
                        </div>
                      )}
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleIconUpload}
                        style={{ display: 'none' }}
                      />
                      {!config.appIconPreview && (
                        <button className="btn btn-secondary icon-upload-btn" onClick={() => iconInputRef.current?.click()}>
                          <Upload size={16} /> Upload Icon
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="color-section">
                    <h3><Palette size={16} /> Theme Colors</h3>
                    <div className="color-grid">
                      <div className="color-pick">
                        <label>Primary</label>
                        <div className="color-input-wrap">
                          <input type="color" value={config.primaryColor} onChange={e => update('primaryColor', e.target.value)} />
                          <span>{config.primaryColor}</span>
                        </div>
                      </div>
                      <div className="color-pick">
                        <label>Secondary</label>
                        <div className="color-input-wrap">
                          <input type="color" value={config.secondaryColor} onChange={e => update('secondaryColor', e.target.value)} />
                          <span>{config.secondaryColor}</span>
                        </div>
                      </div>
                      <div className="color-pick">
                        <label>Accent</label>
                        <div className="color-input-wrap">
                          <input type="color" value={config.accentColor} onChange={e => update('accentColor', e.target.value)} />
                          <span>{config.accentColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Screen Orientation</label>
                    <div className="select-wrap">
                      <select className="input-field" value={config.orientation} onChange={e => update('orientation', e.target.value)}>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                        <option value="unspecified">Auto (Both)</option>
                      </select>
                      <ChevronDown size={16} className="select-arrow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Splash Screen */}
          {step === 3 && (
            <div className="step-content animate-step">
              <div className="step-layout">
                <div className="step-panel glass-card">
                  <div className="panel-header">
                    <Image size={20} className="panel-icon" />
                    <h2>Welcome Screen</h2>
                  </div>
                  <p className="panel-desc">Customize the splash screen users see when opening your app.</p>

                  <div className="toggle-row" onClick={() => update('splashEnabled', !config.splashEnabled)}>
                    <span>Enable Splash Screen</span>
                    {config.splashEnabled ? <ToggleRight size={28} className="toggle-on" /> : <ToggleLeft size={28} className="toggle-off" />}
                  </div>

                  {config.splashEnabled && (
                    <div className="splash-options">
                      <div className="input-group">
                        <label className="input-label">Welcome Text</label>
                        <input className="input-field" placeholder="Welcome to My App"
                          value={config.welcomeText} onChange={e => update('welcomeText', e.target.value)} />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Font Size: {config.welcomeFontSize}sp</label>
                        <input type="range" className="range-slider" min="14" max="40" step="1"
                          value={config.welcomeFontSize} onChange={e => update('welcomeFontSize', parseInt(e.target.value))} />
                      </div>

                      <div className="color-pick">
                        <label>Background Color</label>
                        <div className="color-input-wrap">
                          <input type="color" value={config.splashBgColor} onChange={e => update('splashBgColor', e.target.value)} />
                          <span>{config.splashBgColor}</span>
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="input-label"><Clock size={14} /> Duration: {config.splashDuration}s</label>
                        <input type="range" className="range-slider" min="1" max="5" step="0.5"
                          value={config.splashDuration} onChange={e => update('splashDuration', parseFloat(e.target.value))} />
                      </div>

                      <div className="toggle-row" onClick={() => update('splashFadeIn', !config.splashFadeIn)}>
                        <span>Fade-in Animation</span>
                        {config.splashFadeIn ? <ToggleRight size={24} className="toggle-on" /> : <ToggleLeft size={24} className="toggle-off" />}
                      </div>
                    </div>
                  )}
                </div>

                <div className="preview-panel">
                  <h3><Eye size={16} /> Live Preview</h3>
                  <PhoneMockup scale={0.85}>
                    {config.splashEnabled ? (
                      <div className="splash-preview" style={{ background: config.splashBgColor }}>
                        <div className="splash-preview-logo" style={config.appIconPreview ? { background: 'transparent' } : { background: config.primaryColor }}>
                          {config.appIconPreview ? (
                            <img src={config.appIconPreview} alt="Icon" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                          ) : (
                            <Smartphone size={28} color="white" />
                          )}
                        </div>
                        <p className="splash-preview-text" style={{ fontSize: `${Math.min(config.welcomeFontSize * 0.7, 22)}px` }}>
                          {config.welcomeText || `Welcome to ${config.appName || 'Your App'}`}
                        </p>
                      </div>
                    ) : (
                      <div className="splash-preview" style={{ background: '#0c1021' }}>
                        <p style={{ color: '#565e80', fontSize: '0.8rem' }}>Splash screen disabled</p>
                      </div>
                    )}
                  </PhoneMockup>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Build & Download */}
          {step === 4 && (
            <div className="step-content animate-step">
              <div className="step-main">
                <div className="step-panel glass-card build-panel">
                  <div className="panel-header">
                    <Zap size={20} className="panel-icon" />
                    <h2>Build & Download</h2>
                  </div>

                  {!building && !buildComplete && (
                    <div className="build-summary">
                      <h3>Project Summary</h3>
                      <div className="summary-grid">
                        <div className="summary-item"><span className="summary-label">Website</span><span className="summary-value">{config.websiteUrl}</span></div>
                        <div className="summary-item"><span className="summary-label">App Name</span><span className="summary-value">{config.appName}</span></div>
                        <div className="summary-item"><span className="summary-label">Package</span><span className="summary-value mono">{config.packageName}</span></div>
                        <div className="summary-item"><span className="summary-label">Version</span><span className="summary-value">{config.versionName} ({config.versionCode})</span></div>
                        <div className="summary-item"><span className="summary-label">Splash Screen</span><span className="summary-value">{config.splashEnabled ? 'Enabled' : 'Disabled'}</span></div>
                        <div className="summary-item">
                          <span className="summary-label">App Icon</span>
                          <span className="summary-value">{config.appIconPreview ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img src={config.appIconPreview} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} /> Custom Icon
                            </span>
                          ) : 'Default Icon'}</span>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-large build-btn" onClick={startBuild}>
                        <Zap size={18} /> Generate Android Project
                      </button>
                    </div>
                  )}

                  {building && (
                    <div className="build-progress">
                      <div className="build-spinner"><Loader size={40} className="spin" /></div>
                      <p className="build-status">{buildStatus}</p>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar" style={{ width: `${buildProgress}%` }} />
                      </div>
                      <p className="progress-pct">{buildProgress}%</p>
                    </div>
                  )}

                  {buildComplete && (
                    <div className="build-done">
                      <div className="done-icon"><Check size={40} /></div>
                      <h3>Project Generated!</h3>
                      <p>Your Android Studio project is ready. Download it and build a signed APK/AAB using Android Studio.</p>

                      <div className="download-options">
                        <button className="download-card" onClick={handleDownloadZip}>
                          <div className="download-card-icon zip-icon">
                            <FileArchive size={28} />
                          </div>
                          <div className="download-card-info">
                            <span className="download-card-title">Download Android Studio Project</span>
                            <span className="download-card-desc">Complete source code (.zip) — open in Android Studio to build</span>
                          </div>
                          <Download size={18} className="download-arrow" />
                        </button>
                      </div>

                      <div className="build-instructions glass-card">
                        <h4>📱 How to Build APK & Upload to Play Store</h4>
                        <ol>
                          <li><span>1</span> <strong>Download</strong> the project ZIP above</li>
                          <li><span>2</span> <strong>Extract</strong> and open in <strong>Android Studio</strong></li>
                          <li><span>3</span> Wait for <strong>Gradle sync</strong> to finish</li>
                          <li><span>4</span> <strong>Build → Generate Signed Bundle / APK</strong></li>
                          <li><span>5</span> Choose <strong>APK</strong> for testing or <strong>AAB</strong> for Play Store</li>
                          <li><span>6</span> Create or select a <strong>Keystore</strong> to sign the app</li>
                          <li><span>7</span> Upload the signed <strong>AAB</strong> to <strong>Google Play Console</strong></li>
                        </ol>
                      </div>

                      <button className="btn btn-secondary" onClick={() => { setStep(1); setConfig(defaultConfig); setBuildComplete(false); setProjectBlob(null); setUrlValid(null); }}>
                        <RotateCcw size={16} /> Convert Another Website
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="step-nav">
            {step > 1 && !building && (
              <button className="btn btn-secondary" onClick={prev}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div className="nav-spacer" />
            {step < 4 && (
              <button className="btn btn-primary" onClick={next} disabled={!canNext()}>
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
