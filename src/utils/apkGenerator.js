import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function generateManifest(config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        ${config.splashEnabled ? `<activity
            android:name=".SplashActivity"
            android:exported="true"
            android:theme="@style/SplashTheme"
            android:screenOrientation="${config.orientation}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <activity android:name=".MainActivity" android:screenOrientation="${config.orientation}" />` :
        `<activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="${config.orientation}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>`}
    </application>
</manifest>`;
}

function generateProjectGradle() {
  return `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`;
}

function generateAppGradle(config) {
  return `plugins {
    id 'com.android.application'
}

android {
    namespace '${config.packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${config.packageName}"
        minSdk 24
        targetSdk 34
        versionCode ${config.versionCode}
        versionName "${config.versionName}"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.9.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.core:core-splashscreen:1.0.1'
}`;
}

function generateMainActivity(config) {
  const pkg = config.packageName;
  return `package ${pkg};

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.KeyEvent;
import android.view.View;
import android.widget.ProgressBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private ProgressBar progressBar;
    private SwipeRefreshLayout swipeRefresh;
    private static final String URL = "${config.websiteUrl}";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        swipeRefresh = findViewById(R.id.swipeRefresh);

        setupWebView();
        setupSwipeRefresh();
        webView.loadUrl(URL);
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) progressBar.setVisibility(View.GONE);
                else progressBar.setVisibility(View.VISIBLE);
            }
        });
    }

    private void setupSwipeRefresh() {
        swipeRefresh.setOnRefreshListener(() -> {
            webView.reload();
            swipeRefresh.setRefreshing(false);
        });
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}`;
}

function generateSplashActivity(config) {
  const pkg = config.packageName;
  return `package ${pkg};

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {
    private static final int SPLASH_DURATION = ${config.splashDuration * 1000};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ${config.splashFadeIn ? `ImageView logo = findViewById(R.id.splashLogo);
        TextView welcomeText = findViewById(R.id.welcomeText);
        AlphaAnimation fadeIn = new AlphaAnimation(0.0f, 1.0f);
        fadeIn.setDuration(1000);
        fadeIn.setFillAfter(true);
        if (logo != null) logo.startAnimation(fadeIn);
        if (welcomeText != null) welcomeText.startAnimation(fadeIn);` : ''}

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            finish();
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        }, SPLASH_DURATION);
    }
}`;
}

function generateMainLayout() {
  return `<?xml version="1.0" encoding="utf-8"?>
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swipeRefresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <RelativeLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        <ProgressBar
            android:id="@+id/progressBar"
            style="?android:attr/progressBarStyleHorizontal"
            android:layout_width="match_parent"
            android:layout_height="4dp"
            android:layout_alignParentTop="true"
            android:indeterminate="false"
            android:max="100" />
        <android.webkit.WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_below="@id/progressBar" />
    </RelativeLayout>
</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>`;
}

function generateSplashLayout(config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="${config.splashBgColor}"
    android:gravity="center">
    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:gravity="center"
        android:orientation="vertical">
        <ImageView
            android:id="@+id/splashLogo"
            android:layout_width="120dp"
            android:layout_height="120dp"
            android:src="@mipmap/ic_launcher"
            android:contentDescription="App Logo" />
        <TextView
            android:id="@+id/welcomeText"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:text="${config.welcomeText || config.appName}"
            android:textColor="#FFFFFF"
            android:textSize="${config.welcomeFontSize || 24}sp"
            android:fontFamily="sans-serif-medium" />
    </LinearLayout>
</RelativeLayout>`;
}

function generateColors(config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${config.primaryColor}</color>
    <color name="colorPrimaryDark">${config.secondaryColor || config.primaryColor}</color>
    <color name="colorAccent">${config.accentColor || config.primaryColor}</color>
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
    <color name="splash_bg">${config.splashBgColor || config.primaryColor}</color>
</resources>`;
}

function generateStrings(config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${config.appName}</string>
    <string name="welcome_text">${config.welcomeText || 'Welcome to ' + config.appName}</string>
</resources>`;
}

function generateStyles(config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:windowFullscreen">true</item>
    </style>
    <style name="SplashTheme" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:windowBackground">@color/splash_bg</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowNoTitle">true</item>
    </style>
</resources>`;
}

function generateProguard() {
  return `-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-dontwarn android.webkit.**`;
}

function generateSettingsGradle(config) {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
rootProject.name = "${config.appName}"
include ':app'`;
}

function generateGradleProperties() {
  return `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true`;
}

function generateReadme(config) {
  return `# ${config.appName}

Android app generated by AppCraft Pro — Website to App Converter.

## Website URL
${config.websiteUrl}

## How to Build

### Prerequisites
- Android Studio (latest version)
- Java JDK 17+
- Android SDK 34

### Steps

1. **Open** this project in Android Studio
2. **Wait** for Gradle sync to complete
3. **Connect** an Android device or start an emulator
4. **Click** Run (green play button) to test

### Generate Signed APK/AAB for Play Store

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle (AAB)** for Play Store
3. Create a new keystore or use existing one
4. Select **release** build variant
5. Click **Finish**
6. Find AAB in: \`app/build/outputs/bundle/release/\`

### Play Store Upload

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app listing
3. Upload the generated AAB file
4. Fill in store listing details
5. Submit for review

## Configuration
- Package: ${config.packageName}
- Version: ${config.versionName} (${config.versionCode})
- Min SDK: 24 (Android 7.0)
- Target SDK: 34 (Android 14)
`;
}

function generateIconSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="${color}"/>
  <text x="256" y="300" text-anchor="middle" fill="white" font-size="240" font-family="Arial, sans-serif" font-weight="bold">A</text>
</svg>`;
}

export async function generateApkProject(config, onProgress) {
  const zip = new JSZip();
  const root = `${config.appName.replace(/\s+/g, '')}`;
  const pkgPath = config.packageName.replace(/\./g, '/');

  onProgress?.('Generating project structure...', 10);
  await delay(400);

  // Root files
  zip.file(`${root}/build.gradle`, generateProjectGradle());
  zip.file(`${root}/settings.gradle`, generateSettingsGradle(config));
  zip.file(`${root}/gradle.properties`, generateGradleProperties());
  zip.file(`${root}/README.md`, generateReadme(config));

  onProgress?.('Creating app module...', 25);
  await delay(400);

  // App module
  zip.file(`${root}/app/build.gradle`, generateAppGradle(config));
  zip.file(`${root}/app/proguard-rules.pro`, generateProguard());

  // Manifest
  zip.file(`${root}/app/src/main/AndroidManifest.xml`, generateManifest(config));

  onProgress?.('Generating Java source code...', 40);
  await delay(500);

  // Java sources
  zip.file(`${root}/app/src/main/java/${pkgPath}/MainActivity.java`, generateMainActivity(config));
  if (config.splashEnabled) {
    zip.file(`${root}/app/src/main/java/${pkgPath}/SplashActivity.java`, generateSplashActivity(config));
  }

  onProgress?.('Creating layouts & resources...', 55);
  await delay(400);

  // Layouts
  zip.file(`${root}/app/src/main/res/layout/activity_main.xml`, generateMainLayout());
  if (config.splashEnabled) {
    zip.file(`${root}/app/src/main/res/layout/activity_splash.xml`, generateSplashLayout(config));
  }

  // Values
  zip.file(`${root}/app/src/main/res/values/colors.xml`, generateColors(config));
  zip.file(`${root}/app/src/main/res/values/strings.xml`, generateStrings(config));
  zip.file(`${root}/app/src/main/res/values/styles.xml`, generateStyles(config));

  onProgress?.('Generating app icons...', 70);
  await delay(400);

  // Icons — use custom uploaded icon or generate default
  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
  if (config.appIcon) {
    // User uploaded a custom icon (base64 PNG/JPG)
    densities.forEach(d => {
      zip.file(`${root}/app/src/main/res/mipmap-${d}/ic_launcher.png`, config.appIcon, { base64: true });
      zip.file(`${root}/app/src/main/res/mipmap-${d}/ic_launcher_round.png`, config.appIcon, { base64: true });
    });
  } else {
    // Generate default SVG icon
    const iconSvg = generateIconSvg(config.primaryColor || '#667eea');
    densities.forEach(d => {
      zip.file(`${root}/app/src/main/res/mipmap-${d}/ic_launcher.svg`, iconSvg);
      zip.file(`${root}/app/src/main/res/mipmap-${d}/ic_launcher_round.svg`, iconSvg);
    });
  }

  onProgress?.('Packaging project...', 85);
  await delay(500);

  // Gradle wrapper
  zip.file(`${root}/gradle/wrapper/gradle-wrapper.properties`,
    `distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip`);

  onProgress?.('Finalizing build...', 95);
  await delay(400);

  const blob = await zip.generateAsync({ type: 'blob' });
  onProgress?.('Build complete!', 100);
  await delay(300);

  return blob;
}

export function downloadProject(blob, appName, format = 'zip') {
  const cleanName = appName.replace(/\s+/g, '_');
  if (format === 'apk') {
    const fileName = `${cleanName}.apk`;
    saveAs(blob, fileName);
  } else {
    const fileName = `${cleanName}_AndroidProject.zip`;
    saveAs(blob, fileName);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
