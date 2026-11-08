import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contacts from "./components/Contacts";
import Footer from "./components/Footer";
import { Marquee } from "./components/animations/Motion";

const marqueeTop = [
  "Системный анализ",
  "Требования",
  "User Stories",
  "BPMN",
  "UML",
  "REST API",
  "OpenAPI",
  "SQL",
  "Product",
  "Project",
  "MVP",
];

const marqueeBottom = [
  "JOIN",
  "GROUP BY",
  "CTE",
  "Оконные функции",
  "Jira",
  "Confluence",
  "Figma",
  "Miro",
  "Backlog",
  "Scrum",
  "Приёмка",
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="overflow-hidden py-6 -my-6 relative z-10">
          <Marquee items={marqueeTop} />
          <Marquee items={marqueeBottom} reverse />
        </div>
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
