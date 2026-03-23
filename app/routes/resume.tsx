import { resumes } from "constants/index";
import { usePuterStore } from "lib/puter";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router"
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";


export const meta = () => ([
  {title : 'ResumPro | Review ' },
  {name : 'description' , content : 'Detailed oveview of your Resume'},
])

const Resume = () => {

  const {auth ,isLoading , kv , fs} = usePuterStore();
  const {id} = useParams();
  const [resumeURL , setResumeURL] = useState('')
  const [imageURL , setImageURL] = useState('')
  const [feedback , setfeedback] = useState<Feedback | null>(null)
  const navigate = useNavigate();

   useEffect(() => {
          if(!isLoading && !auth.isAuthenticated)navigate(`/auth?next=/resume/:${id}`)
        },[isLoading])
  

  useEffect(()=>{
    const LoadResume = async() => {
     const resume = await kv.get(`resume:${id}`)

     if(!resume) return;

     const data = JSON.parse(resume)

     const resumeBlob = await fs.read(data.resumePath)

     if(!resumeBlob) return

     const BloB = new Blob([resumeBlob] ,{type : 'application/pdf'})
     
     const resumeURL = URL.createObjectURL(BloB)
     setResumeURL(resumeURL)

     const imageBlob = await fs.read(data.imagePath)
     if(!imageBlob) return
     const imageURL = URL.createObjectURL(imageBlob)
     setImageURL(imageURL)

     setfeedback(data.feedback)
     console.log({imageURL , resumeURL , feedback : data.feedback})
    }
    LoadResume()
  },[id])

  return (
    <main className="!p-0">
     <nav className="resume-nav">
        <Link to='/' className="back-button">
            <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5"/>
            <span className="text-gray-800 text-sm font-semibold">Back to HomePage</span>
        </Link>
     </nav>
     <div className="flex flex-row w-full max-lg:flex-col-reverse">
       <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageURL && resumeURL && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
               <a  href ={resumeURL} target = '_blank' rel="noopener noreferrer">
                <img src={imageURL} 
                     className="w-full h-full object-contain rounded-2xl"
                     title = 'resume'/>
               </a>
            </div>
          )}
       </section>
       <section className="feedback-section">
         <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
         {feedback ? (
           <div className="flex flex-col gap-8 animate-in fade-in">
              <Summary feedback = {feedback}/>
              <ATS score={feedback.ATS?.score || 0} suggestions = {feedback.ATS?.tips || []} />
              <Details feedback = {feedback}/>
           </div>
         ):(
          <img src="/images/resume-scan-2.gif" className="w-full"/>
         )}
       </section>
     </div>
    </main>
  )
}

export default Resume