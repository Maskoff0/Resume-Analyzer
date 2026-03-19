import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "constants/index";
import Resumecard from "~/components/Resumecard";
import { usePuterStore } from "lib/puter";
import { useEffect } from "react";
import {  useNavigate } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumPro" },
    { name: "description", content: "Let's Find Your Dream Job!" },
  ];
}

export default function Home() {

   const { auth } =usePuterStore();
   const navigate = useNavigate();
  
   useEffect(() => {
        if(!auth.isAuthenticated)navigate('/auth?next=/')
      },[auth.isAuthenticated])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
     <section className="main-section">
       <div className="page-heading py-16">
         <h1>Track your application & Resume Ratings</h1>
         <h2>Great AI reviews from your resume submissions</h2>
       </div>
      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <Resumecard key={resume.id} resume={resume}/>
          ))}
        </div>
      )}
     </section>
  </main>;
}
