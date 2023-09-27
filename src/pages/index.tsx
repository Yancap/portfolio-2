import { About } from '@/components/About'
import { Aside } from '@/components/Aside'
import { Contact } from '@/components/Contact'
import { Hability } from '@/components/Hability'
import { Projects } from '@/components/Projects'
import { getPrismicClient } from '@/services/prismic'
import { GetServerSideProps } from 'next'
import { RichText } from 'prismic-dom'
import Head from 'next/head'
import { ProjectDocumentData } from '../../prismicio-types'

interface TechsProjects{
  tech: string;
  image?: string;
}
export interface TechProps{
  tech: string;
  text: string;
  order: number;
  level: string;
}
export interface ProjectProps {
      id: string;
      title: string;
      text: string;
      techs: TechsProjects[],
      image: { alt: string; src: string; },
      src: string | null;
      github: string | null; 
}
export interface AboutProps{
  text: string;
}
export interface ServerProps {
  projectsPersonal: ProjectProps[];
  projectsGroup: ProjectProps[];
  about: AboutProps;
  tech: TechProps[];
}

interface NewProjectsDocuments extends ProjectDocumentData{
  order: number;
}

export type ProjectsProps = Omit<ServerProps, "about" | "tech">;

export default function Home({projectsPersonal, projectsGroup, about, tech}: ServerProps) {
  
  return (
    <>
      <Head>
        
        <title>Portfolio | Yan</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='use-credentials' />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section //className="grid gap-20 sm:gap-0 sm:grid-cols-2 sm:min-h-screen relative mx-auto "
        className="grid sm:grid-cols-2 gap-6 sm:min-h-screen relative mx-auto w-full container px-4"
      >
        <Aside />
        <main //className="flex flex-col gap-20 scroll-smooth pb-20 pr-0 sm:py-20 xl:pr-20 lg:pr-10"
          className="grid gap-20 py-20"
        >
          <About about={about}/>
          <Hability tech={tech}/>
          <Projects projects={{projectsPersonal, projectsGroup}}/>
          <Contact />
        </main>
      </section>
    </>
  )
}
interface Link {
  link_type: string;
  url?: string;
}
export const getServerSideProps: GetServerSideProps = async () => {
  const prismic = getPrismicClient()
  
  const responseProject = await prismic.getAllByType("project", { fetch: [], pageSize: 50 })
  const responseTechs = await prismic.getAllByType("tech", { fetch: [], pageSize: 50 })
  const {results: responseAbout} = await prismic.getByType("about", { fetch: [], pageSize: 50 })

  
  const [about] = responseAbout.map((response) => {
    return {
      text: RichText.asHtml(response.data.text)
        .replace(/<p>/g, "<p class='text-base text-white' id='about'>")
        .replace(/<strong>/g, "<strong class='text-red-600 font-medium'>")
    }})
  
  const projects = responseProject.map(response => {
    const content = response.data
    return {
      id: response.uid,
      title: RichText.asText(content.title),
      text: content.text,
      techs: content.techs,
      image: { alt: content.image.alt, src: content.image.url },
      src: (content.src as Link)?.url || null,
      github: (content.github as Link)?.url || null,
      type: content.type,
      order: content.order
    }
  })
  
  
  const tech = responseTechs.map(response => {
    const { data } = response
    return data
  }).sort((data, b) => data.order && b.order ? data.order - b.order: 0 )
  
  
  const projectsPersonal = projects.filter(project => project.type === 'personal')
  .sort((project, p) => (project.order && p.order ? -(project.order - p.order) : 0))
  const projectsGroup = projects.filter(project => project.type === 'group')
  .sort((project, p) => (project.order && p.order ? -(project.order - p.order) : 0))
  
  
  return {
    props: { projectsPersonal, projectsGroup, about, tech },
  }
}