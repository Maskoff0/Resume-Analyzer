import { convertPdfToImage } from "lib/pdftoimage"
import { usePuterStore } from "lib/puter"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import FileUploader from "~/components/FileUploader"
import Navbar from "~/components/Navbar"
import { generateUUID } from "utils/utils"
import { prepareInstructions } from "constants/index"



const upload = () => {
    const {auth , isLoading , fs , ai , kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText , setStatusText] = useState('')
    const [file , setFile] = useState<File | null>( null)

   const handleAnalyze = async({company_name , jobTitle , jobDescription , file} : {company_name : string , jobTitle : string , jobDescription : string , file : File})=>{
       setIsProcessing(true);

       setStatusText('Uploading the File ....')
       const UploadFile = await fs.upload([file])
       if(!UploadFile)return setStatusText('Failed to Upload file....')
 
        setStatusText('Converting to Image...')
        const ImageFile = await convertPdfToImage(file);
        if(!ImageFile.file) return setStatusText('Error : Failed to convert PDF to Image')
 
       setStatusText('Uploading the Image...')
       const uploadedImage = await fs.upload([ImageFile.file])
       if(!uploadedImage) return setStatusText('Failed to Upload Image')

       setStatusText('Preparing Data...')
       const uuid = generateUUID();
       const data = {
        id : uuid,
        resumePath:UploadFile.path,
        imagePath: uploadedImage.path,
        company_name, jobTitle , jobDescription,
        feedback: '',
       }
       await kv.set(`resume:${uuid}`,JSON.stringify(data))

       setStatusText('analyzing....')

       const feedback = await ai.feedback(
        UploadFile.path,
        prepareInstructions({jobTitle , jobDescription})

       )
       if(!feedback) return setStatusText('Error : Failed to Analyze Resume...')

        const feedbackText = typeof feedback.message.content === "string"
         ? feedback.message.content
         : feedback.message.content[0].text

         data.feedback = JSON.parse(feedbackText);
         await kv.set(`resume:${uuid}`,JSON.stringify(data))
         setStatusText('Analysis Complete, redirecting...')
         navigate(`/resume/${uuid}`)

       

   }

    const handlefileSelect = (file : File | null) => {
       setFile(file)
    }

    const handleSubmit = (e : FormEvent) => {
      e.preventDefault();
      const form = e.currentTarget.closest('form')
      if(!form) return;
      const formData = new FormData(form);

      const company_name = formData.get('company-name')as string;
      const jobTitle = formData.get('job-title')as string;
      const jobDescription = formData.get('description')as string;

      if(!file) return ;

      handleAnalyze({company_name, jobDescription, jobTitle , file})
    }
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Smart Feedback for Your Dream Job</h1>
                {isProcessing ? (
                    <>
                    <h2>{statusText}</h2>
                    <img src='/images/resume-scan.gif' className="w-full"/>
                    </>
                ) : (
                    <h2>Drop Your Resume For an ATS score and improvement Tips</h2>
                )}
                {!isProcessing && (
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                        <div className="form-div">
                            <label htmlFor="company-name">Company's Name</label>
                            <input type="text" name="company-name" placeholder="Company's Name" id="company-name" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Description</label>
                            <textarea rows={5} name="description" placeholder="Description" id="description" />
                        </div>

                        <div className="form-div">
                            <label htmlFor="Uploader">Upload Resume</label>
                            <FileUploader onFileSelect={handlefileSelect}/>
                        </div>

                        <button className="primary-button" type="submit">
                            Analyze Resume
                        </button>
                    </form>
                )}
            </div>
        </section>
     </main>
  )
}

export default upload