import React, { useEffect, useRef, MutableRefObject } from 'react';
import paypal from './images/paypal-logo.png';
import coop from './images/coop-showcase.png';
import sj from './images/sj-logo.png';
import goahead from './images/goahead-showcase.png';
import whitelines from './images/whitelines-showcase.jpg';
import tekniska from './images/tekniska-logo.jpg';
import './App.scss';

const scrollToRef = (ref: MutableRefObject<any>) => window.scrollTo(0, ref.current.offsetTop)   

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

  const experienceRef = useRef(null)
  const scrollToExperience: (() => void) = () => scrollToRef(experienceRef)

  return (
    <div id="app">
      <div id="vanta">
        <section className="hero is-fullheight">
          <div className="hero-body">
            <Intro />
          </div>
          <Chevron clickListener={scrollToExperience} />
        </section>
      </div>
      <div ref={experienceRef}>
        <Experience />
      </div>
      <Footer />
    </div>
  )
}

function Chevron({ clickListener }: { clickListener: () => void }) {
  return (
    <div className="is-hidden-touch chevron-down fadein-5">
      <a onClick={clickListener}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="white" d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"/>
        </svg>
      </a>
    </div>
  )
}

function Intro() {
  return (
    <div className="container">
      <h1 className="title is-1 is-size-3-touch is-spaced fadein-1">Hi, I'm Adrian! I'm a Software Engineer making awesome apps.</h1>
      <p className="mb-4 fadein-2">I'm currently working freelance at <a href="https://paypal.com/">PayPal</a> in Stockholm, previously Software Engineer and Platform Lead at <a href="https://bontouch.com/">Bontouch</a>.</p>
      <p className="mb-4 fadein-3">I have a background in building and leading Android apps for hundreds of thousands of users, and for the last four years I have worked with some of Sweden's most popular apps, using Kotlin, Java, RxJava, Coroutines and Dagger.</p>
      <p className="mb-4 fadein-4">Interested? Feel free to check out my <a href="/files/Adrian_Blanco_CV.pdf">CV</a> or just <a href="mailto:adrianblancode@gmail.com">say hello.</a></p>
      <p></p>
    </div>
  )
}

function Experience() {
  return (
    <section className="section experience">
      <div className="container">
        <h4 className="title is-5">Recent Projects</h4>
        <div className="columns is-variable is-4">

          <div className="column is-6-tablet mb-4">
            <img src={paypal} className="portfolio-image" alt="PayPal logo" />
            <h3 className="subtitle is-6 mb-2 mt-4">PayPal</h3>
            <p className="is-size-7 mb-1">Working on the iZettle Android platform.</p>
          </div>
          
          <div className="column is-6-tablet mb-4">
            <img src={coop} className="portfolio-image" alt="Coop Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">Coop</h3>
            <p className="is-size-7 mb-1">Coop is a grocery store chain in the Nordics with a strong focus on online shopping.</p>
            <p className="is-size-7">I led the development of their new app for Android as platform lead, building one of the largest ecommerce grocery apps in the Nordics from the ground up and serving hundreds of thousands of users. As platform lead I ensured high technical quality through technical leadership, architecture, software engineering best practices, code reviews, among others.</p>
          </div>

        </div>
        <div className="columns is-variable is-4">

          <div className="column is-6-tablet mb-4">
            <img src={sj} className="portfolio-image" alt="SJ logo" />
            <h3 className="subtitle is-6 mb-2 mt-4">Swedish Railways (SJ)</h3>
            <p className="is-size-7 mb-1">I developed a suite of internal apps from the ground up for SJ, currently used daily by SJ staff to maintain and repair trains all across Sweden.</p>
          </div>

          <div className="column is-6-tablet mb-4">
            <img src={goahead} className="portfolio-image" alt="GoAhead Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">GoAhead</h3>
            <p className="is-size-7 mb-1">I worked with GoAhead as a developer for the ground up rewrite of their bus apps handling passenger travel and tickets for buses all over the UK.</p>
            <p className="is-size-7">During the final months of the project I relocated to the London office to lead the app experience for the Android platform.</p>
          </div>

        </div>
        <div className="columns is-variable is-4">

          <div className="column is-6-tablet mb-4">
            <img src={whitelines} className="portfolio-image" alt="Whitelines Showcase" />
            <h3 className="subtitle is-6 mb-2 mt-4">Whitelines</h3>
            <p className="is-size-7 mb-1">Whitelines Link is an app to scan and organize your notes. For the Android version, I developed a new major release including a redesign of the app with a new design language and new scanning features.</p>
          </div>

          <div className="column is-6-tablet mb-4">
            <img src={tekniska} className="portfolio-image" alt="Tekniska Museet logo" />
            <h3 className="subtitle is-6 mb-2 mt-4">Swedish National Museum of Science and Technology (Tekniska Museet)</h3>
            <p className="is-size-7 mb-1">I developed interactive mixed reality experiences using Kinect and Unity, which were featured in an exhibit about the history of video games.</p>
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
              <p className="is-size-7">
                <a href="mailto:adrianblancode@gmail.com">adrianblancode@gmail.com</a>
              </p>
            </div>
          </div>
          <div className="level-right">
          <div className="level-item">
            <p className="is-size-7">
              <a href="/files/Adrian_Blanco_CV.pdf">CV</a>
            </p>
            </div>
            <div className="level-item">
              <p className="is-size-7">
                <a href="https://github.com/adrianblancode">GitHub</a>
              </p>
            </div>
            <div className="level-item">
              <p className="is-size-7">
                <a href="https://linkedin.com/in/adrianblancode">LinkedIn</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default App;
