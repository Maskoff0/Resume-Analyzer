import { Link } from "react-router"
import ScoreCircle from "./ScoreCircle"
import { usePuterStore } from "lib/puter"
import { useState , useEffect} from "react";


const Resumecard = ({resume : {id, companyName,jobTitle, feedback, imagePath}} : {resume : Resume}) => {
     const {fs} = usePuterStore();
     const [resumeURL , setresumeURL] = useState('');

        useEffect(() => {
          const LoadResume = async () => {
            const Blob = await fs.read(imagePath);
            if(!Blob) return;
            let url =URL.createObjectURL(Blob)
            setresumeURL(url);
          }
          
          LoadResume()
        },[imagePath])

  return (
    <Link to = {`/resume/${id}`} className="resume-card animate-in fade-in diration-1000">
         <div className="resume-card-header">           
            <div className="flex flex-col gap-2">
               {companyName && <h3 className="!text-black font-bold break-words">
                    {companyName}
                </h3>}
                {jobTitle && <h2 className="text-lg break-words text-gray-600">
                    {jobTitle}
                </h2>}
                {!companyName && !jobTitle &&<h2 className="!text-black font-bold">Resume</h2>}
            </div>
            <div className="flex-shrink-0">
                <ScoreCircle score={feedback.overallScore}/>
            </div>
        </div>
        {resumeURL && (<div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full h-full">
                <img
                  src= {imagePath}
                  alt="resume.png"
                  className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"/>
            </div>
        </div>
        )}
    </Link>
  )
}

export default Resumecard