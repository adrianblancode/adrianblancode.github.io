import BlueprintHero from './blueprint/BlueprintHero'
import ok from './images/ok_logo.png'
import paypal from './images/paypal-logo.png'
import coop from './images/coop-showcase.png'
import sj from './images/sj-logo.png'
import goahead from './images/goahead-showcase.png'
import whitelines from './images/whitelines-showcase.jpg'
import tekniska from './images/tekniska-logo.jpg'
import './App.scss'

function App() {
  return (
    <div id="app">
      <BlueprintHero />
      <Experience />
    </div>
  )
}

interface ProjectItemProps{
  imgSrc: string,
  imgAltText: string,
  title: string,
  descriptions: string[]
}

function Experience() {

  const projectItems: ProjectItemProps[] = [
    {
      imgSrc : ok,
      imgAltText : "OK logo",
      title : "OK",
      descriptions : [
        "Leading the development of the OK apps as platform lead for Android.",
        "<a href=\"https://play.google.com/store/apps/details?id=dk.ok.android.findtank&hl=da\">OK at Google Play</a>"
      ]
    },
    {
      imgSrc : paypal,
      imgAltText : "PayPal logo",
      title : "PayPal",
      descriptions : [
        "Zettle Terminal is PayPal's leading payment terminal.",
        "I worked on building the operating system for the Zettle Terminal hardware, based on AOSP.",
        "I developed new payment features for the Zettle Android SDK serving millions of users, such as accessibility payment flows, tipping for global markets and Venmo payments for the US market.",
        // "Developed Venmo payments in Zettle Android for the US market"
        "<a href=\"https://www.youtube.com/watch?v=00LU2zrlL5U\">Zettle Terminal at YouTube</a>"
      ]
    },
    {
      imgSrc : coop,
      imgAltText : "Coop Showcase",
      title : "Coop",
      descriptions : [
        "Coop is one of the largest grocery store chains in the Nordics, with a strong focus on online shopping.",
        "I led the development of the new Coop app for Android as platform lead, building one of the largest ecommerce apps in the Nordics from the ground up and serving hundreds of thousands of users.",
        "As platform lead I ensured high technical quality through technical leadership, architecture, software engineering best practices, code reviews, among others.",
        "<a href=\"https://play.google.com/store/apps/details?id=se.nansen.coop\">Coop at Google Play</a>"
      ]
    },
    {
      imgSrc : sj,
      imgAltText : "SJ logo",
      title : "Swedish Railways (SJ)",
      descriptions : [
        "SJ is the largest train operator in Sweden.",
        "I worked with developing the internal apps for SJ that are used for scanning tickets and managing trains all across Sweden.",
        "<a href=\"https://www.bbc.com/news/av/technology-41178142\">SJ ticket scanning app featured on BBC</a>"
      ]
    },
    {
      imgSrc : goahead,
      imgAltText : "GoAhead Showcase",
      title : "GoAhead",
      descriptions : [
        "GoAhead is one of the largest bus operators in the UK.",
        "I worked with GoAhead as a developer for the ground up rewrite of their bus apps handling passenger travel and tickets for buses all across the UK.",
        "During the final months of the project I relocated to the London office to lead the app experience for the Android platform."
      ]
    },
    {
      imgSrc : whitelines,
      imgAltText : "Whitelines Showcase",
      title : "Whitelines",
      descriptions : [
        "Whitelines Link is an app to scan and organize your notes.",
        "For the Android version, I developed a new major release including a redesign of the app with a new design language and new scanning features.",
        "<a href=\"https://play.google.com/store/apps/details?id=se.whitelines.link\">Whitelines Link at Google Play</a>"
      ]
    },
    {
      imgSrc : tekniska,
      imgAltText : "Tekniska Museet logo",
      title : "Swedish National Museum of Science and Technology (Tekniska Museet)",
      descriptions : [
        "I developed interactive mixed reality experiences using Kinect and Unity, which were featured in an exhibit about the history of video games.",
        "<a href=\"https://www.tekniskamuseet.se/en/discover/exhibitions/play-beyond-play/\">Play Beyond Play at Tekniska Museet</a>"
      ]
    },
  ]

  return (
    <div>
      <section className="section experience" id="work">
        <div className="container">
          <h2 className="title is-5">My work</h2>

          {
            projectItems.map((item, i) => {
              return (
                  <ProjectItem {...item} key={"p" + i}/>
              )
            })
          }

        </div>
      </section>
    </div>
  )
}

function ProjectItem(props: ProjectItemProps) {

  return (
    <div className="columns mb-6 is-4 is-variable">
      <div className="projectitem column is-4-tablet mt-1">
        <a href={props.imgSrc} target="_blank" rel="noopener noreferrer">
          <img src={props.imgSrc} className="portfolio-image" alt={props.imgAltText} />
        </a>
      </div>
      <div className="projectitem column is-8-tablet ">
        <h3 className="subtitle is-6 mb-2">{props.title}</h3>

        {
          props.descriptions.map((desc, i) => {
            return (
              <p className="is-size-7" key={i} dangerouslySetInnerHTML={{__html: desc}} />
            )
          })
        }

    </div>
  </div>
  )
}

export default App
