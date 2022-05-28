import React, { useState, useEffect, forwardRef, RefObject, createRef } from 'react'
import * as THREE from 'three'
import FOG from 'vanta/dist/vanta.fog.min'
import paypal from './images/paypal-logo.png'
import coop from './images/coop-showcase.png'
import sj from './images/sj-logo.png'
import goahead from './images/goahead-showcase.png'
import whitelines from './images/whitelines-showcase.jpg'
import tekniska from './images/tekniska-logo.jpg'
import './App.scss'

const scrollToRef = (ref: RefObject<any>) => window.scrollTo(0, ref.current.offsetTop)   

function App() {

  const experienceRef = createRef<HTMLDivElement>()
  const scrollToExperience: () => void = () => scrollToRef(experienceRef)

  return (
    <div id="app">
      <Hero onChevronClicked={scrollToExperience}/>
      <Experience ref={experienceRef} />
    </div>
  )
}

function Hero({ onChevronClicked }: { onChevronClicked: () => void }) {

  return (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <Vanta />
        <div className="hero-bg-grid"/>
        <div className="hero-bg-gradient"/>
        <Intro />
      </div>
      <div className="hero-foot">
        <Footer onChevronClicked={onChevronClicked}/>
      </div>
    </section>
  )
}

function Vanta() {

  const [vantaEffect, setVantaEffect] = useState<any>(null)
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(FOG({
        el: "#vanta-container",
        THREE: THREE,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0xff2060,
        midtoneColor: 0xde3163,
        lowlightColor: 0x772088,
        baseColor: 0x30004a,
        blurFactor: 0.4,
        zoom: 0.55,
        scale: 12,
        scaleMobile: 16,
        speed: -0.4
      }))
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return (
    <div id="vanta-container"/>
  )
}

function Intro() {
  return (
    <div className="container">
      <h1 className="title is-2 is-size-4-touch mb-0 fadein-1">Hey, I'm Adrian Blanco.</h1>
      <h1 className="title is-2 is-size-4-touch fadein-1">I convert coffee into code.</h1>
      <p className="mb-4 fadein-2">I'm a Software Engineer based in <span role="img" aria-label="Sweden">🇸🇪</span>, currently on vacation.</p>
      <p className="mb-4 fadein-3">For the past six years I've worked on everything related to Android, from apps to operating systems. Most recently I worked on the Zettle Terminal hardware at PayPal.</p>
      <p></p>
    </div>
  )
}

function Footer({ onChevronClicked }: { onChevronClicked: () => void }) {
  return (
      <div className="container is-fluid mb-5 fadein-5">
        <div className="level">
          <div className="level-left" />
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
            <div className="level-item">
              <p className="is-size-7">
                <a href="mailto:adrianblancode@gmail.com">Email</a>
              </p>
            </div>
          </div>
        </div>
        <Chevron clickListener={onChevronClicked} />
      </div>
  )
}

function Chevron({ clickListener }: { clickListener: () => void }) {
  return (
    <div className="is-hidden-touch chevron-down fadein-5">
      <button onClick={clickListener}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="white" d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"/>
        </svg>
      </button>
    </div>
  )
}

const Experience = forwardRef<HTMLDivElement>((props, ref) => {

  const projectItems: ProjectItemProps[] = [
    {
      imgSrc : paypal,
      imgAltText : "PayPal logo",
      title : "PayPal",
      descriptions : ["Worked on building the AOSP based operating system for the Zettle Terminal hardware."]
    },
    {
      imgSrc : coop,
      imgAltText : "Coop Showcase",
      title : "Coop",
      descriptions : [
        "Coop is a grocery store chain in the Nordics with a strong focus on online shopping.",
        "I led the development of their new app for Android as platform lead, building one of the largest ecommerce grocery apps in the Nordics from the ground up and serving hundreds of thousands of users. As platform lead I ensured high technical quality through technical leadership, architecture, software engineering best practices, code reviews, among others."
      ]
    },
    {
      imgSrc : sj,
      imgAltText : "SJ logo",
      title : "Swedish Railways (SJ)",
      descriptions : ["I developed a suite of internal apps from the ground up for SJ, currently used daily by SJ staff to maintain and repair trains all across Sweden."]
    },
    {
      imgSrc : goahead,
      imgAltText : "GoAhead Showcase",
      title : "GoAhead",
      descriptions : [
        "I worked with GoAhead as a developer for the ground up rewrite of their bus apps handling passenger travel and tickets for buses all over the UK.",
        "During the final months of the project I relocated to the London office to lead the app experience for the Android platform."
      ]
    },
    {
      imgSrc : whitelines,
      imgAltText : "Whitelines Showcase",
      title : "Whitelines",
      descriptions : ["Whitelines Link is an app to scan and organize your notes. For the Android version, I developed a new major release including a redesign of the app with a new design language and new scanning features."]
    },
    {
      imgSrc : tekniska,
      imgAltText : "Tekniska Museet logo",
      title : "Swedish National Museum of Science and Technology (Tekniska Museet)",
      descriptions : ["I developed interactive mixed reality experiences using Kinect and Unity, which were featured in an exhibit about the history of video games."]
    },
  ]

  let pairs: ProjectItemProps[][] = []
  for (let i = 0; i < projectItems.length; i += 2) {
    pairs.push([projectItems[i], projectItems[i + 1]])
  }

  return (
    <div ref={ref}>
      <section className="section experience">
        <div className="container">
          <h4 className="title is-5">Projects</h4>

          {
            pairs.map((pair, i) => {
              return (
                <div className="columns is-variable is-4" key={i}>
                  <ProjectItem {...pair[0]} key={"p1" + i}/>
                  <ProjectItem {...pair[1]} key={"p2" + i}/>
                </div>
              )
            })
          }

        </div>
      </section>
    </div>
  )
})

interface ProjectItemProps{
  imgSrc: string,
  imgAltText: string,
  title: string,
  descriptions: string[]
}

function ProjectItem(props: ProjectItemProps) {

  return (
    <div className="projectitem column is-6-tablet mb-4">
      <img src={props.imgSrc} className="portfolio-image" alt={props.imgAltText} />
      <h3 className="subtitle is-6 mb-2 mt-4">{props.title}</h3>

      {
        props.descriptions.map((desc, i) => {
          return (
            <p className="is-size-7" key={i}>{desc}</p>
          )
        })
      }

    </div>
  )
}

export default App
