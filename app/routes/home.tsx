import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import Resumecard from "~/components/Resumecard";
import { usePuterStore } from "lib/puter";
import { useEffect, useState } from "react";
import {  useNavigate } from "react-router";
import {Link} from "react-router"


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumPro" },
    { name: "description", content: "Let's Find Your Dream Job!" },
  ];
}

export default function Home() {

   const { auth , kv } =usePuterStore();
   const navigate = useNavigate();
   const [resumes , setResume] = useState<Resume[]>([]);
   const [isLoading, setisLoading] = useState(false);


   useEffect(() => {
    const LoadingResume = async() => {
      setisLoading(true)

      const resumes = (await kv.list('resume:*' , true))as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResume(parsedResumes || []);
      setisLoading(false)
    }

    LoadingResume()
   })
  
   useEffect(() => {
        if(!auth.isAuthenticated)navigate('/auth?next=/')
      },[auth.isAuthenticated])


  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
     <section className="main-section">
       <div className="page-heading py-16">
         <h1>Track your application & Resume Ratings</h1>
         {!isLoading && resumes?.length === 0 ? (
          <h2>No Resume Found...Please Upload a Resume</h2>
         ):(
           <h2>Great AI reviews from your resume submissions</h2>
         )}
         {isLoading && (
          <div className = "flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
          </div>
         )}
       </div>
      {!isLoading && resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <Resumecard key={resume.id} resume={resume}/>
          ))}
        </div>
      )}

      {!isLoading && resumes?.length === 0 && (
         <div className="flex flex-col items-center justify-center mt-10 gap-4">
           <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
           </Link>
         </div>
      )}
     </section>
  </main>;
}
