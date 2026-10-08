import OpenAI from "openai";
export default async function handler(req,res){
 if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
 const {message}=req.body||{};
 if(typeof message!=="string"||!message.trim()) return res.status(400).json({error:"A message is required."});
 if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:"AI service is not configured."});
 try{const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});const response=await client.responses.create({model:process.env.OPENAI_MODEL||"gpt-5",instructions:"You are the Zenith Hackers Intelligence blog assistant. Explain cybersecurity, OSINT, fraud-awareness and digital-asset topics safely and educationally. Do not help with unauthorized access, credential theft, malware deployment or evasion.",input:message});return res.status(200).json({reply:response.output_text});}catch(error){return res.status(500).json({error:"AI request failed."});}
}