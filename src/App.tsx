import React, { useEffect } from 'react';
import coop from './images/coop-showcase.png';
import goahead from './images/goahead-showcase.png';
import sj from './images/sj-showcase.png';
import whitelines from './images/whitelines-showcase.jpg';
import './App.scss';

function App() {
  useEffect(() => {

    let widthRatio: number = Math.max(2, Math.min(0.5, window.innerWidth / window.innerHeight)); // [0.5, 2]
    
    let scaleRatio = widthRatio - 1; // [-0.5, 1]
    
    // Low for vertical, high for horizontal [0, 1]
    if (scaleRatio < 0) { scaleRatio *= 2}
    scaleRatio = (scaleRatio + 1) / 2;

    (window as any).VANTA.FOG({
      el: "#vanta",
      minHeight: 200.00,
      minWidth: 200.00,
      highlightColor: 0xff2060,
      midtoneColor: 0xde3163,
      lowlightColor: 0x772088,
      baseColor: 0x30004a,
      blurFactor: 0.35,
      zoom: 2.2 - 1 * scaleRatio,
      speed: 4 - 3.3 * scaleRatio
    })
  }, [])

  return (
    <div id="app">
      <div id="vanta">
        <section className="hero is-fullheight">
          <div className="hero-body">
            <Intro />
          </div>
        </section>
      </div>
      <Experience />
      <Footer />
    </div>
  );
}

function Intro() {
  return (
    <div className="container">
      <h1 className="title is-1 is-size-3-touch is-spaced fadein-1">Hi, I'm Adrian! I'm a Software Engineer building world-class apps.</h1>
      <p className="mb-4 fadein-2">I'm currently working freelance in Stockholm, previously Software Engineer and Platform Lead at <a href="https://bontouch.com">Bontouch.</a></p>
      <p className="mb-4 fadein-3">I have worked with everything from Android development, technical leadership, web development, graphics programming, audio analysis, to even co-founding a company creating interactive mixed reality experiences.</p>
      <p className="mb-4 fadein-4">If this sounds interesting, feel free to <a href="/files/Adrian_Blanco_CV.pdf">check out my CV</a> or just <a href="mailto:adrianblancode@gmail.com">say hello.</a></p>
      <p></p>
    </div>
  )
}


function Experience() {
  return (
    <section className="section">
      <div className="container">
        <h4 className="title is-5">Recent Projects</h4>
        <div className="columns is-variable is-4">

          <div className="column is-6-tablet mb-4">
            <img src={coop} className="portfolio-image" alt="Coop Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">Coop</h3>
            <p className="is-size-7 mb-1">Coop is a grocery store chain in the Nordics with a strong focus on online shopping.</p>
            <p className="is-size-7">I led the development of their new app for Android as platform lead, building one of the largest ecommerce grocery apps in the Nordics from the ground up and serving hundreds of thousands of users. As platform lead I ensured high technical quality through technical leadership, architecture, software engineering best practices, code reviews, among others.</p>
          </div>

          <div className="column is-6-tablet mb-4">
            <img src={goahead} className="portfolio-image" alt="GoAhead Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">GoAhead</h3>
            <p className="is-size-7 mb-1">I worked with GoAhead as a developer for the ground up rewrite of their 12 bus apps handling passenger travel and tickets for buses all over the UK.</p>
            <p className="is-size-7">The work was a close collaboration between the Stockholm and London offices, and during the final months of the project I relocated to the London office to lead the app experience for the Android platform.</p>
          </div>
        </div>
        <div className="columns is-variable is-4">

          <div className="column is-6-tablet mb-4">
            <img src={sj} className="portfolio-image" alt="SJ Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">Swedish Railways (SJ)</h3>
            <p className="is-size-7 mb-1">I developed a suite of internal apps from the ground up for SJ. They are currently used daily by SJ staff to maintain and repair trains all across Sweden.</p>
          </div>

          <div className="column is-6-tablet mb-4">
            <img src={whitelines} className="portfolio-image" alt="Whitelines Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">Whitelines</h3>
            <p className="is-size-7 mb-1">Whitelines Link is an app to scan and organize your notes. For the Android version, I worked with developing a new major release including a redesign of the app with a new design language and new scanning features.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <section className="section footer">
      <div className="container">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
                <p className="is-size-7">Adrian Blanco</p>
            </div>
            <div className="level-item">
              <a className="is-size-7" href="mailto:adrianblancode@gmail.com">adrianblancode@gmail.com</a>
            </div>
          </div>
          <div className="level-right">
          <div className="level-item">
              <a className="is-size-7" href="/files/Adrian_Blanco_CV.pdf">CV</a>
            </div>
            <div className="level-item">
              <a className="is-size-7" href="https://github.com/adrianblancode">GitHub</a>
            </div>
            <div className="level-item">
              <a className="is-size-7" href="https://linkedin.com/in/adrianblancode" >LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default App;
