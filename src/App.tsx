import React, { useLayoutEffect } from 'react';
import gmail from './vectors/gmail.svg';
import linkedin from './vectors/linkedin.svg';
import github from './vectors/github.svg';
import './App.scss';

function App() {
  useLayoutEffect(() => {
    (window as any).VANTA.FOG({
      el: "#root",
      minHeight: 200.00,
      minWidth: 200.00,
      highlightColor: 0x101015,
      midtoneColor: 0xd02040,
      lowlightColor: 0x7020b0,
      baseColor: 0x221122,
      blurFactor: 0.35,
      zoom: 1,
      speed: 0.5
    })

  })
  return (
    <div id="app">
      <section className="hero is-fullheight">
        <div className="hero-body">
          <Intro />
        </div>
        <section className="hero-footer"> 
          <Footer />
        </section>
      </section>
    </div>
  );
}

function Intro() {
  return (
    <div className="container">
      <h1 className="title is-1 is-size-3-touch is-spaced">Hi, I'm Adrian! I build world-class Android apps.</h1>
      <p className="mb-4">I am a Stockholm based developer currently working freelance, previously Software Engineer and Platform Lead at <a href="https://bontouch.com">Bontouch.</a></p>
      <p className="mb-4">I have done everything from mobile development, technical leadership, web development, graphics programming, audio analysis, to even co-founding a company creating interactive mixed reality experiences.</p>
      <p className="mb-4">If this sounds interesting, feel free to <a href="/files/Adrian_Blanco_CV.pdf">check out my CV</a> or just <a href="mailto:adrianblancode@gmail.com">say hello.</a></p>
      <p></p>
    </div>
  )
}


function Experience() {
  return (
    <div className="container">
      <h4 className="title is-4">Recent Projects</h4>
      <div className="columns">
        <div className="column is-6-tablet">
          <img src="/images/coop-showcase.png" alt="Coop Showcase" />
          <h3 className="subtitle is-5">Coop</h3>
        </div>
        <div className="column is-6-tablet">
          <img src="/images/goahead-showcase.png" alt="GoAhead Showcase" />
          <h3>GoAhead</h3>
        </div>
      </div>
      <div className="columns">
        <div className="column is-6-tablet">
          <img src="/images/sj-showcase.png" alt="SJ Showcase" />
          <h3>Swedish Railways (SJ)</h3>
        </div>
        <div className="column is-6-tablet">
          <img src="/images/whitelines-showcase.jpg" alt="Whitelines Showcase" />
          <h3>Whitelines</h3>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
      <div className="container pb-4">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <p className="is-size-7">Made with ❤️ by Adrian Blanco</p>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <a href="https://github.com/adrianblancode" className="social-container">
                <img src={github} className="social" alt="GitHub" />
              </a>
              <a href="https://linkedin.com/in/adrianblancode" className="social-container">
                <img src={linkedin} className="social" alt="LinkedIn" />
                </a>
              <a href="mailto:adrianblancode@gmail.com" className="social-container">
                <img src={gmail} className="social" alt="Email" />
              </a>
            </div>
          </div>
        </div>
      </div>
  )
}

export default App;
